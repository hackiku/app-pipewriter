// ====================================================================
// src/routes/api/prompts/restore-all/+server.ts
// ====================================================================

/**
 * POST /api/prompts/restore-all - Restore all deleted prompts
 */
export async function POST({ request, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const { restoreType = 'undelete' } = await request.json();

		if (restoreType === 'undelete') {
			// Restore all deleted prompts
			const userPromptsRef = adminFirestore
				.collection('users')
				.doc(uid)
				.collection('prompts');

			const deletedSnapshot = await userPromptsRef
				.where('active', '==', false)
				.get();

			if (deletedSnapshot.empty) {
				return json({
					success: true,
					message: 'No deleted prompts found',
					count: 0
				});
			}

			const batch = adminFirestore.batch();
			deletedSnapshot.docs.forEach(doc => {
				batch.update(doc.ref, {
					active: true,
					restoredAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null
				});
			});

			await batch.commit();

			console.log(`♻️ Restored ${deletedSnapshot.size} deleted prompts for user ${uid}`);

			return json({
				success: true,
				message: `Restored ${deletedSnapshot.size} prompts from trash`,
				count: deletedSnapshot.size,
				action: 'undelete'
			});
		} else {
			return json({ error: 'Invalid restore type for bulk operation' }, { status: 400 });
		}

	} catch (error) {
		console.error('Error restoring all prompts:', error);
		return json({
			error: 'Failed to restore prompts',
			details: error.message
		}, { status: 500 });
	}
}