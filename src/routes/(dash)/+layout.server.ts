// src/routes/(dash)/+layout.server.ts - Mirror addon data flow pattern

import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserAccess } from '$lib/server/business-logic';
import { adminFirestore } from '$lib/server/firebase-admin';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	console.log(`[DASH] Route: ${url.pathname}, Authenticated: ${locals.authenticated}`);

	// Redirect unauthenticated users to login
	if (!locals.authenticated || !locals.user) {
		console.log(`[DASH] Redirecting unauthenticated user from ${url.pathname}`);
		throw redirect(302, '/?auth=required');
	}

	try {
		const uid = locals.user.uid;

		// Get user access using the same business logic as addon
		const userAccess = await getUserAccess(uid);

		// SERIALIZABLE user access (same pattern as addon)
		const serializableUserAccess = {
			tier: userAccess.tier,
			isPro: userAccess.isPro,
			trialActive: userAccess.trialActive,
			trialDaysLeft: userAccess.trialDaysLeft,
			features: userAccess.features
		};

		// Load dashboard-specific data
		let storeData = { templates: [], categories: [], analytics: null };
		try {
			// Load store data (same as your store page pattern)
			const storeSnapshot = await adminFirestore.collection('store').get();

			if (!storeSnapshot.empty) {
				const allDocs = storeSnapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				}));

				const templates = allDocs
					.filter(doc => doc.id !== '_analytics')
					.map(template => ({
						id: template.id,
						name: template.name || 'Untitled',
						description: template.description || 'No description',
						price: template.price || 0,
						category: template.category || 'Template',
						tags: Array.isArray(template.tags) ? template.tags : [],
						downloadCount: template.downloadCount || 0,
						rating: template.rating || 0,
						popular: Boolean(template.popular),
						featured: Boolean(template.featured),
						active: template.active !== false
					}));

				const analyticsDoc = allDocs.find(doc => doc.id === '_analytics');
				const analytics = analyticsDoc ? {
					totalTemplates: analyticsDoc.totalTemplates || 0,
					totalDownloads: analyticsDoc.totalDownloads || 0,
					averageRating: analyticsDoc.averageRating || 0,
					lastUpdated: analyticsDoc.lastUpdated?.toDate?.()?.toISOString() || null
				} : null;

				const categories = [
					{ id: 'all', name: 'All Templates' },
					{ id: 'landing-pages', name: 'Landing Pages' },
					{ id: 'email-marketing', name: 'Email Marketing' },
					{ id: 'feature-pages', name: 'Feature Pages' }
				];

				storeData = { templates, categories, analytics };
			}
		} catch (error) {
			console.error('[DASH] Store loading failed:', error);
			// Continue without store data
		}

		// Mock user stats for dashboard
		const userStats = {
			activeProjects: 12,
			templatesCreated: 34,
			wordsWritten: 24500,
			googleDocsConnected: 18
		};

		// Mock recent projects
		const recentProjects = [
			{ id: '1', name: 'SaaS Landing Page', lastEdited: '2 hours ago', template: 'Landing Page', status: 'In Progress' },
			{ id: '2', name: 'Product Feature Page', lastEdited: 'Yesterday', template: 'Feature Page', status: 'Complete' },
			{ id: '3', name: 'Email Campaign', lastEdited: '3 days ago', template: 'Email', status: 'Review' }
		];

		console.log(`✅ Dashboard data loaded for ${userAccess.tier} user`);

		return {
			route: 'dashboard',
			user: locals.user,
			userAccess: serializableUserAccess,

			// Dashboard-specific data
			store: storeData,
			userStats,
			recentProjects,

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
		console.error('[DASH] Error loading dashboard data:', error);
		throw redirect(302, '/?error=dashboard-load-failed');
	}
};