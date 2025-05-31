// src/routes/+layout.server.ts - Clean app-wide layout
import type { LayoutServerLoad } from './$types';
import { adminFirestore } from '$lib/server/firebase-admin';

const TRIAL_PERIOD_DAYS = 10;

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// If authenticated, load user data
	if (locals.authenticated && locals.user) {
		try {
			const uid = locals.user.uid;

			// Get user data from Firestore
			const userDoc = await adminFirestore.collection('users').doc(uid).get();
			let userData = userDoc.data() || {};

			// Create user if doesn't exist
			if (!userDoc.exists) {
				console.log(`Creating missing user document for ${uid}`);

				const newUserData = {
					uid: locals.user.uid,
					email: locals.user.email,
					displayName: locals.user.displayName,
					photoURL: locals.user.photoURL,
					tier: 'trial',
					pro: false,
					trialStartDate: new Date(),
					projectsCreated: 0,
					elementsUsed: 0,
					createdAt: new Date(),
					updatedAt: new Date(),
					lastLoginDate: new Date(),
					signupSource: 'server-provision'
				};

				await adminFirestore.collection('users').doc(uid).set(newUserData);
				userData = newUserData;
			}

			// Calculate tier status
			const isPro = userData.pro === true;
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

			// Get feature flags
			const features = getFeatureFlags(isPro, trialActive);
			const userTier = isPro ? 'pro' : (trialActive ? 'trial' : 'free');

			return {
				user: locals.user,
				isPro,
				trialActive,
				trialDaysLeft,
				trialStartDate: userData.trialStartDate ? userData.trialStartDate.toDate() : null,
				features,
				userTier,
				maxProjects: isPro ? 999 : (trialActive ? 10 : 3),
				canExport: isPro || trialActive
			};
		} catch (error) {
			console.error('Error loading user data:', error);
		}
	}

	// Default return for non-authenticated users
	return {
		user: locals.user,
		isPro: false,
		trialActive: false,
		trialDaysLeft: 0,
		userTier: 'free',
		features: getDefaultFeatures()
	};
};

// Feature flags
function getDefaultFeatures() {
	return {
		allowedElements: ['basic'],
		allowAiFeatures: false,
		allowColorCustomization: false,
		allowStyleGuide: false,
		maxProjects: 3,
		canExport: false
	};
}

function getFeatureFlags(isPro: boolean, trialActive: boolean) {
	if (isPro) {
		return {
			allowedElements: ['free', 'trial', 'pro'],
			allowAiFeatures: true,
			allowColorCustomization: true,
			allowStyleGuide: true,
			maxProjects: 999,
			canExport: true
		};
	}

	if (trialActive) {
		return {
			allowedElements: ['free', 'trial', 'pro'],
			allowAiFeatures: true,
			allowColorCustomization: true,
			allowStyleGuide: true,
			maxProjects: 10,
			canExport: true
		};
	}

	return getDefaultFeatures();
}