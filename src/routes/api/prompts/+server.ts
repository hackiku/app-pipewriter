// src/routes/api/prompts/+server.ts - USER PROMPTS ONLY VERSION
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

/**
 * GET /api/prompts - Get user's prompts (SIMPLIFIED - only user prompts)
 */
export async function GET({ locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		console.log('📦 Loading user prompts...');

		// SIMPLIFIED: Only query user's prompts
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts');

		const userSnapshot = await userPromptsRef
			.where('active', '==', true)
			.orderBy('category')
			.orderBy('title')
			.get();

		console.log(`📦 Found ${userSnapshot.size} user prompts`);

		// Convert to serializable format
		const allPrompts = userSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
			createdAt: doc.data().createdAt?.toDate()?.toISOString(),
			updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
		}));

		// Group by category
		const promptsByCategory = {};
		allPrompts.forEach(prompt => {
			if (!promptsByCategory[prompt.category]) {
				promptsByCategory[prompt.category] = [];
			}
			promptsByCategory[prompt.category].push(prompt);
		});

		// Sort within categories
		Object.keys(promptsByCategory).forEach(category => {
			promptsByCategory[category].sort((a, b) => a.title.localeCompare(b.title));
		});

		console.log(`✅ Loaded prompts: ${Object.entries(promptsByCategory).map(([cat, prompts]) => `${cat}:${prompts.length}`).join(', ')}`);

		return json({
			success: true,
			prompts: promptsByCategory,
			stats: {
				total: allPrompts.length,
				categories: Object.keys(promptsByCategory).length
			}
		});

	} catch (error) {
		console.error('Error getting user prompts:', error);
		return json({ error: 'Failed to get prompts' }, { status: 500 });
	}
}

/**
 * POST /api/prompts - Create new user prompt
 */
export async function POST({ request, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const data = await request.json();

		const { id, title, content, category, metadata } = data;
		if (!id || !title || !content || !category) {
			return json({ error: 'Missing required fields: id, title, content, category' }, { status: 400 });
		}

		// Check if ID already exists
		const userPromptRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts')
			.doc(id);

		const existingDoc = await userPromptRef.get();
		if (existingDoc.exists) {
			return json({ error: 'Prompt with this ID already exists' }, { status: 409 });
		}

		// Create prompt
		const promptData = {
			id,
			title,
			content,
			category,
			metadata: {
				tier: 'free', // All user prompts are free
				tags: metadata?.tags || [],
				usage: 0,
				isDefault: false, // User created, not from defaults
				...metadata
			},
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: uid,
			searchTerms: [
				id.toLowerCase(),
				title.toLowerCase(),
				content.toLowerCase(),
				category.toLowerCase(),
				...(metadata?.tags || [])
			].filter(Boolean)
		};

		await userPromptRef.set(promptData);

		console.log(`✅ Created user prompt: ${title} (${category})`);

		return json({
			success: true,
			prompt: promptData,
			message: 'Prompt created successfully'
		});

	} catch (error) {
		console.error('Error creating user prompt:', error);
		return json({ error: 'Failed to create prompt' }, { status: 500 });
	}
}

/**
 * PUT /api/prompts - Update existing user prompt
 */
export async function PUT({ request, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const data = await request.json();

		const { id, title, content, category, metadata } = data;
		if (!id) {
			return json({ error: 'Prompt ID required' }, { status: 400 });
		}

		const userPromptRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts')
			.doc(id);

		// Check if prompt exists
		const existingDoc = await userPromptRef.get();
		if (!existingDoc.exists) {
			return json({ error: 'Prompt not found' }, { status: 404 });
		}

		// Update fields
		const updateData = {
			...(title && { title }),
			...(content && { content }),
			...(category && { category }),
			...(metadata && { metadata: { ...existingDoc.data().metadata, ...metadata } }),
			updatedAt: new Date(),
			searchTerms: [
				id.toLowerCase(),
				(title || existingDoc.data().title).toLowerCase(),
				(content || existingDoc.data().content || '').toLowerCase(),
				(category || existingDoc.data().category).toLowerCase(),
				...(metadata?.tags || existingDoc.data().metadata?.tags || [])
			].filter(Boolean)
		};

		await userPromptRef.update(updateData);

		console.log(`✅ Updated user prompt: ${id}`);

		return json({
			success: true,
			message: 'Prompt updated successfully'
		});

	} catch (error) {
		console.error('Error updating user prompt:', error);
		return json({ error: 'Failed to update prompt' }, { status: 500 });
	}
}

/**
 * DELETE /api/prompts - HARD delete user prompt (no restore needed)
 */
export async function DELETE({ url, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const promptId = url.searchParams.get('id');

		if (!promptId) {
			return json({ error: 'Prompt ID required' }, { status: 400 });
		}

		const userPromptRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts')
			.doc(promptId);

		// Check if prompt exists
		const existingDoc = await userPromptRef.get();
		if (!existingDoc.exists) {
			return json({ error: 'Prompt not found' }, { status: 404 });
		}

		// Hard delete (no restore needed since users can recreate)
		await userPromptRef.delete();

		console.log(`🗑️ Deleted user prompt: ${promptId}`);

		return json({
			success: true,
			message: 'Prompt deleted successfully'
		});

	} catch (error) {
		console.error('Error deleting user prompt:', error);
		return json({ error: 'Failed to delete prompt' }, { status: 500 });
	}
}

/**
 * REMOVED:
 * - All merging logic with system prompts
 * - isSystem/isUserCustom flags
 * - Restore endpoints (no longer needed)
 * - Complex access control (all user prompts are editable)
 * - Soft delete (users can just recreate prompts)
 */