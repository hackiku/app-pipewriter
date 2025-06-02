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
			console.log('[ADDON] Not authenticated, redirecting');
			return {
				route: 'addon-redirect',
				showLogin: false,
				showApp: false,
				redirectTo: '/gdocs-login'
			};
		}

		try {
			const uid = locals.user.uid;
			console.log(`[ADDON] Loading data for user: ${uid}`);

			// Load user features first
			const userFeatures = await getUserWithFeatures(uid);
			console.log(`[ADDON] User tier: ${userFeatures.tier}`);

			// Load data - elements first (known working), then prompts with fallback
			console.log('[ADDON] Loading elements...');
			const elements = await getFilteredElements(userFeatures.tier);
			console.log(`[ADDON] Elements loaded: ${Object.keys(elements).length} categories`);

			console.log('[ADDON] Loading prompts...');
			let prompts = {};
			try {
				prompts = await getFilteredPrompts(userFeatures.tier, uid);
				console.log(`[ADDON] Prompts loaded: ${Object.keys(prompts).length} categories`);
			} catch (error) {
				console.error('[ADDON] Prompts loading failed:', error);
				console.error('[ADDON] Prompts error stack:', error.stack);
				prompts = {}; // Fallback to empty
			}

			// Log what we got
			const elementCount = Object.values(elements).flat().length;
			const promptCount = Object.values(prompts).flat().length;

			console.log(`[ADDON] Loaded ${elementCount} elements, ${promptCount} prompts`);
			console.log(`[ADDON] Element categories: ${Object.keys(elements).join(', ')}`);
			console.log(`[ADDON] Prompt categories: ${Object.keys(prompts).join(', ')}`);

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
			console.error('[ADDON] Error details:', error.message);
			return {
				route: 'addon-error',
				showLogin: false,
				showApp: false,
				redirectTo: '/gdocs-login',
				error: error.message
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