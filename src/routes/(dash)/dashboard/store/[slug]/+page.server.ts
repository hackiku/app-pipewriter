// src/routes/(dash)/dashboard/store/[slug]/+page.server.ts

import { adminFirestore } from '$lib/server/firebase-admin';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { slug } = params;
	console.log(`🔍 Loading template: ${slug}`);

	try {
		// Get the specific template by ID
		const templateDoc = await adminFirestore
			.collection('store')
			.doc(slug)
			.get();

		if (!templateDoc.exists || templateDoc.id === '_analytics') {
			console.log(`❌ Template not found: ${slug}`);
			throw error(404, 'Template not found');
		}

		// Process template data safely
		const data = templateDoc.data();
		const template = {
			id: templateDoc.id,
			name: data.name || 'Untitled Template',
			description: data.description || 'No description available',
			price: data.price || 0,
			originalPrice: data.originalPrice || null,
			category: data.category || 'Template',
			tags: Array.isArray(data.tags) ? data.tags : [],
			sections: Array.isArray(data.sections) ? data.sections : [],
			downloadCount: data.downloadCount || 0,
			rating: data.rating || 0,
			reviews: data.reviews || 0,
			wordCount: data.wordCount || null,
			difficulty: data.difficulty || 'beginner',
			industry: data.industry || 'Universal',
			popular: Boolean(data.popular),
			featured: Boolean(data.featured),
			active: data.active !== false,
			thumbnailUrl: data.thumbnailUrl || null,
			previewUrl: data.previewUrl || null,
			// Convert timestamps safely
			createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
			updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
		};

		// Simple user tier
		let userTier = 'free';
		if (locals.authenticated) {
			userTier = 'trial'; // Default for testing
		}

		console.log(`✅ Template loaded: ${template.name}`);

		return {
			template,
			userTier,
			user: locals.user || null
		};

	} catch (err) {
		console.error(`❌ Error loading template ${slug}:`, err);

		if (err.status === 404) {
			throw err;
		}

		throw error(500, 'Failed to load template');
	}
};