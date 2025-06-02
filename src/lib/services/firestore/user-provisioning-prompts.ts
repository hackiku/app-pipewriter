// src/lib/services/firestore/user-provisioning-prompts.ts
import { adminFirestore } from '$lib/server/firebase-admin';

/**
 * Copy all system prompts to new user's personal collection
 * This eliminates the need for complex merging logic later
 */
export async function provisionUserPrompts(uid: string): Promise<boolean> {
	try {
		console.log(`📋 Provisioning prompts for user ${uid}...`);

		// Get all system prompts
		const systemPromptsRef = adminFirestore.collection('prompts');
		const systemSnapshot = await systemPromptsRef
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.get();

		if (systemSnapshot.empty) {
			console.log('⚠️ No system prompts found to copy');
			return true;
		}

		// Copy prompts to user's collection
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts');

		const batch = adminFirestore.batch();
		let copiedCount = 0;

		systemSnapshot.docs.forEach(doc => {
			const systemPrompt = doc.data();

			// Create user version with same ID but marked as user prompt
			const userPromptRef = userPromptsRef.doc(doc.id);

			const userPrompt = {
				id: doc.id,
				title: systemPrompt.title,
				content: systemPrompt.content,
				category: systemPrompt.category,
				metadata: {
					tier: 'free', // All user prompts are free to edit
					tags: systemPrompt.metadata?.tags || [],
					usage: 0,
					isDefault: true, // Mark as copied from defaults
					originalSystemId: doc.id // Track original for updates
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

		// Execute batch write
		await batch.commit();

		console.log(`✅ Copied ${copiedCount} default prompts for user ${uid}`);
		return true;

	} catch (error) {
		console.error(`❌ Failed to provision prompts for user ${uid}:`, error);
		return false;
	}
}

/**
 * Check if user already has prompts provisioned
 */
export async function userHasPromptsProvisioned(uid: string): Promise<boolean> {
	try {
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts');

		const snapshot = await userPromptsRef.limit(1).get();
		return !snapshot.empty;

	} catch (error) {
		console.error(`Error checking prompts for user ${uid}:`, error);
		return false;
	}
}

/**
 * Update user prompts when system prompts change (optional feature)
 * This can be called when system prompts are updated to offer users new defaults
 */
export async function syncNewSystemPrompts(uid: string): Promise<number> {
	try {
		console.log(`🔄 Syncing new system prompts for user ${uid}...`);

		// Get current system prompts
		const systemPromptsRef = adminFirestore.collection('prompts');
		const systemSnapshot = await systemPromptsRef
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.get();

		// Get user's existing prompts
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts');

		const userSnapshot = await userPromptsRef.get();
		const existingIds = new Set(userSnapshot.docs.map(doc => doc.id));

		// Find new system prompts that user doesn't have
		const batch = adminFirestore.batch();
		let newPromptsCount = 0;

		systemSnapshot.docs.forEach(doc => {
			if (!existingIds.has(doc.id)) {
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
						originalSystemId: doc.id,
						isNew: true // Mark as newly added
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
				newPromptsCount++;
			}
		});

		if (newPromptsCount > 0) {
			await batch.commit();
			console.log(`✅ Added ${newPromptsCount} new default prompts for user ${uid}`);
		}

		return newPromptsCount;

	} catch (error) {
		console.error(`❌ Failed to sync new prompts for user ${uid}:`, error);
		return 0;
	}
}