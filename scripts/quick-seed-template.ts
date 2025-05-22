// scripts/quick-seed-templates.ts
// Add some basic templates for testing

import { adminFirestore } from '../src/lib/server/firebase-admin.js';

const basicTemplates = [
	{
		id: 'landing-page-basic',
		name: 'Simple Landing Page',
		description: 'A clean, conversion-focused landing page template with hero section, features, and call-to-action.',
		price: 15,
		category: 'Landing Pages',
		tags: ['Landing Page', 'SaaS', 'Conversion'],
		sections: ['Hero', 'Features', 'CTA', 'Footer'],
		wordCount: '500-800 words',
		industry: 'SaaS',
		difficulty: 'beginner',
		popular: true,
		featured: false,
		thumbnailUrl: '/templates/landing-basic.jpg',
		previewUrl: '/templates/preview/landing-basic',
		docId: 'template-landing-basic-001',
		downloadCount: 142,
		rating: 4.6,
		reviews: 28,
		active: true
	},
	{
		id: 'email-welcome-series',
		name: 'Welcome Email Series',
		description: 'Professional 5-email welcome sequence to onboard new subscribers and build engagement.',
		price: 12,
		category: 'Email Marketing',
		tags: ['Email', 'Onboarding', 'Welcome Series'],
		sections: ['Welcome Email', 'Value Email', 'Story Email', 'Social Proof', 'CTA Email'],
		wordCount: '200-400 words per email',
		industry: 'Universal',
		difficulty: 'beginner',
		popular: false,
		featured: false,
		thumbnailUrl: '/templates/email-welcome.jpg',
		previewUrl: '/templates/preview/email-welcome',
		docId: 'template-email-welcome-002',
		downloadCount: 89,
		rating: 4.4,
		reviews: 19,
		active: true
	},
	{
		id: 'feature-page-saas',
		name: 'SaaS Feature Page',
		description: 'Showcase your product features with benefits-focused copy and visual hierarchy.',
		price: 18,
		category: 'Feature Pages',
		tags: ['Features', 'SaaS', 'Product Marketing'],
		sections: ['Feature Overview', 'Benefits List', 'Screenshots', 'Use Cases', 'CTA'],
		wordCount: '800-1200 words',
		industry: 'SaaS',
		difficulty: 'intermediate',
		popular: true,
		featured: false,
		thumbnailUrl: '/templates/feature-saas.jpg',
		previewUrl: '/templates/preview/feature-saas',
		docId: 'template-feature-saas-003',
		downloadCount: 67,
		rating: 4.7,
		reviews: 15,
		active: true
	},
	{
		id: 'pricing-page-table',
		name: 'Pricing Table Template',
		description: 'Convert more visitors with this proven pricing page structure and psychology-based copy.',
		price: 14,
		category: 'Pricing Pages',
		tags: ['Pricing', 'Conversion', 'Psychology'],
		sections: ['Pricing Header', 'Plan Comparison', 'FAQ', 'Guarantee', 'CTA'],
		wordCount: '600-900 words',
		industry: 'SaaS',
		difficulty: 'intermediate',
		popular: false,
		featured: false,
		thumbnailUrl: '/templates/pricing-table.jpg',
		previewUrl: '/templates/preview/pricing-table',
		docId: 'template-pricing-table-004',
		downloadCount: 134,
		rating: 4.5,
		reviews: 31,
		active: true
	},
	{
		id: 'complete-starter-bundle',
		name: 'Complete Starter Bundle',
		description: 'Everything you need to launch your SaaS: landing page, feature pages, pricing, and email templates.',
		price: 49,
		originalPrice: 59,
		category: 'Bundles',
		tags: ['Bundle', 'Complete', 'SaaS', 'Starter'],
		sections: ['All Individual Templates', 'Bonus Materials', 'Setup Guide'],
		wordCount: '3000+ words total',
		industry: 'SaaS',
		difficulty: 'all levels',
		popular: true,
		featured: true,
		thumbnailUrl: '/templates/starter-bundle.jpg',
		previewUrl: '/templates/preview/starter-bundle',
		docId: 'template-starter-bundle-005',
		downloadCount: 45,
		rating: 4.9,
		reviews: 12,
		savings: 10,
		bundleIncludes: [
			'landing-page-basic',
			'email-welcome-series',
			'feature-page-saas',
			'pricing-page-table'
		],
		active: true
	}
];

async function seedBasicTemplates() {
	console.log('🌱 Seeding basic templates...');

	try {
		const batch = adminFirestore.batch();

		basicTemplates.forEach((template) => {
			const templateRef = adminFirestore.collection('store').doc(template.id);

			const firestoreTemplate = {
				...template,
				createdAt: new Date(),
				updatedAt: new Date(),
				// Add search-friendly fields
				searchTerms: [
					template.id,
					template.name.toLowerCase(),
					template.category.toLowerCase(),
					template.industry.toLowerCase(),
					...template.tags.map(tag => tag.toLowerCase()),
					...template.description.toLowerCase().split(' ')
				],
				// Add computed fields
				priceRange: template.price < 10 ? 'under-10' : template.price < 20 ? '10-20' : template.price < 50 ? '20-50' : 'over-50',
				totalRevenue: template.downloadCount * template.price,
				slug: template.id.replace(/_/g, '-'),
				lastDownload: new Date()
			};

			batch.set(templateRef, firestoreTemplate);
		});

		await batch.commit();
		console.log(`✅ Successfully seeded ${basicTemplates.length} templates`);

		// Show breakdown
		const categories = {};
		let totalValue = 0;

		basicTemplates.forEach(template => {
			const category = template.category;
			categories[category] = (categories[category] || 0) + 1;
			totalValue += template.price;
		});

		console.log('   Categories:', categories);
		console.log(`   Total catalog value: $${totalValue}`);
		console.log(`   Average price: $${(totalValue / basicTemplates.length).toFixed(2)}`);

	} catch (error) {
		console.error('❌ Error seeding templates:', error);
	}
}

async function createAnalytics() {
	console.log('📊 Creating store analytics...');

	const analyticsData = {
		totalTemplates: basicTemplates.length,
		totalRevenue: basicTemplates.reduce((sum, t) => sum + (t.downloadCount * t.price), 0),
		totalDownloads: basicTemplates.reduce((sum, t) => sum + t.downloadCount, 0),
		averageRating: (basicTemplates.reduce((sum, t) => sum + t.rating, 0) / basicTemplates.length).toFixed(1),
		topSellingTemplate: 'landing-page-basic',
		lastUpdated: new Date()
	};

	try {
		await adminFirestore.collection('store').doc('_analytics').set(analyticsData);
		console.log('✅ Store analytics created');
		console.log(`   Total Revenue: $${analyticsData.totalRevenue.toLocaleString()}`);
		console.log(`   Total Downloads: ${analyticsData.totalDownloads.toLocaleString()}`);
		console.log(`   Average Rating: ${analyticsData.averageRating}/5.0`);
	} catch (error) {
		console.error('❌ Error creating analytics:', error);
	}
}

async function main() {
	console.log('🚀 Starting quick template seeding...');
	console.log('');

	await seedBasicTemplates();
	console.log('');

	await createAnalytics();
	console.log('');

	console.log('🎉 Quick template seeding completed!');
	console.log('');
	console.log('👀 View your store at: http://localhost:5173/dashboard/store');
	console.log('📊 View Firestore data at: http://localhost:5000/firestore/data/store');
	console.log('');

	process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error('💥 Template seeding failed:', error);
		process.exit(1);
	});
}

export { seedBasicTemplates, createAnalytics };