// src/routes/api/debug/firestore/+server.ts
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';
import { dev } from '$app/environment';

export async function GET({ url }) {
	// Allow with secret parameter in production
	const secret = url.searchParams.get('secret');
	if (!dev && secret !== 'debug123') {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		console.log('🧪 Debug: Testing Firestore connection...');

		// Test 1: Can we access Firestore?
		const testRef = adminFirestore.collection('_debug').doc('test');
		await testRef.set({ timestamp: new Date(), test: 'connection' });
		console.log('✅ Debug: Write test passed');

		// Test 2: Can we read back?
		const testDoc = await testRef.get();
		if (!testDoc.exists) {
			throw new Error('Document not found after write');
		}
		console.log('✅ Debug: Read test passed');

		// Test 3: Check elements collection
		const elementsSnapshot = await adminFirestore.collection('elements').limit(5).get();
		console.log(`✅ Debug: Found ${elementsSnapshot.size} elements`);

		// Test 4: Check if users collection exists
		const usersSnapshot = await adminFirestore.collection('users').limit(1).get();
		console.log(`✅ Debug: Found ${usersSnapshot.size} users`);

		// Clean up
		await testRef.delete();

		return json({
			success: true,
			tests: {
				firestore_write: true,
				firestore_read: true,
				elements_found: elementsSnapshot.size,
				users_found: usersSnapshot.size
			},
			environment: process.env.NODE_ENV,
			hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
			emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || null
		});

	} catch (error) {
		console.error('❌ Debug: Firestore test failed:', error);

		return json({
			success: false,
			error: error.message,
			environment: process.env.NODE_ENV,
			hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
			emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || null
		}, { status: 500 });
	}
}