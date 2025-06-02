// src/routes/api/prompts/+server.ts - Clean CRUD operations
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
			.orderBy('category')
			.orderBy('title')
			.get();

		// Get user's custom prompts
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts');
		const userSnapshot = await userPromptsRef
			.where('active', '==', true)
			.orderBy('category')
			.orderBy('title')
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
		const { title, description, content, category } = data;
		if (!title || !content || !category) {
			return json({ error: 'Missing required fields: title, content, category' }, { status: 400 });
		}

		// Generate ID from title
		const id = title.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '-')
			.substring(0, 50);

		if (!id) {
			return json({ error: 'Invalid title - cannot generate ID' }, { status: 400 });
		}

		// Create user prompt
		const userPromptRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts')
			.doc(id);

		// Check if ID already exists
		const existingDoc = await userPromptRef.get();
		if (existingDoc.exists) {
			return json({ error: 'A prompt with this title already exists' }, { status: 409 });
		}

		const promptData = {
			id,
			title: title.trim(),
			description: (description || '').trim(),
			content: content.trim(),
			category,
			metadata: {
				tier: 'free', // User prompts are always free
				tags: data.metadata?.tags || [],
				usage: 0
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
				...(data.metadata?.tags || [])
			].filter(Boolean)
		};

		await userPromptRef.set(promptData);

		return json({
			success: true,
			prompt: {
				...promptData,
				createdAt: promptData.createdAt.toISOString(),
				updatedAt: promptData.updatedAt.toISOString()
			},
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

		const { id, title, description, content, category } = data;
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

		// Build update data
		const updateData: any = {
			updatedAt: new Date()
		};

		if (title) updateData.title = title.trim();
		if (description !== undefined) updateData.description = description.trim();
		if (content) updateData.content = content.trim();
		if (category) updateData.category = category;

		// Update search terms if any text fields changed
		if (title || description !== undefined || content || category) {
			const existingData = existingDoc.data();
			updateData.searchTerms = [
				id.toLowerCase(),
				(title || existingData.title).toLowerCase(),
				(description !== undefined ? description : existingData.description || '').toLowerCase(),
				(category || existingData.category).toLowerCase(),
				...(existingData.metadata?.tags || [])
			].filter(Boolean);
		}

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

		return json({
			success: true,
			message: 'Prompt deleted successfully'
		});

	} catch (error) {
		console.error('Error deleting user prompt:', error);
		return json({ error: 'Failed to delete prompt' }, { status: 500 });
	}
}