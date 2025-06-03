// src/routes/api/debug/data/+server.ts - Test data loading in Vercel
import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';

export async function GET({ url }) {
	// Only allow with debug param
	if (!dev && !url.searchParams.has('debug')) {
		return json({ error: 'Debug endpoint disabled' }, { status: 403 });
	}

	try {
		console.log('🔍 Debug: Testing data loading in Vercel...');

		// Test environment
		const environment = {
			isDev: dev,
			nodeEnv: process.env.NODE_ENV,
			hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
			useEmulator: process.env.USE_FIREBASE_EMULATOR,
			timestamp: new Date().toISOString()
		};

		console.log('Environment:', environment);

		// Test Firebase connection
		const { adminFirestore } = await import('$lib/server/firebase-admin');
		console.log('✅ Firebase admin imported');

		// Test collections exist
		const elementsSnapshot = await adminFirestore.collection('elements').limit(1).get();
		const promptsSnapshot = await adminFirestore.collection('prompts').limit(1).get();
		const usersSnapshot = await adminFirestore.collection('users').limit(1).get();

		console.log(`Collections: elements=${elementsSnapshot.size}, prompts=${promptsSnapshot.size}, users=${usersSnapshot.size}`);

		// Test data loaders
		const { getFilteredElements, getFilteredPrompts } = await import('$lib/server/data-loaders');
		const { getUserWithFeatures } = await import('$lib/server/user-features');

		console.log('✅ Data loaders imported');

		// Test elements loading
		const elements = await getFilteredElements('free');
		const elementCount = Object.values(elements).flat().length;

		console.log(`Elements loaded: ${elementCount} total, ${Object.keys(elements).length} categories`);

		// Test user features (with fake user)
		const userFeatures = await getUserWithFeatures('fake-user-debug');
		console.log('User features:', userFeatures);

		// Test with real user if exists
		let realUserTest = null;
		if (!usersSnapshot.empty) {
			const realUid = usersSnapshot.docs[0].id;
			console.log(`Testing with real user: ${realUid}`);

			const realUserFeatures = await getUserWithFeatures(realUid);
			const realPrompts = await getFilteredPrompts(realUserFeatures.tier, realUid);

			realUserTest = {
				uid: realUid,
				features: realUserFeatures,
				promptCount: Object.values(realPrompts).flat().length
			};
		}

		return json({
			success: true,
			environment,
			firebase: {
				connected: true,
				collections: {
					elements: elementsSnapshot.size,
					prompts: promptsSnapshot.size,
					users: usersSnapshot.size
				}
			},
			dataLoaders: {
				elementsWorking: elementCount > 0,
				elementCount,
				categoriesCount: Object.keys(elements).length,
				userFeaturesWorking: !!userFeatures,
				realUserTest
			},
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ Debug data loading failed:', error);

		return json({
			success: false,
			error: error.message,
			stack: error.stack,
			environment: {
				isDev: dev,
				nodeEnv: process.env.NODE_ENV,
				hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT
			}
		}, { status: 500 });
	}
}