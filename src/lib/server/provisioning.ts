// src/lib/server/provisioning.ts - COMPLETE VERSION
import { adminFirestore } from './firebase-admin';

interface UserProvisioningData {
	uid: string;
	email: string;
	displayName?: string;
	photoURL?: string;
}

/**
 * Copy system prompts to user's personal collection
 */
async function provisionUserPrompts(uid: string): Promise<boolean> {
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

		// Copy to user's collection
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(uid)
			.collection('prompts');

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
		console.log(`✅ Copied ${copiedCount} default prompts for user ${uid}`);
		return true;

	} catch (error) {
		console.error(`❌ Failed to provision prompts for user ${uid}:`, error);
		return false;
	}
}

/**
 * Check if user has prompts
 */
async function userHasPromptsProvisioned(uid: string): Promise<boolean> {
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
 * MAIN PROVISIONING FUNCTION
 */
export async function provisionUserComplete(authUser: UserProvisioningData) {
	console.log(`🆕 Complete provisioning for: ${authUser.email}`);

	const userRef = adminFirestore.collection('users').doc(authUser.uid);
	const now = new Date();

	try {
		const existingDoc = await userRef.get();

		if (existingDoc.exists) {
			// Existing user - update login info
			await userRef.update({
				lastLoginDate: now,
				updatedAt: now,
				email: authUser.email,
				displayName: authUser.displayName || null,
				photoURL: authUser.photoURL || null,
			});

			console.log(`✅ Updated existing user: ${authUser.email}`);

			// Check prompt migration
			const hasPrompts = await userHasPromptsProvisioned(authUser.uid);
			if (!hasPrompts) {
				console.log(`📋 Migrating existing user to prompt system`);
				await provisionUserPrompts(authUser.uid);
			}

			return {
				...existingDoc.data(),
				isNewUser: false,
				promptsProvisioned: true
			};
		}

		// NEW USER - create with trial
		const newUserData = {
			uid: authUser.uid,
			email: authUser.email,
			displayName: authUser.displayName || null,
			photoURL: authUser.photoURL || null,
			tier: 'trial',
			pro: false,
			trialStartDate: now,
			elementsUsed: 0,
			createdAt: now,
			updatedAt: now,
			lastLoginDate: now,
			signupSource: 'google-auth',
		};

		await userRef.set(newUserData);
		const promptsProvisioned = await provisionUserPrompts(authUser.uid);

		console.log(`✅ New user created: ${authUser.email}, prompts: ${promptsProvisioned}`);

		return {
			...newUserData,
			isNewUser: true,
			promptsProvisioned
		};

	} catch (error) {
		console.error(`❌ User provisioning failed:`, error);
		throw error;
	}
}