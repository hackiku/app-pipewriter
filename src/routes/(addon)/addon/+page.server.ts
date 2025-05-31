// src/routes/(addon)/addon/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	// Get data from addon layout
	const layoutData = await parent();

	// Just pass through the layout data
	// Layout already handles auth and redirects
	return {
		...layoutData,
		iframeMode: true,
		source: 'google-docs'
	};
};