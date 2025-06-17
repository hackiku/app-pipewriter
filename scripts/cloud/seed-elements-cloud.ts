// scripts/seed-elements-cloud.ts - ELEMENTS ONLY TO CLOUD

// Force production mode
process.env.USE_FIREBASE_EMULATOR = 'false';
process.env.NODE_ENV = 'production';

async function seedElementsCloud() {
	console.log('📦 Seeding Elements to Production Firestore');
	console.log('==========================================');
	console.log('');

	// Check service account
	if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
		console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable not set');
		process.exit(1);
	}

	// Verify service account
	try {
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
		console.log(`✅ Service account verified for project: ${serviceAccount.project_id}`);
	} catch (error) {
		console.error('❌ Invalid service account JSON');
		process.exit(1);
	}

	console.log('');

	try {
		const { seedElements } = await import('./seed/seed-elements.ts');

		console.log('📦 Seeding elements...');
		const success = await seedElements();

		console.log('');
		if (success) {
			console.log('🎉 Elements seeded successfully!');
			console.log('👀 View: https://console.firebase.google.com/project/pipewriter-app/firestore/data/elements');
			process.exit(0);
		} else {
			console.log('💥 Elements seeding failed');
			process.exit(1);
		}

	} catch (error) {
		console.error('💥 Error:', error.message);
		process.exit(1);
	}
}

seedElementsCloud();