// src/routes/(addon)/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getUserWithFeatures } from '$lib/server/user-features';
import { getFilteredElements, getFilteredPrompts } from '$lib/server/data-loaders';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	console.log(`[ADDON] Route: ${url.pathname}, Authenticated: ${locals.authenticated}`);

	// For login route, return minimal data
	if (url.pathname === '/gdocs-login') {
		return {
			route: 'gdocs-login',
			showLogin: true,
			showApp: false,
			user: null,
			userFeatures: null,
			elements: {},
			prompts: {}
		};
	}

	// For addon route, check authentication
	if (url.pathname === '/addon') {
		if (!locals.authenticated || !locals.user) {
			return {
				route: 'addon-redirect',
				showLogin: false,
				showApp: false,
				redirectTo: '/gdocs-login'
			};
		}

		try {
			const uid = locals.user.uid;

			// FIXED: Load user features first, then use the tier
			const userFeatures = await getUserWithFeatures(uid);

			// FIXED: Use the tier from userFeatures directly
			const [elements, prompts] = await Promise.all([
				getFilteredElements(userFeatures.tier),
				getFilteredPrompts(userFeatures.tier, uid)
			]);

			console.log(`[ADDON] User loaded: ${locals.user.email}, Tier: ${userFeatures.tier}, Elements: ${Object.keys(elements).length} categories`);

			return {
				route: 'addon',
				showLogin: false,
				showApp: true,
				user: locals.user,
				userFeatures,
				elements,
				prompts,
				// Legacy compatibility
				isPro: userFeatures.isPro,
				trialActive: userFeatures.trialActive,
				trialDaysLeft: userFeatures.trialDaysLeft,
				features: userFeatures.features
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