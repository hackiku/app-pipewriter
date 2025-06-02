// src/routes/api/prompts/+server.ts - NO DESCRIPTION VERSION
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

/**
 * GET /api/prompts - Get user's prompts (merged with system prompts)
 */
export async function GET({ locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		console.log('📦 Querying prompts collection...');

		// Get system prompts
		const systemPromptsRef = adminFirestore.collection('prompts');
		const systemSnapshot = await systemPromptsRef
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.get();

		console.log(`📦 Found ${systemSnapshot.size} total active prompts`);

		// Filter system prompts
		const systemPrompts = systemSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
			isSystem: true,
			isUserCustom: false,
			createdAt: doc.data().createdAt?.toDate()?.toISOString(),
			updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
		}));

		console.log(`📦 Filtered to ${systemPrompts.length} system prompts`);

		// Get user's custom prompts
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts');
		const userSnapshot = await userPromptsRef
			.where('active', '==', true)
			.get();

		console.log(`👤 Found ${userSnapshot.size} user custom prompts`);

		// Merge prompts (user prompts override system prompts with same ID)
		const allPrompts = new Map();

		// Add system prompts first
		systemPrompts.forEach(prompt => {
			allPrompts.set(prompt.id, prompt);
		});

		// Override with user prompts
		userSnapshot.docs.forEach(doc => {
			allPrompts.set(doc.id, {
				id: doc.id,
				...doc.data(),
				isSystem: false,
				isUserCustom: true,
				createdAt: doc.data().createdAt?.toDate()?.toISOString(),
				updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
			});
		});

		// Group by category
		const promptsByCategory = {};
		Array.from(allPrompts.values()).forEach(prompt => {
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
				total: allPrompts.size,
				system: systemPrompts.length,
				custom: userSnapshot.size,
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

		// REMOVED description validation
		const { id, title, content, category, metadata } = data;
		if (!id || !title || !content || !category) {
			return json({ error: 'Missing required fields: id, title, content, category' }, { status: 400 });
		}

		// Check if ID already exists in user's prompts
		const userPromptRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts')
			.doc(id);

		const existingDoc = await userPromptRef.get();
		if (existingDoc.exists) {
			return json({ error: 'Prompt with this ID already exists' }, { status: 409 });
		}

		// Create user prompt - REMOVED description
		const promptData = {
			id,
			title,
			content,
			category,
			metadata: {
				tier: 'free', // User prompts are always free
				tags: metadata?.tags || [],
				usage: 0,
				...metadata
			},
			active: true,
			isSystem: false,
			isUserCustom: true,
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

		// REMOVED description from validation
		const { id, title, content, category, metadata } = data;
		if (!id) {
			return json({ error: 'Prompt ID required' }, { status: 400 });
		}

		const userPromptRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts')
			.doc(id);

		// Check if prompt exists and belongs to user
		const existingDoc = await userPromptRef.get();
		if (!existingDoc.exists) {
			return json({ error: 'Prompt not found' }, { status: 404 });
		}

		// Update fields - REMOVED description
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
 * DELETE /api/prompts - Soft delete user prompt
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

		// Soft delete by marking inactive
		await userPromptRef.update({
			active: false,
			deletedAt: new Date(),
			updatedAt: new Date()
		});

		console.log(`🗑️ Soft deleted user prompt: ${promptId}`);

		return json({
			success: true,
			message: 'Prompt deleted successfully'
		});

	} catch (error) {
		console.error('Error deleting user prompt:', error);
		return json({ error: 'Failed to delete prompt' }, { status: 500 });
	}
}