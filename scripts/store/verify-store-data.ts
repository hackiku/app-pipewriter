// scripts/verify-store-data.ts
// Simple script to verify store data is working

import { adminFirestore } from '../src/lib/server/firebase-admin.js';

async function verifyStoreData() {
	console.log('🔍 Verifying store data...');

	try {
		// Get all documents from store collection
		const snapshot = await adminFirestore.collection('store').get();

		if (snapshot.empty) {
			console.log('❌ Store collection is empty');
			console.log('💡 Run: bun run scripts/quick-seed-templates.ts');
			return;
		}

		console.log(`📦 Found ${snapshot.size} documents in store collection`);

		// Check each document
		const templates = [];
		let analyticsDoc = null;

		snapshot.docs.forEach(doc => {
			const data = doc.data();

			if (doc.id === '_analytics') {
				analyticsDoc = data;
				console.log('📊 Analytics document found');
			} else {
				templates.push({
					id: doc.id,
					name: data.name,
					price: data.price,
					category: data.category,
					tags: data.tags,
					active: data.active
				});
			}
		});

		console.log(`✅ Found ${templates.length} templates`);

		// Show first few templates
		templates.slice(0, 3).forEach((template, i) => {
			console.log(`   ${i + 1}. ${template.name} - $${template.price} (${template.category})`);
		});

		if (templates.length > 3) {
			console.log(`   ... and ${templates.length - 3} more`);
		}

		// Check for required fields
		const issues = [];
		templates.forEach(template => {
			if (!template.name) issues.push(`${template.id}: missing name`);
			if (typeof template.price !== 'number') issues.push(`${template.id}: invalid price`);
			if (!template.category) issues.push(`${template.id}: missing category`);
			if (!Array.isArray(template.tags)) issues.push(`${template.id}: tags not array`);
		});

		if (issues.length > 0) {
			console.log('⚠️  Issues found:');
			issues.forEach(issue => console.log(`   - ${issue}`));
		} else {
			console.log('✅ All templates have required fields');
		}

		// Analytics status
		if (analyticsDoc) {
			console.log('📊 Analytics data:');
			console.log(`   Total Templates: ${analyticsDoc.totalTemplates}`);
			console.log(`   Total Downloads: ${analyticsDoc.totalDownloads}`);
			console.log(`   Average Rating: ${analyticsDoc.averageRating}`);
		} else {
			console.log('⚠️  No analytics document found');
		}

	} catch (error) {
		console.error('❌ Error verifying store data:', error);
	}
}

async function testStoreQuery() {
	console.log('🧪 Testing store query (like the page server does)...');

	try {
		// Simulate the exact query from the page server
		const storeSnapshot = await adminFirestore.collection('store').get();

		const allDocs = storeSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		}));

		const templates = allDocs
			.filter(doc => doc.id !== '_analytics')
			.map(template => ({
				id: template.id,
				name: template.name || 'Untitled',
				price: template.price || 0,
				category: template.category || 'Template',
				tags: Array.isArray(template.tags) ? template.tags : []
			}));

		console.log(`✅ Query successful: ${templates.length} templates processed`);
		console.log('✅ This should work on the website now');

	} catch (error) {
		console.error('❌ Query test failed:', error);
	}
}

async function main() {
	await verifyStoreData();
	console.log('');
	await testStoreQuery();
	console.log('');
	console.log('🎉 Verification complete!');
	console.log('');
	console.log('🌐 Try the store page: http://localhost:5173/dashboard/store');
	process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}

export { verifyStoreData, testStoreQuery };