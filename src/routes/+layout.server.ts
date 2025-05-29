// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { adminFirestore } from '$lib/server/firebase-admin';

// Trial duration in days
const TRIAL_PERIOD_DAYS = 10;

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Public routes - no auth needed (removed the redirect logic here)
	const publicRoutes = ['/', '/login', '/signup', '/about'];
	const isPublicRoute = publicRoutes.some(route => url.pathname === route);

	// For /addon route specifically, redirect to home if not authenticated
	// if (url.pathname.startsWith('/addon') && !locals.authenticated) {
	// 	throw redirect(303, '/');
	// }

	// If authenticated, load additional user data
	if (locals.authenticated && locals.user) {
		try {
			const uid = locals.user.uid;

			// Get user data from Firestore (this will auto-create if needed)
			const userDoc = await adminFirestore.collection('users').doc(uid).get();
			let userData = userDoc.data() || {};

			// FIXED: Use .exists property, not .exists() method
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
					signupSource: 'server-fallback'
				};

				await adminFirestore.collection('users').doc(uid).set(newUserData);
				userData = newUserData;
			}

			// Calculate current tier status
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

			// Get feature flags based on current status
			const features = getFeatureFlags(isPro, trialActive);

			return {
				user: locals.user,
				isPro,
				trialActive,
				trialDaysLeft,
				trialStartDate: userData.trialStartDate ? userData.trialStartDate.toDate() : null,
				features,
				maxProjects: isPro ? 999 : (trialActive ? 10 : 3),
				canExport: isPro || trialActive
			};
		} catch (error) {
			console.error('Error loading user data:', error);
		}
	}

	// Default return for public routes or error cases
	return {
		user: locals.user,
		isPro: false,
		trialActive: false,
		trialDaysLeft: 0,
		features: getDefaultFeatures()
	};
};

// Default features (free tier)
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

// Get feature flags based on user status
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