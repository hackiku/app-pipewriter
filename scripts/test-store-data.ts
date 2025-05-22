// scripts/test-store-data.ts
// Quick script to verify store data structure

import { adminFirestore } from '../src/lib/server/firebase-admin.js';

async function testStoreData() {
	console.log('🧪 Testing store data structure...');

	try {
		// Get templates (excluding analytics document)
		const snapshot = await adminFirestore
			.collection('store')
			.where('__name__', '!=', '_analytics') // Exclude analytics doc
			.limit(1)
			.get();

		if (snapshot.empty) {
			console.log('❌ No templates found in store collection');
			console.log('💡 Run: bun run scripts/seed-store.ts to add test data');
			return;
		}

		const doc = snapshot.docs[0];
		const data = doc.data();

		console.log('📄 Sample template data:');
		console.log('ID:', doc.id);
		console.log('Name:', data.name);
		console.log('Tags:', data.tags, '(type:', typeof data.tags, 'isArray:', Array.isArray(data.tags), ')');
		console.log('Sections:', data.sections, '(type:', typeof data.sections, 'isArray:', Array.isArray(data.sections), ')');
		console.log('BundleIncludes:', data.bundleIncludes, '(type:', typeof data.bundleIncludes, 'isArray:', Array.isArray(data.bundleIncludes), ')');

		// Check for required fields
		const requiredFields = ['name', 'description', 'price', 'category'];
		const missingFields = requiredFields.filter(field => !data[field]);

		if (missingFields.length > 0) {
			console.log('⚠️  Missing required fields:', missingFields);
		} else {
			console.log('✅ All required fields present');
		}

		// Check array fields
		const arrayFields = ['tags', 'sections'];
		arrayFields.forEach(field => {
			if (data[field] && !Array.isArray(data[field])) {
				console.log(`❌ ${field} is not an array:`, typeof data[field]);
			} else {
				console.log(`✅ ${field} is properly formatted`);
			}
		});

	} catch (error) {
		console.error('❌ Error testing store data:', error);
	}
}

// Fix any data issues found (but skip analytics)
async function fixStoreData() {
	console.log('🔧 Fixing store data issues...');

	try {
		// Get all documents EXCEPT analytics
		const snapshot = await adminFirestore
			.collection('store')
			.where('__name__', '!=', '_analytics')
			.get();

		const batch = adminFirestore.batch();
		let fixCount = 0;

		snapshot.docs.forEach(doc => {
			const data = doc.data();
			const fixes = {};

			// Skip if this looks like an analytics document
			if (doc.id === '_analytics' || data.totalTemplates !== undefined) {
				console.log(`⏭️  Skipping analytics document: ${doc.id}`);
				return;
			}

			// Ensure arrays are arrays
			if (!Array.isArray(data.tags)) {
				fixes.tags = [];
			}
			if (!Array.isArray(data.sections)) {
				fixes.sections = [];
			}
			if (data.bundleIncludes && !Array.isArray(data.bundleIncludes)) {
				fixes.bundleIncludes = [];
			}

			// Ensure required fields exist
			if (!data.name) fixes.name = 'Untitled Template';
			if (!data.description) fixes.description = 'No description available';
			if (!data.category) fixes.category = 'Template';
			if (typeof data.price !== 'number') fixes.price = 0;
			if (typeof data.downloadCount !== 'number') fixes.downloadCount = 0;
			if (typeof data.rating !== 'number') fixes.rating = 0;
			if (typeof data.reviews !== 'number') fixes.reviews = 0;

			// Apply fixes if needed
			if (Object.keys(fixes).length > 0) {
				batch.update(doc.ref, fixes);
				fixCount++;
				console.log(`📝 Fixing template ${doc.id}:`, Object.keys(fixes));
			}
		});

		if (fixCount > 0) {
			await batch.commit();
			console.log(`✅ Fixed ${fixCount} templates`);
		} else {
			console.log('✅ No fixes needed');
		}

	} catch (error) {
		console.error('❌ Error fixing store data:', error);
	}
}

// Check if we have any actual templates (not just analytics)
async function checkTemplateCount() {
	console.log('📊 Checking template count...');

	try {
		// Count templates (excluding analytics)
		const templatesSnapshot = await adminFirestore
			.collection('store')
			.where('active', '==', true)
			.get();

		const templates = templatesSnapshot.docs.filter(doc => doc.id !== '_analytics');
		const analytics = templatesSnapshot.docs.find(doc => doc.id === '_analytics');

		console.log(`📦 Found ${templates.length} templates`);
		console.log(`📈 Analytics document: ${analytics ? 'exists' : 'missing'}`);

		if (templates.length === 0) {
			console.log('💡 No templates found. Run: bun run scripts/seed-store.ts');
		} else {
			console.log('✅ Templates are available');
			// Show template names
			templates.slice(0, 3).forEach(doc => {
				console.log(`   - ${doc.data().name || doc.id}`);
			});
			if (templates.length > 3) {
				console.log(`   ... and ${templates.length - 3} more`);
			}
		}

	} catch (error) {
		console.error('❌ Error checking templates:', error);
	}
}

// Main function
async function main() {
	await checkTemplateCount();
	console.log('');
	await testStoreData();
	console.log('');
	await fixStoreData();
	console.log('');
	console.log('🎉 Store data test complete!');
	process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}

export { testStoreData, fixStoreData, checkTemplateCount };