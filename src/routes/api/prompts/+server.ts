// src/routes/api/prompts/+server.ts - Complete CRUD for user prompts
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

		// Get system prompts
		const systemPromptsRef = adminFirestore.collection('prompts');
		const systemSnapshot = await systemPromptsRef
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.get();

		// Get user's custom prompts
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts');
		const userSnapshot = await userPromptsRef
			.where('active', '==', true)
			.get();

		// Merge prompts (user prompts override system prompts with same ID)
		const allPrompts = new Map();

		// Add system prompts first
		systemSnapshot.docs.forEach(doc => {
			allPrompts.set(doc.id, {
				id: doc.id,
				...doc.data(),
				isSystem: true,
				isUserCustom: false,
				createdAt: doc.data().createdAt?.toDate()?.toISOString(),
				updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
			});
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

		return json({
			success: true,
			prompts: promptsByCategory,
			stats: {
				total: allPrompts.size,
				system: systemSnapshot.size,
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

		// Validate required fields
		const { id, title, description, content, category, metadata } = data;
		if (!id || !title || !content || !category) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Create user prompt
		const userPromptRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts')
			.doc(id);

		const promptData = {
			id,
			title,
			description: description || '',
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
				(description || '').toLowerCase(),
				category.toLowerCase(),
				...(metadata?.tags || [])
			].filter(Boolean)
		};

		await userPromptRef.set(promptData);

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

		const { id, title, description, content, category, metadata } = data;
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

		// Update fields
		const updateData = {
			...(title && { title }),
			...(description !== undefined && { description }),
			...(content && { content }),
			...(category && { category }),
			...(metadata && { metadata: { ...existingDoc.data().metadata, ...metadata } }),
			updatedAt: new Date(),
			searchTerms: [
				id.toLowerCase(),
				(title || existingDoc.data().title).toLowerCase(),
				(description || existingDoc.data().description || '').toLowerCase(),
				(category || existingDoc.data().category).toLowerCase(),
				...(metadata?.tags || existingDoc.data().metadata?.tags || [])
			].filter(Boolean)
		};

		await userPromptRef.update(updateData);

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
 * DELETE /api/prompts - Delete user prompt
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

		// Soft delete by marking inactive
		await userPromptRef.update({
			active: false,
			deletedAt: new Date(),
			updatedAt: new Date()
		});

		return json({
			success: true,
			message: 'Prompt deleted successfully'
		});

	} catch (error) {
		console.error('Error deleting user prompt:', error);
		return json({ error: 'Failed to delete prompt' }, { status: 500 });
	}
}

// src/routes/api/prompts/restore/+server.ts - Restore system prompts
export async function POST({ request, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const { promptId } = await request.json();

		if (promptId) {
			// Restore specific system prompt
			const systemPromptRef = adminFirestore.collection('prompts').doc(promptId);
			const systemDoc = await systemPromptRef.get();

			if (!systemDoc.exists || !systemDoc.data().isSystem) {
				return json({ error: 'System prompt not found' }, { status: 404 });
			}

			// Delete user's custom version (if exists)
			const userPromptRef = adminFirestore
				.collection('users')
				.doc(uid)
				.collection('prompts')
				.doc(promptId);

			await userPromptRef.delete();

			return json({
				success: true,
				message: 'Prompt restored to system default'
			});

		} else {
			// Restore all system prompts (delete all user customizations)
			const userPromptsRef = adminFirestore
				.collection('users')
				.doc(uid)
				.collection('prompts');

			const userSnapshot = await userPromptsRef.get();
			const batch = adminFirestore.batch();

			userSnapshot.docs.forEach(doc => {
				batch.delete(doc.ref);
			});

			await batch.commit();

			return json({
				success: true,
				message: `Restored ${userSnapshot.size} prompts to system defaults`
			});
		}

	} catch (error) {
		console.error('Error restoring prompts:', error);
		return json({ error: 'Failed to restore prompts' }, { status: 500 });
	}
}