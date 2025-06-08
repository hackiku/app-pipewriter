// src/lib/server/user-provisioning.ts (SINGLE SERVICE)
import { adminFirestore } from './firebase-admin';
import { provisionUserPrompts, userHasPromptsProvisioned } from './user-provisioning-prompts';

interface UserProvisioningData {
	uid: string;
	email: string;
	displayName?: string;
	photoURL?: string;
}

/**
 * SINGLE ATOMIC OPERATION: Create user + provision prompts
 * Called from session endpoint only
 */
export async function provisionUserComplete(authUser: UserProvisioningData) {
	console.log(`🆕 Complete provisioning for: ${authUser.email}`);

	const userRef = adminFirestore.collection('users').doc(authUser.uid);
	const now = new Date();

	try {
		// Check if user exists
		const existingDoc = await userRef.get();

		if (existingDoc.exists) {
			// Existing user - just update login info
			await userRef.update({
				lastLoginDate: now,
				updatedAt: now,
				// Sync auth info in case it changed
				email: authUser.email,
				displayName: authUser.displayName || null,
				photoURL: authUser.photoURL || null,
			});

			console.log(`✅ Updated existing user: ${authUser.email}`);

			// Check if they need prompt migration
			const hasPrompts = await userHasPromptsProvisioned(authUser.uid);
			if (!hasPrompts) {
				console.log(`📋 Migrating existing user to prompt system: ${authUser.email}`);
				await provisionUserPrompts(authUser.uid);
			}

			return {
				...existingDoc.data(),
				isNewUser: false,
				promptsProvisioned: true
			};
		}

		// NEW USER - create with trial + provision prompts
		const newUserData = {
			uid: authUser.uid,
			email: authUser.email,
			displayName: authUser.displayName || null,
			photoURL: authUser.photoURL || null,

			// Start with trial (your current setup)
			tier: 'trial',
			pro: false,
			trialStartDate: now,

			// Clean tracking (removed unused fields)
			elementsUsed: 0,

			// Timestamps
			createdAt: now,
			updatedAt: now,
			lastLoginDate: now,

			// Minimal metadata
			signupSource: 'google-auth',
		};

		// Create user record
		await userRef.set(newUserData);

		// Provision default prompts
		const promptsProvisioned = await provisionUserPrompts(authUser.uid);

		console.log(`✅ New user created with trial: ${authUser.email}, prompts: ${promptsProvisioned}`);

		return {
			...newUserData,
			isNewUser: true,
			promptsProvisioned
		};

	} catch (error) {
		console.error(`❌ User provisioning failed for ${authUser.email}:`, error);
		throw error;
	}
}

/**
 * Simple tier check helper
 */
export async function getUserTierStatus(uid: string) {
	const userDoc = await adminFirestore.collection('users').doc(uid).get();

	if (!userDoc.exists) {
		return { tier: 'free', daysLeft: 0, isPro: false };
	}

	const userData = userDoc.data()!;

	if (userData.pro) {
		return { tier: 'pro', daysLeft: null, isPro: true };
	}

	// Calculate trial
	const trialStartDate = userData.trialStartDate?.toDate();
	if (!trialStartDate) {
		return { tier: 'free', daysLeft: 0, isPro: false };
	}

	const TRIAL_DURATION_DAYS = 14;
	const now = new Date();
	const diffTime = now.getTime() - trialStartDate.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
	const daysLeft = Math.max(0, TRIAL_DURATION_DAYS - diffDays);

	return {
		tier: daysLeft > 0 ? 'trial' : 'free',
		daysLeft,
		isPro: false
	};
}