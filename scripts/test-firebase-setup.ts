// scripts/test-firebase-setup.ts
import { adminFirestore } from '../src/lib/server/firebase-admin.ts';

async function testFirebaseSetup() {
	console.log('🧪 Testing Firebase setup with Bun...');

	try {
		// Test connection by trying to read a collection
		console.log('1. Testing Firestore emulator connection...');
		const elementsSnapshot = await adminFirestore.collection('elements').get();
		console.log(`   ✅ Connected! Found ${elementsSnapshot.size} elements`);

		if (elementsSnapshot.size === 0) {
			console.log('   ⚠️  No elements found. Run: bun run seed');
			return;
		}

		// Test queries
		console.log('2. Testing element queries...');

		// Count by tier
		const freeElements = await adminFirestore
			.collection('elements')
			.where('tier', '==', 'free')
			.get();

		const proElements = await adminFirestore
			.collection('elements')
			.where('tier', '==', 'pro')
			.get();

		console.log(`   ✅ Free elements: ${freeElements.size}`);
		console.log(`   ✅ Pro elements: ${proElements.size}`);

		// Test users
		console.log('3. Testing users...');
		const usersSnapshot = await adminFirestore.collection('users').get();
		console.log(`   ✅ Found ${usersSnapshot.size} test users`);

		// Show sample data
		if (elementsSnapshot.size > 0) {
			const sampleElement = elementsSnapshot.docs[0];
			const data = sampleElement.data();

			console.log('4. Sample element:');
			console.log(`   ID: ${sampleElement.id}`);
			console.log(`   Category: ${data.category}`);
			console.log(`   Tier: ${data.tier}`);
			console.log(`   SVG Path: ${data.svgPath}`);
		}

		console.log('');
		console.log('🎉 All tests passed!');
		console.log('🌐 Emulator UI: http://localhost:5000');
		console.log('');

	} catch (error) {
		console.error('❌ Test failed:', error);
		console.log('');
		console.log('Troubleshooting:');
		console.log('1. Start emulators: bun run emulators');
		console.log('2. Seed data: bun run seed');
		console.log('3. Check emulator UI: http://localhost:5000');
	}
}

// Run the test
testFirebaseSetup();