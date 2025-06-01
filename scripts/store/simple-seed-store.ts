// scripts/simple-seed-store.ts
// Simple script to add basic templates for testing Firebase

import { adminFirestore } from '../src/lib/server/firebase-admin.js';

const simpleTemplates = [
	{
		id: 'template-1',
		name: 'Landing Page Template',
		description: 'A simple landing page template for testing',
		price: 15,
		category: 'Landing Pages',
		tags: ['landing', 'page'],
		downloadCount: 50,
		rating: 4.5,
		popular: true,
		featured: false,
		active: true
	},
	{
		id: 'template-2',
		name: 'Email Template',
		description: 'Basic email template for testing',
		price: 10,
		category: 'Email Marketing',
		tags: ['email', 'marketing'],
		downloadCount: 30,
		rating: 4.2,
		popular: false,
		featured: false,
		active: true
	},
	{
		id: 'template-3',
		name: 'Feature Page',
		description: 'Feature page template for testing',
		price: 20,
		category: 'Feature Pages',
		tags: ['feature', 'page'],
		downloadCount: 25,
		rating: 4.7,
		popular: false,
		featured: true,
		active: true
	}
];

async function seedSimpleTemplates() {
	console.log('🌱 Seeding simple templates...');

	try {
		// Clear existing templates first
		const existing = await adminFirestore.collection('store').get();
		if (!existing.empty) {
			console.log('🧹 Clearing existing templates...');
			const batch = adminFirestore.batch();
			existing.docs.forEach(doc => {
				if (doc.id !== '_analytics') {
					batch.delete(doc.ref);
				}
			});
			await batch.commit();
		}

		// Add new templates
		const batch = adminFirestore.batch();

		simpleTemplates.forEach(template => {
			const ref = adminFirestore.collection('store').doc(template.id);
			batch.set(ref, {
				...template,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		});

		await batch.commit();
		console.log(`✅ Added ${simpleTemplates.length} templates`);

		// Create simple analytics
		const totalDownloads = simpleTemplates.reduce((sum, t) => sum + t.downloadCount, 0);
		const avgRating = simpleTemplates.reduce((sum, t) => sum + t.rating, 0) / simpleTemplates.length;

		await adminFirestore.collection('store').doc('_analytics').set({
			totalTemplates: simpleTemplates.length,
			totalDownloads,
			averageRating: parseFloat(avgRating.toFixed(1)),
			lastUpdated: new Date()
		});

		console.log('📊 Created analytics document');
		console.log(`   ${simpleTemplates.length} templates`);
		console.log(`   ${totalDownloads} total downloads`);
		console.log(`   ${avgRating.toFixed(1)} average rating`);

	} catch (error) {
		console.error('❌ Seeding failed:', error);
	}
}

async function main() {
	console.log('🚀 Simple template seeding...');
	await seedSimpleTemplates();
	console.log('🎉 Done! Visit: http://localhost:5173/dashboard/store');
	process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}

export { seedSimpleTemplates };