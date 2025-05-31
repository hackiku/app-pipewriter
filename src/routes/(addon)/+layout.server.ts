// src/routes/(addon)/+layout.server.ts - Iframe-specific auth logic
import type { LayoutServerLoad } from './$types';
import { adminFirestore } from '$lib/server/firebase-admin';

const TRIAL_PERIOD_DAYS = 10;

export const load: LayoutServerLoad = async ({ locals, url }) => {
	console.log(`[ADDON] Route: ${url.pathname}, Authenticated: ${locals.authenticated}`);

	// For login route, always return minimal data
	if (url.pathname === '/gdocs-login') {
		return {
			route: 'gdocs-login',
			showLogin: true,
			showApp: false,
			user: null,
			isPro: false,
			trialActive: false,
			trialDaysLeft: 0,
			userTier: 'free',
			features: getDefaultFeatures()
		};
	}

	// For addon route, check authentication
	if (url.pathname === '/addon') {
		if (!locals.authenticated || !locals.user) {
			// Redirect to login page instead of showing login UI
			console.log('[ADDON] Not authenticated, should redirect to /gdocs-login');
			return {
				route: 'addon-redirect',
				showLogin: false,
				showApp: false,
				redirectTo: '/gdocs-login'
			};
		}

		// Authenticated - load full user data
		try {
			const uid = locals.user.uid;
			const userDoc = await adminFirestore.collection('users').doc(uid).get();
			let userData = userDoc.data() || {};

			// Create user if doesn't exist
			if (!userDoc.exists) {
				console.log(`[ADDON] Creating missing user document for ${uid}`);
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
					signupSource: 'addon-provision'
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

			const features = getFeatureFlags(isPro, trialActive);
			const userTier = isPro ? 'pro' : (trialActive ? 'trial' : 'free');

			console.log(`[ADDON] User loaded: ${locals.user.email}, Tier: ${userTier}`);

			return {
				route: 'addon',
				showLogin: false,
				showApp: true,
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
			console.error('[ADDON] Error loading user data:', error);
			return {
				route: 'addon-error',
				showLogin: false,
				showApp: false,
				redirectTo: '/gdocs-login'
			};
		}
	}

	// Fallback
	return {
		route: 'unknown',
		showLogin: false,
		showApp: false,
		redirectTo: '/gdocs-login'
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