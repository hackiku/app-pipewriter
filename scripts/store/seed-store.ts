// scripts/seed-store.ts
import { adminFirestore } from '../src/lib/server/firebase-admin.js';

// Template store data - realistic templates for copywriters/UX writers
const storeTemplates = {
	'saas-landing-modern': {
		name: 'Modern SaaS Landing Page',
		description: 'Complete landing page with hero, social proof, features, pricing, and CTA sections. Optimized for B2B SaaS conversions.',
		price: 9,
		category: 'Landing Pages',
		tags: ['SaaS', 'Landing Page', 'Conversion', 'B2B'],
		sections: ['Hero', 'Social Proof', 'Features', 'Pricing', 'CTA', 'Footer'],
		wordCount: '800-1200 words',
		industry: 'SaaS',
		difficulty: 'beginner',
		popular: true,
		featured: false,
		thumbnailUrl: '/templates/saas-landing.jpg',
		previewUrl: '/templates/preview/saas-landing',
		docId: 'template-saas-landing-123', // Google Doc ID
		downloadCount: 234,
		rating: 4.8,
		reviews: 42
	},

	'sales-page-conversion': {
		name: 'High-Converting Sales Page',
		description: 'Proven sales page structure with problem-agitation-solution framework. Includes objection handling and urgency triggers.',
		price: 19,
		category: 'Sales Pages',
		tags: ['Sales Page', 'Conversion', 'Copywriting', 'Framework'],
		sections: ['Headline', 'Problem', 'Solution', 'Benefits', 'Social Proof', 'Objections', 'CTA'],
		wordCount: '2000-3000 words',
		industry: 'Universal',
		difficulty: 'intermediate',
		popular: true,
		featured: false,
		thumbnailUrl: '/templates/sales-page.jpg',
		previewUrl: '/templates/preview/sales-page',
		docId: 'template-sales-page-456',
		downloadCount: 189,
		rating: 4.9,
		reviews: 67
	},

	'company-website-bundle': {
		name: 'Complete Company Website',
		description: 'Full website copy bundle: Home, About, Services, How It Works, and Contact pages. Perfect for service businesses.',
		price: 29,
		category: 'Website Bundles',
		tags: ['Website', 'Complete', 'Service Business', 'Professional'],
		sections: ['Homepage', 'About Page', 'Services Page', 'How It Works', 'Contact Page'],
		wordCount: '3000-4000 words',
		industry: 'Service Business',
		difficulty: 'intermediate',
		popular: true,
		featured: false,
		thumbnailUrl: '/templates/company-website.jpg',
		previewUrl: '/templates/preview/company-website',
		docId: 'template-company-bundle-789',
		downloadCount: 156,
		rating: 4.7,
		reviews: 38
	},

	'product-pages-collection': {
		name: 'Product Page Collection',
		description: 'Product description templates for e-commerce and SaaS. Includes feature highlights, specifications, and buying triggers.',
		price: 15,
		category: 'Product Pages',
		tags: ['Product', 'E-commerce', 'Features', 'Specifications'],
		sections: ['Product Overview', 'Key Features', 'Specifications', 'Use Cases', 'Pricing'],
		wordCount: '1200-1800 words',
		industry: 'E-commerce',
		difficulty: 'beginner',
		popular: false,
		featured: false,
		thumbnailUrl: '/templates/product-pages.jpg',
		previewUrl: '/templates/preview/product-pages',
		docId: 'template-product-pages-012',
		downloadCount: 98,
		rating: 4.6,
		reviews: 23
	},

	'email-campaign-pack': {
		name: 'Email Campaign Templates',
		description: 'Professional email templates: welcome series, newsletters, product launches, and re-engagement campaigns.',
		price: 12,
		category: 'Email Marketing',
		tags: ['Email', 'Campaigns', 'Newsletter', 'Automation'],
		sections: ['Welcome Series', 'Newsletter', 'Product Launch', 'Re-engagement', 'Promotional'],
		wordCount: '150-300 words per email',
		industry: 'Universal',
		difficulty: 'beginner',
		popular: true,
		featured: false,
		thumbnailUrl: '/templates/email-campaigns.jpg',
		previewUrl: '/templates/preview/email-campaigns',
		docId: 'template-email-pack-345',
		downloadCount: 276,
		rating: 4.5,
		reviews: 89
	},

	'pricing-page-optimizer': {
		name: 'Pricing Page Templates',
		description: 'Optimized pricing pages that convert. Includes value positioning, feature comparisons, and FAQ sections.',
		price: 11,
		category: 'Pricing Pages',
		tags: ['Pricing', 'Conversion', 'Value Prop', 'Comparison'],
		sections: ['Pricing Header', 'Plan Comparison', 'Value Props', 'FAQ', 'CTA'],
		wordCount: '800-1200 words',
		industry: 'SaaS',
		difficulty: 'intermediate',
		popular: false,
		featured: false,
		thumbnailUrl: '/templates/pricing-pages.jpg',
		previewUrl: '/templates/preview/pricing-pages',
		docId: 'template-pricing-678',
		downloadCount: 134,
		rating: 4.4,
		reviews: 31
	},

	'about-page-storytelling': {
		name: 'About Page Collection',
		description: 'Compelling about pages that build trust. Includes founder stories, mission statements, and team descriptions.',
		price: 8,
		category: 'About Pages',
		tags: ['About', 'Storytelling', 'Trust Building', 'Company'],
		sections: ['Company Story', 'Mission/Vision', 'Team Bios', 'Values', 'Timeline'],
		wordCount: '600-1000 words',
		industry: 'Universal',
		difficulty: 'beginner',
		popular: false,
		featured: false,
		thumbnailUrl: '/templates/about-pages.jpg',
		previewUrl: '/templates/preview/about-pages',
		docId: 'template-about-901',
		downloadCount: 87,
		rating: 4.3,
		reviews: 19
	},

	'feature-showcase-bundle': {
		name: 'Feature Showcase Pages',
		description: 'Detailed feature pages that sell benefits, not features. Perfect for SaaS products and complex services.',
		price: 16,
		category: 'Feature Pages',
		tags: ['Features', 'Benefits', 'SaaS', 'Product Marketing'],
		sections: ['Feature Overview', 'Benefits List', 'Use Cases', 'Screenshots', 'CTA'],
		wordCount: '1000-1500 words',
		industry: 'SaaS',
		difficulty: 'intermediate',
		popular: false,
		featured: false,
		thumbnailUrl: '/templates/feature-pages.jpg',
		previewUrl: '/templates/preview/feature-pages',
		docId: 'template-features-234',
		downloadCount: 112,
		rating: 4.6,
		reviews: 28
	},

	'blog-content-layouts': {
		name: 'Blog Layout Templates',
		description: 'Professional blog post templates for thought leadership, tutorials, and company updates. SEO-optimized structure.',
		price: 7,
		category: 'Content Templates',
		tags: ['Blog', 'Content', 'SEO', 'Thought Leadership'],
		sections: ['Blog Headers', 'Article Structure', 'CTAs', 'Author Bios', 'Related Posts'],
		wordCount: '1500-2500 words',
		industry: 'Universal',
		difficulty: 'beginner',
		popular: false,
		featured: false,
		thumbnailUrl: '/templates/blog-layouts.jpg',
		previewUrl: '/templates/preview/blog-layouts',
		docId: 'template-blog-567',
		downloadCount: 203,
		rating: 4.2,
		reviews: 54
	},

	'complete-business-bundle': {
		name: 'Complete Business Bundle',
		description: 'Everything you need to launch a professional website. All templates above plus bonus materials and future updates.',
		price: 99,
		originalPrice: 142,
		category: 'Bundles',
		tags: ['Bundle', 'Complete', 'Value Pack', 'Professional'],
		sections: ['All Individual Templates', 'Bonus Materials', '6 Months Updates', 'Priority Support'],
		wordCount: '10,000+ words total',
		industry: 'Universal',
		difficulty: 'all levels',
		popular: true,
		featured: true,
		thumbnailUrl: '/templates/complete-bundle.jpg',
		previewUrl: '/templates/preview/complete-bundle',
		docId: 'template-bundle-complete-890',
		downloadCount: 89,
		rating: 4.9,
		reviews: 34,
		savings: 43, // Dollar amount saved
		bundleIncludes: [
			'saas-landing-modern',
			'sales-page-conversion',
			'company-website-bundle',
			'product-pages-collection',
			'email-campaign-pack',
			'pricing-page-optimizer',
			'about-page-storytelling',
			'feature-showcase-bundle',
			'blog-content-layouts'
		]
	}
};

// Function to seed store templates
async function seedStoreTemplates() {
	console.log('🛍️ Seeding store templates collection...');

	const batch = adminFirestore.batch();
	let count = 0;

	Object.entries(storeTemplates).forEach(([templateId, templateData]) => {
		const templateRef = adminFirestore.collection('store').doc(templateId);

		const firestoreTemplate = {
			id: templateId,
			...templateData,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			// Add search-friendly fields
			searchTerms: [
				templateId,
				templateData.name.toLowerCase(),
				templateData.category.toLowerCase(),
				templateData.industry.toLowerCase(),
				...templateData.tags.map(tag => tag.toLowerCase()),
				...templateData.description.toLowerCase().split(' ')
			],
			// Add computed fields for easier queries
			priceRange: templateData.price < 10 ? 'under-10' : templateData.price < 20 ? '10-20' : templateData.price < 50 ? '20-50' : 'over-50',
			// Add revenue tracking
			totalRevenue: templateData.downloadCount * templateData.price,
			// Add SEO slug
			slug: templateId.replace(/-/g, '-'),
			// Add last updated tracking
			lastDownload: new Date()
		};

		batch.set(templateRef, firestoreTemplate);
		count++;
	});

	try {
		await batch.commit();
		console.log(`✅ Seeded ${count} store templates`);

		// Show breakdown by category and price range
		const categories = {};
		const priceRanges = { 'under-10': 0, '10-20': 0, '20-50': 0, 'over-50': 0 };
		let totalValue = 0;

		Object.values(storeTemplates).forEach(template => {
			const category = template.category;
			const price = template.price;

			categories[category] = (categories[category] || 0) + 1;
			totalValue += price;

			if (price < 10) priceRanges['under-10']++;
			else if (price < 20) priceRanges['10-20']++;
			else if (price < 50) priceRanges['20-50']++;
			else priceRanges['over-50']++;
		});

		console.log('   Categories:', categories);
		console.log('   Price ranges:', priceRanges);
		console.log(`   Total catalog value: $${totalValue}`);
		console.log(`   Average price: $${(totalValue / count).toFixed(2)}`);

	} catch (error) {
		console.error('❌ Error seeding store templates:', error);
	}
}

// Function to seed store analytics/stats
async function seedStoreAnalytics() {
	console.log('📊 Seeding store analytics...');

	const analyticsData = {
		totalTemplates: Object.keys(storeTemplates).length,
		totalRevenue: Object.values(storeTemplates).reduce((sum, t) => sum + (t.downloadCount * t.price), 0),
		totalDownloads: Object.values(storeTemplates).reduce((sum, t) => sum + t.downloadCount, 0),
		averageRating: (Object.values(storeTemplates).reduce((sum, t) => sum + t.rating, 0) / Object.keys(storeTemplates).length).toFixed(2),
		topSellingTemplate: 'email-campaign-pack',
		lastUpdated: new Date()
	};

	try {
		await adminFirestore.collection('store').doc('_analytics').set(analyticsData);
		console.log('✅ Store analytics seeded');
		console.log(`   Total Revenue: $${analyticsData.totalRevenue.toLocaleString()}`);
		console.log(`   Total Downloads: ${analyticsData.totalDownloads.toLocaleString()}`);
		console.log(`   Average Rating: ${analyticsData.averageRating}/5.0`);
	} catch (error) {
		console.error('❌ Error seeding analytics:', error);
	}
}

// Clear store data (emulator only!)
async function clearStoreData() {
	console.log('🧹 Clearing store data...');

	try {
		const collection = adminFirestore.collection('store');
		const snapshot = await collection.get();

		if (!snapshot.empty) {
			const batch = adminFirestore.batch();
			snapshot.docs.forEach(doc => batch.delete(doc.ref));
			await batch.commit();
			console.log(`   Cleared ${snapshot.size} documents from store`);
		}

		console.log('✅ Store data cleared');
	} catch (error) {
		console.error('❌ Error clearing store data:', error);
	}
}

// Main seeding function
async function seedStore() {
	console.log('🚀 Starting store seeding...');
	console.log('');

	await seedStoreTemplates();
	console.log('');

	await seedStoreAnalytics();
	console.log('');

	console.log('🎉 Store seeding completed!');
	console.log('');
	console.log('👀 View your store data at: http://localhost:5000/firestore/data/store');
	console.log('');

	process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedStore().catch((error) => {
		console.error('💥 Store seeding failed:', error);
		process.exit(1);
	});
}

export { seedStore, seedStoreTemplates, seedStoreAnalytics, clearStoreData };