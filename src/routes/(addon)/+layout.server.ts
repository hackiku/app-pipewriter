// src/routes/(addon)/+layout.server.ts - FIXED
import type { LayoutServerLoad } from './$types';
import { getUserAccess } from '$lib/server/business-logic';
import { getFilteredElements, getFilteredPrompts } from '$lib/server/data-loaders';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	console.log(`[ADDON] Route: ${url.pathname}, Authenticated: ${locals.authenticated}`);

	if (url.pathname === '/gdocs-login') {
		return {
			route: 'gdocs-login',
			showLogin: true,
			showApp: false,
			user: null,
			userAccess: null,
			elements: {},
			prompts: {}
		};
	}

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

			// Get user access - but only serialize the data parts
			const userAccess = await getUserAccess(uid);

			// FIXED: Only pass serializable data
			const serializableUserAccess = {
				tier: userAccess.tier,
				isPro: userAccess.isPro,
				trialActive: userAccess.trialActive,
				trialDaysLeft: userAccess.trialDaysLeft,
				features: userAccess.features
				// Remove the function methods
			};

			const elements = await getFilteredElements(userAccess.tier);
			let prompts = {};

			try {
				prompts = await getFilteredPrompts(userAccess.tier, uid);
			} catch (error) {
				console.error('[ADDON] Prompts loading failed:', error);
				prompts = {};
			}

			return {
				route: 'addon',
				showLogin: false,
				showApp: true,
				user: locals.user,

				// FIXED: Serializable user access
				userAccess: serializableUserAccess,

				elements,
				prompts,

				// Legacy compatibility
				userFeatures: {
					tier: userAccess.tier,
					isPro: userAccess.isPro,
					trialActive: userAccess.trialActive,
					trialDaysLeft: userAccess.trialDaysLeft,
					features: {
						canUseAI: userAccess.features.ai.canUseBasicPrompts,
						canExport: userAccess.features.export.canExportBasic,
						canCustomize: userAccess.features.colors.canUseDocumentBackgrounds,
						canUseTrialElements: userAccess.features.elements.canUseTrialElements,
						canUseProElements: userAccess.features.elements.canUseProElements,
						maxProjects: 999
					}
				}
			};

		} catch (error) {
			console.error('[ADDON] Error loading user data:', error);
			return {
				route: 'addon-error',
				showLogin: false,
				showApp: false,
				redirectTo: '/gdocs-login',
				error: 'Failed to load user data'
			};
		}
	}

	return {
		route: 'unknown',
		showLogin: false,
		showApp: false,
		redirectTo: '/gdocs-login'
	};
};