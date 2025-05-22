// src/routes/(dash)/store/+page.server.ts

import { adminFirestore } from '$lib/server/firebase-admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		// Get all templates from the store collection
		const templatesSnapshot = await adminFirestore
			.collection('store')
			.where('active', '==', true)
			.orderBy('featured', 'desc')
			.orderBy('popular', 'desc')
			.orderBy('downloadCount', 'desc')
			.get();

		const templates = templatesSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
			// Convert Firestore timestamps to JSON-serializable dates
			createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
			updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
			lastDownload: doc.data().lastDownload?.toDate?.()?.toISOString() || null,
		}));

		// Get unique categories from templates
		const categories = [
			{ id: 'all', name: 'All Templates' },
			...Array.from(new Set(templates.map(t => t.category)))
				.map(category => ({
					id: category.toLowerCase().replace(/\s+/g, '-'),
					name: category
				}))
		];

		// Get store analytics if available
		let storeAnalytics = null;
		try {
			const analyticsDoc = await adminFirestore
				.collection('store')
				.doc('_analytics')
				.get();

			if (analyticsDoc.exists) {
				storeAnalytics = {
					...analyticsDoc.data(),
					lastUpdated: analyticsDoc.data()?.lastUpdated?.toDate?.()?.toISOString() || null
				};
			}
		} catch (analyticsError) {
			console.log('No analytics data available');
		}

		return {
			templates,
			categories,
			storeAnalytics,
			// Pass user data for purchase permissions
			user: locals.user || null,
			isPro: locals.authenticated ? true : false // You'll want to get this from your user data
		};

	} catch (error) {
		console.error('Error loading store data:', error);

		// Return empty data on error
		return {
			templates: [],
			categories: [{ id: 'all', name: 'All Templates' }],
			storeAnalytics: null,
			user: locals.user || null,
			isPro: false
		};
	}
};