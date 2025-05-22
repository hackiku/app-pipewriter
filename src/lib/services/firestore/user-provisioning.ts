// src/lib/services/firestore/user-provisioning.ts
import { adminFirestore } from '$lib/server/firebase-admin';
import type { UserRecord } from 'firebase-admin/auth';

interface UserProvisioningData {
	uid: string;
	email: string;
	displayName?: string;
	photoURL?: string;
}

export async function provisionNewUser(authUser: UserProvisioningData) {
	console.log(`🆕 Provisioning new user: ${authUser.email}`);

	const userRef = adminFirestore.collection('users').doc(authUser.uid);

	// Check if user already exists in Firestore
	const existingDoc = await userRef.get();

	// FIXED: Use .exists property, not .exists() method
	if (existingDoc.exists) {
		// User exists, just update login timestamp and basic info
		await userRef.update({
			lastLoginDate: new Date(),
			updatedAt: new Date(),
			// Update auth info in case it changed
			email: authUser.email,
			displayName: authUser.displayName || null,
			photoURL: authUser.photoURL || null,
		});

		console.log(`✅ Updated existing user: ${authUser.email}`);
		return existingDoc.data();
	}

	// New user - create with trial settings
	const newUserData = {
		uid: authUser.uid,
		email: authUser.email,
		displayName: authUser.displayName || null,
		photoURL: authUser.photoURL || null,

		// Subscription & Trial - start everyone with trial
		tier: 'trial',
		pro: false,
		trialStartDate: new Date(),

		// Usage tracking
		projectsCreated: 0,
		elementsUsed: 0,

		// Timestamps
		createdAt: new Date(),
		updatedAt: new Date(),
		lastLoginDate: new Date(),

		// Optional tracking fields (keep minimal)
		signupSource: 'google-auth',
		onboardingCompleted: false,
	};

	await userRef.set(newUserData);

	console.log(`✅ Created new user with trial: ${authUser.email}`);
	return newUserData;
}

// Helper to get user's current tier status
export async function getUserTierStatus(uid: string) {
	const userDoc = await adminFirestore.collection('users').doc(uid).get();

	// FIXED: Use .exists property
	if (!userDoc.exists) {
		return { tier: 'free', daysLeft: 0, isPro: false };
	}

	const userData = userDoc.data()!;

	if (userData.pro) {
		return { tier: 'pro', daysLeft: null, isPro: true };
	}

	// Calculate trial days remaining
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