// scripts/debug-firebase.ts
process.env.USE_FIREBASE_EMULATOR = 'false';

async function debug() {
	console.log('🔍 Firebase Debug');
	console.log(`ENV: ${!!process.env.FIREBASE_SERVICE_ACCOUNT ? 'SET' : 'MISSING'}`);

	if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
		console.log('❌ Set FIREBASE_SERVICE_ACCOUNT first');
		console.log(
			'Get from: https://console.firebase.google.com/project/pipewriter/settings/serviceaccounts'
		);
		return;
	}

	try {
		const { adminFirestore } = await import('../src/lib/server/firebase-admin.js');

		// Test write
		await adminFirestore.collection('_test').doc('debug').set({ ts: new Date() });
		console.log('✅ Write test passed');

		// Check collections
		const elements = await adminFirestore.collection('elements').limit(1).get();
		const prompts = await adminFirestore.collection('prompts').limit(1).get();
		console.log(`📊 Elements: ${elements.size}, Prompts: ${prompts.size}`);

		// Cleanup
		await adminFirestore.collection('_test').doc('debug').delete();
		console.log('🎉 All good!');
	} catch (e) {
		console.error('❌', e.message);
	}
}

debug();
