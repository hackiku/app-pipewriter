// src/routes/api/prompts/restore/+server.ts
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

/**
 * POST /api/prompts/restore - Restore system prompts to defaults
 * Body: { promptId?: string } - if promptId provided, restore specific prompt; otherwise restore all
 */
export async function POST({ request, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const { promptId } = await request.json().catch(() => ({}));

		if (promptId) {
			// Restore specific system prompt by deleting user's custom version
			const systemPromptRef = adminFirestore.collection('prompts').doc(promptId);
			const systemDoc = await systemPromptRef.get();

			if (!systemDoc.exists || !systemDoc.data()?.isSystem) {
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
				message: 'Prompt restored to system default',
				promptId
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
				message: `Restored ${userSnapshot.size} prompts to system defaults`,
				count: userSnapshot.size
			});
		}

	} catch (error) {
		console.error('Error restoring prompts:', error);
		return json({
			error: 'Failed to restore prompts',
			details: error.message
		}, { status: 500 });
	}
}