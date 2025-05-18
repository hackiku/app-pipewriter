// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { adminAuth, adminFirestore } from '$lib/server/firebase-admin';

// Trial duration in days
const TRIAL_PERIOD_DAYS = 10;

// export const load = (async ({ locals }) => {

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	// Default state - unauthenticated, no features
	let user = null;
	let isPremium = false;
	let trialActive = false;
	let trialDaysLeft = 0;
	let features = getDefaultFeatures();

	// Get the session cookie
	const sessionCookie = cookies.get('__session');

	if (sessionCookie) {
		try {
			// Verify the session cookie
			const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
			const uid = decodedClaims.uid;

			// Get user data from Auth service
			const userRecord = await adminAuth.getUser(uid);

			// Get user data from Firestore (for premium status, trial info)
			const userDoc = await adminFirestore.collection('users').doc(uid).get();
			const userData = userDoc.data() || {};

			// Set user information
			user = {
				uid,
				email: userRecord.email,
				displayName: userRecord.displayName,
				photoURL: userRecord.photoURL
			};

			// Check premium status
			isPremium = userData.premium === true;

			// If not premium, check trial status
			if (!isPremium) {
				const trialInfo = await checkTrialStatus(uid, userData);
				trialActive = trialInfo.active;
				trialDaysLeft = trialInfo.daysLeft;
			}

			// Get available features based on status
			features = getFeatureFlags(isPremium, trialActive);
		} catch (error) {
			// Invalid session token
			console.error('Session cookie verification failed:', error);
			cookies.delete('__session');
		}
	}

	// If accessing addon page without authentication, redirect to auth
	if (url.pathname === '/addon' && !user) {
		throw redirect(303, '/?auth=required');
	}

	// Return user data and features to the client
	return {
		user,
		isPremium,
		trialActive,
		trialDaysLeft,
		features
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
		allowStyleGuide: false
	};
}

// Get feature flags based on user status
function getFeatureFlags(isPremium, trialActive) {
	if (isPremium) {
		return {
			allowedElements: ['basic', 'premium', 'pro'],
			allowAiFeatures: true,
			allowColorCustomization: true,
			allowStyleGuide: true
		};
	}

	if (trialActive) {
		return {
			allowedElements: ['basic', 'premium'],
			allowAiFeatures: true,
			allowColorCustomization: true,
			allowStyleGuide: true
		};
	}

	return getDefaultFeatures();
}