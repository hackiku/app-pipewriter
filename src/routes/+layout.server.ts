// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { adminFirestore } from '$lib/server/firebase-admin';

// Trial duration in days - this was missing
const TRIAL_PERIOD_DAYS = 0;

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Public routes - no auth needed
	const publicRoutes = ['/', '/login', '/signup', '/about'];
	const isPublicRoute = publicRoutes.some(route => url.pathname === route);

	// If not authenticated and not on a public route, redirect
	if (!locals.authenticated && !isPublicRoute) {
		throw redirect(303, '/?auth=required');
	}

	// If authenticated, load additional user data
	if (locals.authenticated && locals.user) {
		try {
			const uid = locals.user.uid;

			// Get user data from Firestore
			const userDoc = await adminFirestore.collection('users').doc(uid).get();
			const userData = userDoc.data() || {};

			// Check premium status
			const isPremium = userData.premium === true;

			// Trial status (if not premium)
			let trialActive = false;
			let trialDaysLeft = 0;
			let trialStartDate = null;

			if (!isPremium) {
				const trialInfo = await checkTrialStatus(uid, userData);
				trialActive = trialInfo.active;
				trialDaysLeft = trialInfo.daysLeft;
				trialStartDate = userData.trialStartDate ? userData.trialStartDate.toDate() : new Date();
			}

			// Get feature flags
			const features = getFeatureFlags(isPremium, trialActive);

			// Return all data needed by the UI - provide complete data for both contexts
			return {
				user: locals.user,
				isPremium,
				trialActive,
				trialDaysLeft,
				trialStartDate,
				features,
				// Extra fields for maxProjects and canExport for new trial context
				maxProjects: isPremium ? 999 : (trialActive ? 10 : 3),
				canExport: isPremium || trialActive
			};
		} catch (error) {
			console.error('Error loading user data:', error);
		}
	}

	// Default return for public routes or error cases
	return {
		user: locals.user,
		isPremium: false,
		trialActive: false,
		trialDaysLeft: 0,
		features: getDefaultFeatures()
	};
};

// Check user's trial status
async function checkTrialStatus(uid, userData) {
	// If no trial start date exists, create one
	if (!userData.trialStartDate) {
		const trialStartDate = new Date();
		await adminFirestore.collection('users').doc(uid).set({
			trialStartDate
		}, { merge: true });

		return {
			active: true,
			daysLeft: TRIAL_PERIOD_DAYS
		};
	}

	// Calculate days left in trial
	const trialStartDate = userData.trialStartDate.toDate();
	const currentDate = new Date();
	const diffTime = currentDate.getTime() - trialStartDate.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
	const daysLeft = Math.max(0, TRIAL_PERIOD_DAYS - diffDays);

	return {
		active: daysLeft > 0,
		daysLeft
	};
}

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
function getFeatureFlags(isPremium, trialActive) {
	if (isPremium) {
		return {
			allowedElements: ['basic', 'premium', 'pro'],
			allowAiFeatures: true,
			allowColorCustomization: true,
			allowStyleGuide: true,
			maxProjects: 999,
			canExport: true
		};
	}

	if (trialActive) {
		return {
			allowedElements: ['basic', 'premium'],
			allowAiFeatures: true,
			allowColorCustomization: true,
			allowStyleGuide: true,
			maxProjects: 10,
			canExport: true
		};
	}

	return getDefaultFeatures();
}