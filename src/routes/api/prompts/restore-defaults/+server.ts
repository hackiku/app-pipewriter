// src/routes/api/prompts/restore-defaults/+server.ts
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

/**
 * POST /api/prompts/restore-defaults
 * Restore user's prompts to system defaults (re-provision)
 * Body: { promptId?: string } - if provided, restore specific prompt; otherwise restore all
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

// ====================================================================
// src/routes/api/admin/reprovision-prompts/+server.ts  
// ====================================================================

import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';
import { dev } from '$app/environment';

/**
 * POST /api/admin/reprovision-prompts
 * Bulk re-provision prompts for multiple users (admin only)
 * Body: { userIds?: string[], all?: boolean, dryRun?: boolean }
 */
export async function POST({ request, locals }) {
	// Admin check (for now, just dev mode)
	if (!dev && !locals.user?.email?.includes('@pipewriter.io')) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { userIds, all = false, dryRun = false, force = false } = await request.json();

		console.log(`🔄 Admin bulk re-provisioning...`);
		console.log(`   All users: ${all}`);
		console.log(`   Specific users: ${userIds?.length || 0}`);
		console.log(`   Dry run: ${dryRun}`);
		console.log(`   Force: ${force}`);

		let targetUserIds: string[] = [];

		if (all) {
			// Get all user IDs
			const usersSnapshot = await adminFirestore.collection('users').get();
			targetUserIds = usersSnapshot.docs.map(doc => doc.id);
			console.log(`📋 Found ${targetUserIds.length} total users`);
		} else if (userIds && Array.isArray(userIds)) {
			targetUserIds = userIds;
		} else {
			return json({
				success: false,
				error: 'Must specify userIds array or all=true'
			}, { status: 400 });
		}

		if (targetUserIds.length === 0) {
			return json({
				success: false,
				error: 'No users to process'
			}, { status: 400 });
		}

		// Safety check for large operations
		if (targetUserIds.length > 100 && !force) {
			return json({
				success: false,
				error: 'Large operation detected',
				message: 'Add force=true to process more than 100 users',
				userCount: targetUserIds.length
			}, { status: 400 });
		}

		// Get system prompts once
		const systemPromptsRef = adminFirestore.collection('prompts');
		const systemSnapshot = await systemPromptsRef
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.get();

		if (systemSnapshot.empty) {
			return json({
				success: false,
				error: 'No system prompts found',
				message: 'Run seeding script first'
			}, { status: 500 });
		}

		const systemPrompts = systemSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		}));

		console.log(`📦 Found ${systemPrompts.length} system prompts to provision`);

		// Process users in batches
		const results = await processUsersInBatches(targetUserIds, systemPrompts, { dryRun, force });

		return json({
			success: true,
			processed: results.processed,
			skipped: results.skipped,
			errors: results.errors,
			totalUsers: targetUserIds.length,
			systemPrompts: systemPrompts.length,
			dryRun,
			force
		});

	} catch (error) {
		console.error('❌ Bulk re-provisioning failed:', error);
		return json({
			success: false,
			error: 'Bulk re-provisioning failed',
			details: error.message
		}, { status: 500 });
	}
}

/**
 * Process users in batches to avoid timeout
 */
async function processUsersInBatches(
	userIds: string[],
	systemPrompts: any[],
	options: { dryRun: boolean, force: boolean }
) {
	const BATCH_SIZE = 10;
	const results = {
		processed: 0,
		skipped: 0,
		errors: [] as { userId: string, error: string }[]
	};

	for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
		const batch = userIds.slice(i, i + BATCH_SIZE);
		console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(userIds.length / BATCH_SIZE)}`);

		await Promise.all(batch.map(async (userId) => {
			try {
				const result = await provisionUserPrompts(userId, systemPrompts, options);
				if (result.success) {
					results.processed++;
				} else {
					results.skipped++;
				}
			} catch (error) {
				results.errors.push({
					userId,
					error: error.message
				});
			}
		}));

		// Small delay between batches
		if (i + BATCH_SIZE < userIds.length) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}

	return results;
}

/**
 * Provision prompts for a single user
 */
async function provisionUserPrompts(
	userId: string,
	systemPrompts: any[],
	options: { dryRun: boolean, force: boolean }
) {
	const userPromptsRef = adminFirestore
		.collection('users')
		.doc(userId)
		.collection('prompts');

	// Check if user already has prompts
	const existingSnapshot = await userPromptsRef.limit(1).get();
	const hasExisting = !existingSnapshot.empty;

	if (hasExisting && !options.force) {
		console.log(`⏭️ Skipping user ${userId} (already has prompts)`);
		return { success: false, reason: 'already_has_prompts' };
	}

	if (options.dryRun) {
		console.log(`🧪 [DRY RUN] Would provision ${systemPrompts.length} prompts for user ${userId}`);
		return { success: true, reason: 'dry_run' };
	}

	// Clear existing if force=true
	if (hasExisting && options.force) {
		const allExisting = await userPromptsRef.get();
		const deleteBatch = adminFirestore.batch();
		allExisting.docs.forEach(doc => deleteBatch.delete(doc.ref));
		await deleteBatch.commit();
		console.log(`🗑️ Cleared ${allExisting.size} existing prompts for user ${userId}`);
	}

	// Provision new prompts
	const batch = adminFirestore.batch();

	systemPrompts.forEach(systemPrompt => {
		const userPromptRef = userPromptsRef.doc(systemPrompt.id);

		const userPrompt = {
			id: systemPrompt.id,
			title: systemPrompt.title,
			content: systemPrompt.content,
			category: systemPrompt.category,
			metadata: {
				tier: 'free',
				tags: systemPrompt.metadata?.tags || [],
				usage: 0,
				isDefault: true,
				originalSystemId: systemPrompt.id
			},
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: userId,
			searchTerms: [
				systemPrompt.id.toLowerCase(),
				systemPrompt.title.toLowerCase(),
				systemPrompt.content.toLowerCase(),
				systemPrompt.category.toLowerCase(),
				...(systemPrompt.metadata?.tags || [])
			].filter(Boolean)
		};

		batch.set(userPromptRef, userPrompt);
	});

	await batch.commit();

	console.log(`✅ Provisioned ${systemPrompts.length} prompts for user ${userId}`);
	return { success: true, count: systemPrompts.length };
}