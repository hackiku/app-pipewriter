// src/routes/addon/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals }) => {
	// Get layout data
	const layoutData = await parent();

	// SECURITY: If not authenticated, return MINIMAL data only
	if (!locals.authenticated || !locals.user) {
		return {
			// Only return what login UI needs
			showLogin: true,
			showApp: false,
			iframeMode: true,
			source: 'google-docs',

			// NO USER DATA, NO FEATURES, NO APP DATA
			user: null,
			features: null,
			isPro: false,
			trialActive: false,
			trialDaysLeft: 0,

			debug: {
				authenticated: false,
				timestamp: new Date().toISOString(),
				securityLevel: 'restricted'
			}
		};
	}

	// SECURITY: Only return full data if authenticated
	return {
		// Pass through full layout data ONLY for authenticated users
		...layoutData,

		// App flags
		showLogin: false,
		showApp: true,
		iframeMode: true,
		source: 'google-docs',

		debug: {
			authenticated: true,
			userEmail: layoutData.user?.email || null,
			timestamp: new Date().toISOString(),
			securityLevel: 'full-access'
		}
	};
};