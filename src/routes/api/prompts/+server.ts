// src/routes/api/prompts/+server.ts - ENHANCED WITH SOFT DELETE
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

/**
 * GET /api/prompts - Get user's prompts (including deleted if requested)
 */
export async function GET({ locals, url }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const includeDeleted = url.searchParams.get('includeDeleted') === 'true';

		console.log('📦 Loading user prompts...', { includeDeleted });

		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts');

		// Build query - include deleted if requested
		let query = userPromptsRef.orderBy('category').orderBy('title');

		if (!includeDeleted) {
			query = query.where('active', '==', true);
		}

		const userSnapshot = await query.get();

		console.log(`📦 Found ${userSnapshot.size} user prompts`);

		// Convert to serializable format with deleted flag
		const allPrompts = userSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
			isDeleted: doc.data().active === false,
			createdAt: doc.data().createdAt?.toDate()?.toISOString(),
			updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
		}));

		// Separate active and deleted prompts
		const activePrompts = allPrompts.filter(p => p.active !== false);
		const deletedPrompts = allPrompts.filter(p => p.active === false);

		// Group active prompts by category
		const promptsByCategory = {};
		activePrompts.forEach(prompt => {
			if (!promptsByCategory[prompt.category]) {
				promptsByCategory[prompt.category] = [];
			}
			promptsByCategory[prompt.category].push(prompt);
		});

		// Sort within categories
		Object.keys(promptsByCategory).forEach(category => {
			promptsByCategory[category].sort((a, b) => a.title.localeCompare(b.title));
		});

		const response = {
			success: true,
			prompts: promptsByCategory,
			stats: {
				total: activePrompts.length,
				deleted: deletedPrompts.length,
				categories: Object.keys(promptsByCategory).length
			}
		};

		// Include deleted prompts if requested
		if (includeDeleted) {
			response.deletedPrompts = deletedPrompts.sort((a, b) =>
				(b.deletedAt || b.updatedAt || '').localeCompare(a.deletedAt || a.updatedAt || '')
			);
		}

		console.log(`✅ Loaded prompts: ${Object.entries(promptsByCategory).map(([cat, prompts]) => `${cat}:${prompts.length}`).join(', ')}`);
		if (deletedPrompts.length > 0) {
			console.log(`🗑️ Found ${deletedPrompts.length} deleted prompts`);
		}

		return json(response);

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

		// Check if ID already exists (including deleted)
		const userPromptRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts')
			.doc(id);

		const existingDoc = await userPromptRef.get();
		if (existingDoc.exists && existingDoc.data()?.active !== false) {
			return json({ error: 'Prompt with this ID already exists' }, { status: 409 });
		}

		// Create or restore prompt
		const promptData = {
			id,
			title,
			content,
			category,
			metadata: {
				tier: 'free',
				tags: metadata?.tags || [],
				usage: 0,
				isDefault: false,
				...metadata
			},
			active: true,
			createdAt: existingDoc.exists ? existingDoc.data()?.createdAt : new Date(),
			updatedAt: new Date(),
			createdBy: uid,
			// Clear deletion fields if restoring
			...(existingDoc.exists && existingDoc.data()?.active === false && {
				deletedAt: null,
				restoredAt: new Date()
			}),
			searchTerms: [
				id.toLowerCase(),
				title.toLowerCase(),
				content.toLowerCase(),
				category.toLowerCase(),
				...(metadata?.tags || [])
			].filter(Boolean)
		};

		await userPromptRef.set(promptData);

		const action = existingDoc.exists ? 'restored' : 'created';
		console.log(`✅ ${action} user prompt: ${title} (${category})`);

		return json({
			success: true,
			prompt: promptData,
			message: `Prompt ${action} successfully`,
			action
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

		const existingDoc = await userPromptRef.get();
		if (!existingDoc.exists || existingDoc.data()?.active === false) {
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
 * DELETE /api/prompts - SOFT delete user prompt
 */
export async function DELETE({ url, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const promptId = url.searchParams.get('id');
		const permanent = url.searchParams.get('permanent') === 'true';

		if (!promptId) {
			return json({ error: 'Prompt ID required' }, { status: 400 });
		}

		const userPromptRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts')
			.doc(promptId);

		const existingDoc = await userPromptRef.get();
		if (!existingDoc.exists) {
			return json({ error: 'Prompt not found' }, { status: 404 });
		}

		if (permanent) {
			// Hard delete
			await userPromptRef.delete();
			console.log(`🗑️ Permanently deleted user prompt: ${promptId}`);

			return json({
				success: true,
				message: 'Prompt permanently deleted',
				permanent: true
			});
		} else {
			// Soft delete
			await userPromptRef.update({
				active: false,
				deletedAt: new Date(),
				updatedAt: new Date()
			});

			console.log(`🗑️ Soft deleted user prompt: ${promptId}`);

			return json({
				success: true,
				message: 'Prompt moved to trash',
				permanent: false
			});
		}

	} catch (error) {
		console.error('Error deleting user prompt:', error);
		return json({ error: 'Failed to delete prompt' }, { status: 500 });
	}
}

