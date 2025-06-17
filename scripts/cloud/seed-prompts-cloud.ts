// scripts/seed-prompts-cloud.ts - PROMPTS ONLY TO CLOUD

// Force production mode
process.env.USE_FIREBASE_EMULATOR = 'false';
process.env.NODE_ENV = 'production';

async function seedPromptsCloud() {
	console.log('📝 Seeding Prompts to Production Firestore');
	console.log('=========================================');
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
		const { seedSimplePrompts } = await import('./seed/seed-prompts.ts');

		console.log('📝 Seeding prompts...');
		const success = await seedSimplePrompts();

		console.log('');
		if (success) {
			console.log('🎉 Prompts seeded successfully!');
			console.log('👀 View: https://console.firebase.google.com/project/pipewriter-app/firestore/data/prompts');
			process.exit(0);
		} else {
			console.log('💥 Prompts seeding failed');
			process.exit(1);
		}

	} catch (error) {
		console.error('💥 Error:', error.message);
		process.exit(1);
	}
}

seedPromptsCloud();