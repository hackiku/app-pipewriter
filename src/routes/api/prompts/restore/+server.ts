// ====================================================================
// src/routes/api/prompts/restore/+server.ts - RESTORE ENDPOINTS
// ====================================================================

/**
 * POST /api/prompts/restore - Restore deleted prompt or restore to system default
 */
export async function POST({ request, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const { promptId, restoreType = 'undelete' } = await request.json();

		if (!promptId) {
			return json({ error: 'Prompt ID required' }, { status: 400 });
		}

		if (restoreType === 'undelete') {
			// Restore deleted prompt
			const userPromptRef = adminFirestore
				.collection('users')
				.doc(uid)
				.collection('prompts')
				.doc(promptId);

			const existingDoc = await userPromptRef.get();
			if (!existingDoc.exists || existingDoc.data()?.active !== false) {
				return json({ error: 'No deleted prompt found with this ID' }, { status: 404 });
			}

			await userPromptRef.update({
				active: true,
				restoredAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null
			});

			console.log(`♻️ Restored deleted prompt: ${promptId}`);

			return json({
				success: true,
				message: 'Prompt restored from trash',
				promptId,
				action: 'undelete'
			});

		} else if (restoreType === 'default') {
			// Restore to system default
			const systemPromptRef = adminFirestore.collection('prompts').doc(promptId);
			const systemDoc = await systemPromptRef.get();

			if (!systemDoc.exists || !systemDoc.data()?.isSystem) {
				return json({ error: 'System prompt not found' }, { status: 404 });
			}

			const systemPrompt = systemDoc.data()!;
			const userPromptRef = adminFirestore
				.collection('users')
				.doc(uid)
				.collection('prompts')
				.doc(promptId);

			const userPrompt = {
				id: promptId,
				title: systemPrompt.title,
				content: systemPrompt.content,
				category: systemPrompt.category,
				metadata: {
					tier: 'free',
					tags: systemPrompt.metadata?.tags || [],
					usage: 0,
					isDefault: true,
					originalSystemId: promptId
				},
				active: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				restoredAt: new Date(),
				createdBy: uid,
				searchTerms: [
					promptId.toLowerCase(),
					systemPrompt.title.toLowerCase(),
					systemPrompt.content.toLowerCase(),
					systemPrompt.category.toLowerCase(),
					...(systemPrompt.metadata?.tags || [])
				].filter(Boolean)
			};

			await userPromptRef.set(userPrompt);

			console.log(`🔄 Restored prompt to system default: ${systemPrompt.title}`);

			return json({
				success: true,
				message: 'Prompt restored to system default',
				promptId,
				promptTitle: systemPrompt.title,
				action: 'default'
			});
		} else {
			return json({ error: 'Invalid restore type' }, { status: 400 });
		}

	} catch (error) {
		console.error('Error restoring prompt:', error);
		return json({
			error: 'Failed to restore prompt',
			details: error.message
		}, { status: 500 });
	}
}

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