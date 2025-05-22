// src/routes/(dash)/dashboard/store/+page.server.ts

import { adminFirestore } from '$lib/server/firebase-admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	console.log('🛒 Loading store page...');

	try {
		// EXACT same query as your working verify script
		const storeSnapshot = await adminFirestore.collection('store').get();

		if (storeSnapshot.empty) {
			console.log('📦 Store is empty');
			return {
				templates: [],
				categories: [{ id: 'all', name: 'All Templates' }],
				analytics: null,
				userTier: 'trial'
			};
		}

		// EXACT same processing as verify script
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

		// Get analytics doc and make it serializable
		const analyticsDoc = allDocs.find(doc => doc.id === '_analytics');
		const analytics = analyticsDoc ? {
			totalTemplates: analyticsDoc.totalTemplates || 0,
			totalDownloads: analyticsDoc.totalDownloads || 0,
			averageRating: analyticsDoc.averageRating || 0,
			// Convert Firestore timestamp to string
			lastUpdated: analyticsDoc.lastUpdated?.toDate?.()?.toISOString() || null
		} : null;

		// Simple categories - just get unique values
		const categories = [
			{ id: 'all', name: 'All Templates' },
			{ id: 'landing-pages', name: 'Landing Pages' },
			{ id: 'email-marketing', name: 'Email Marketing' },
			{ id: 'feature-pages', name: 'Feature Pages' }
		];

		console.log(`✅ Loaded ${templates.length} templates successfully`);

		return {
			templates,
			categories,
			analytics: analytics,
			userTier: 'trial' // Simple default
		};

	} catch (error) {
		console.error('❌ Store loading failed:', error.message);

		return {
			templates: [],
			categories: [{ id: 'all', name: 'All Templates' }],
			analytics: null,
			userTier: 'trial',
			error: error.message
		};
	}
};