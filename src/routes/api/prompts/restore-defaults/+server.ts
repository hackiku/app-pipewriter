// src/routes/api/prompts/restore-defaults/+server.ts - FIXED
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

/**
 * POST /api/prompts/restore-defaults
 * Restore user's prompts to system defaults (re-provision)
 * Body: { promptId?: string, force?: boolean } - if provided, restore specific prompt; otherwise restore all
 */
export async function POST({ request, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const { promptId, force = false } = await request.json().catch(() => ({}));

		console.log(`🔄 Restoring prompts for user ${uid}...`);

		if (promptId) {
			// Restore specific prompt
			const result = await restoreSpecificPrompt(uid, promptId);
			return json(result);
		} else {
			// Restore all prompts (re-provision)
			const result = await restoreAllPrompts(uid, force);
			return json(result);
		}

	} catch (error) {
		console.error('❌ Prompt restoration failed:', error);
		return json({
			success: false,
			error: 'Failed to restore prompts',
			details: error.message
		}, { status: 500 });
	}
}

/**
 * Restore specific prompt to system default
 */
async function restoreSpecificPrompt(uid: string, promptId: string) {
	// Get system prompt
	const systemPromptRef = adminFirestore.collection('prompts').doc(promptId);
	const systemDoc = await systemPromptRef.get();

	if (!systemDoc.exists || !systemDoc.data()?.isSystem) {
		return {
			success: false,
			error: 'System prompt not found',
			promptId
		};
	}

	// Copy system prompt to user's collection
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

	console.log(`✅ Restored prompt: ${systemPrompt.title}`);

	return {
		success: true,
		promptId,
		promptTitle: systemPrompt.title,
		message: 'Prompt restored to default'
	};
}

/**
 * Restore all prompts (full re-provisioning)
 */
async function restoreAllPrompts(uid: string, force: boolean) {
	// Get current user prompts count
	const userPromptsRef = adminFirestore
		.collection('users')
		.doc(uid)
		.collection('prompts');

	const existingSnapshot = await userPromptsRef.get();
	const existingCount = existingSnapshot.size;

	if (existingCount > 0 && !force) {
		return {
			success: false,
			error: 'User already has prompts',
			message: 'Use force=true to overwrite existing prompts',
			existingCount
		};
	}

	// Get all system prompts
	const systemPromptsRef = adminFirestore.collection('prompts');
	const systemSnapshot = await systemPromptsRef
		.where('active', '==', true)
		.where('isSystem', '==', true)
		.get();

	if (systemSnapshot.empty) {
		return {
			success: false,
			error: 'No system prompts found',
			message: 'Run seeding script to create system prompts first'
		};
	}

	// Clear existing user prompts if force=true
	if (force && existingCount > 0) {
		const batch = adminFirestore.batch();
		existingSnapshot.docs.forEach(doc => batch.delete(doc.ref));
		await batch.commit();
		console.log(`🗑️ Cleared ${existingCount} existing prompts`);
	}

	// Copy system prompts to user collection
	const batch = adminFirestore.batch();
	let copiedCount = 0;

	systemSnapshot.docs.forEach(doc => {
		const systemPrompt = doc.data();
		const userPromptRef = userPromptsRef.doc(doc.id);

		const userPrompt = {
			id: doc.id,
			title: systemPrompt.title,
			content: systemPrompt.content,
			category: systemPrompt.category,
			metadata: {
				tier: 'free',
				tags: systemPrompt.metadata?.tags || [],
				usage: 0,
				isDefault: true,
				originalSystemId: doc.id
			},
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: uid,
			searchTerms: [
				doc.id.toLowerCase(),
				systemPrompt.title.toLowerCase(),
				systemPrompt.content.toLowerCase(),
				systemPrompt.category.toLowerCase(),
				...(systemPrompt.metadata?.tags || [])
			].filter(Boolean)
		};

		batch.set(userPromptRef, userPrompt);
		copiedCount++;
	});

	await batch.commit();

	console.log(`✅ Provisioned ${copiedCount} default prompts for user ${uid}`);

	return {
		success: true,
		copiedCount,
		replacedCount: existingCount,
		message: `Successfully restored ${copiedCount} default prompts`,
		force
	};
}