// src/lib/server/user-features.ts
import { adminFirestore } from '$lib/server/firebase-admin';

const TRIAL_PERIOD_DAYS = 14;

export interface UserFeatures {
	tier: 'free' | 'trial' | 'pro';
	isPro: boolean;
	trialActive: boolean;
	trialDaysLeft: number;
	features: {
		canUseAI: boolean;
		canExport: boolean;
		canCustomize: boolean;
		canUseTrialElements: boolean;
		canUseProElements: boolean;
		maxProjects: number;
	};
}

export async function getUserWithFeatures(uid: string): Promise<UserFeatures> {
	try {
		const userDoc = await adminFirestore.collection('users').doc(uid).get();

		if (!userDoc.exists) {
			// Return default free user
			return getDefaultUserFeatures();
		}

		const userData = userDoc.data()!;
		const isPro = userData.pro === true;

		// Calculate trial status
		let trialActive = false;
		let trialDaysLeft = 0;

		if (!isPro && userData.trialStartDate) {
			const trialStartDate = userData.trialStartDate.toDate();
			const currentDate = new Date();
			const diffTime = currentDate.getTime() - trialStartDate.getTime();
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
			trialDaysLeft = Math.max(0, TRIAL_PERIOD_DAYS - diffDays);
			trialActive = trialDaysLeft > 0;
		}

		// Determine tier
		const tier = isPro ? 'pro' : (trialActive ? 'trial' : 'free');

		// Calculate features based on tier
		const features = calculateFeatures(tier);

		return {
			tier,
			isPro,
			trialActive,
			trialDaysLeft,
			features
		};

	} catch (error) {
		console.error('Error getting user features:', error);
		return getDefaultUserFeatures();
	}
}

function calculateFeatures(tier: 'free' | 'trial' | 'pro') {
	switch (tier) {
		case 'pro':
			return {
				canUseAI: true,
				canExport: true,
				canCustomize: true,
				canUseTrialElements: true,
				canUseProElements: true,
				maxProjects: 999
			};

		case 'trial':
			return {
				canUseAI: true,
				canExport: true,
				canCustomize: true,
				canUseTrialElements: true,
				canUseProElements: false,
				maxProjects: 10
			};

		default: // free
			return {
				canUseAI: false,
				canExport: false,
				canCustomize: false,
				canUseTrialElements: false,
				canUseProElements: false,
				maxProjects: 3
			};
	}
}

function getDefaultUserFeatures(): UserFeatures {
	return {
		tier: 'free',
		isPro: false,
		trialActive: false,
		trialDaysLeft: 0,
		features: calculateFeatures('free')
	};
}