// src/routes/(addon)/+layout.server.ts - FIXED WITH DEBUGGING
import type { LayoutServerLoad } from './$types';
import { getUserAccess } from '$lib/server/business-logic';
import { getFilteredElements, getFilteredPrompts } from '$lib/server/data-loaders';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	console.log(`[LAYOUT] === ADDON LAYOUT LOAD START ===`);
	console.log(`[LAYOUT] Route: ${url.pathname}`);
	console.log(`[LAYOUT] Authenticated: ${locals.authenticated}`);
	console.log(`[LAYOUT] User: ${locals.user?.email || 'none'}`);

	// Environment debugging
	console.log(`[LAYOUT] Environment check:`);
	console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
	console.log(`  - FIRESTORE_EMULATOR_HOST: ${process.env.FIRESTORE_EMULATOR_HOST || 'not set'}`);
	console.log(`  - FIREBASE_SERVICE_ACCOUNT exists: ${!!process.env.FIREBASE_SERVICE_ACCOUNT}`);

	if (url.pathname === '/gdocs-login') {
		console.log(`[LAYOUT] Returning login page`);
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
			console.log(`[LAYOUT] User not authenticated, redirecting to login`);
			return {
				route: 'addon-redirect',
				showLogin: false,
				showApp: false,
				redirectTo: '/gdocs-login'
			};
		}

		const uid = locals.user.uid;
		console.log(`[LAYOUT] Loading data for authenticated user: ${uid}`);

		try {
			// Step 1: Get user access
			console.log(`[LAYOUT] Step 1: Getting user access...`);
			const userAccess = await getUserAccess(uid);
			console.log(`[LAYOUT] User access loaded: tier=${userAccess.tier}, isPro=${userAccess.isPro}, trialActive=${userAccess.trialActive}`);

			// Serialize user access (remove function methods)
			const serializableUserAccess = {
				tier: userAccess.tier,
				isPro: userAccess.isPro,
				trialActive: userAccess.trialActive,
				trialDaysLeft: userAccess.trialDaysLeft,
				features: userAccess.features
			};

			// Step 2: Load elements
			console.log(`[LAYOUT] Step 2: Loading elements...`);
			let elements = {};
			try {
				elements = await getFilteredElements(userAccess.tier);
				const elementCount = Object.values(elements).flat().length;
				console.log(`[LAYOUT] Elements loaded successfully: ${elementCount} total elements`);
			} catch (error) {
				console.error(`[LAYOUT] ❌ Elements loading failed:`, error);
				console.error(`[LAYOUT] Continuing without elements...`);
				// Continue without elements rather than failing completely
			}

			// Step 3: Load prompts
			console.log(`[LAYOUT] Step 3: Loading prompts...`);
			let prompts = {};
			try {
				prompts = await getFilteredPrompts(userAccess.tier, uid);
				const promptCount = Object.values(prompts).flat().length;
				console.log(`[LAYOUT] Prompts loaded successfully: ${promptCount} total prompts`);
			} catch (error) {
				console.error(`[LAYOUT] ❌ Prompts loading failed:`, error);
				console.error(`[LAYOUT] Continuing without prompts...`);
				// Continue without prompts rather than failing completely
			}

			console.log(`[LAYOUT] Final data summary:`);
			console.log(`  - Elements: ${Object.keys(elements).length} categories`);
			console.log(`  - Prompts: ${Object.keys(prompts).length} categories`);

			const result = {
				route: 'addon',
				showLogin: false,
				showApp: true,
				user: locals.user,
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

			console.log(`[LAYOUT] === ADDON LAYOUT LOAD SUCCESS ===`);
			return result;

		} catch (error) {
			console.error(`[LAYOUT] ❌ Critical error loading user data:`, error);
			console.error(`[LAYOUT] Error details:`, {
				name: error.name,
				message: error.message,
				code: error.code,
				stack: error.stack
			});

			return {
				route: 'addon-error',
				showLogin: false,
				showApp: false,
				redirectTo: '/gdocs-login',
				error: `Failed to load user data: ${error.message}`
			};
		}
	}

	console.log(`[LAYOUT] Unknown route, redirecting to login`);
	return {
		route: 'unknown',
		showLogin: false,
		showApp: false,
		redirectTo: '/gdocs-login'
	};
};