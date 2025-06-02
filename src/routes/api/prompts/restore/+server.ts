// src/routes/api/prompts/restore/+server.ts - Restore system prompts
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

/**
 * POST /api/prompts/restore - Restore system prompts
 */
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

			if (!systemDoc.exists || !systemDoc.data()?.isSystem) {
				return json({ error: 'System prompt not found' }, { status: 404 });
			}

			// Delete user's custom version (if exists)
			const userPromptRef = adminFirestore
				.collection('users')
				.doc(uid)
				.collection('prompts')
				.doc(promptId);

			const userDoc = await userPromptRef.get();
			if (userDoc.exists) {
				await userPromptRef.delete();
			}

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

			if (userSnapshot.size === 0) {
				return json({
					success: true,
					message: 'No custom prompts to restore'
				});
			}

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