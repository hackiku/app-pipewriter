// src/routes/+layout.server.ts - Global auth state
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Simple global auth state - don't load heavy data here
	// Individual route groups will load their specific data

	return {
		user: locals.user || null,
		authenticated: locals.authenticated || false,
		route: url.pathname,

		// Legacy compatibility for any existing components
		features: null,
		trialActive: false,
		trialDaysLeft: 0,
		isPro: false
	};
};