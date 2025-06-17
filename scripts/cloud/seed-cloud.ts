// scripts/seed-cloud.ts - SIMPLE CLOUD-ONLY SEEDING
// No flags, no complexity, just works with production Firestore

// Force production mode
process.env.USE_FIREBASE_EMULATOR = 'false';
process.env.NODE_ENV = 'production';

async function seedCloud() {
	console.log('🌐 Seeding Production Firestore');
	console.log('==============================');
	console.log('');

	// Check service account
	if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
		console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable not set');
		console.error('   Set this in your environment or deployment platform');
		process.exit(1);
	}

	// Verify service account project
	try {
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
		if (serviceAccount.project_id !== 'pipewriter-app') {
			console.error('❌ Wrong project ID in service account');
			console.error(`   Expected: pipewriter-app, Got: ${serviceAccount.project_id}`);
			process.exit(1);
		}
		console.log(`✅ Service account verified for project: ${serviceAccount.project_id}`);
	} catch (error) {
		console.error('❌ Invalid FIREBASE_SERVICE_ACCOUNT JSON:', error.message);
		process.exit(1);
	}

	console.log('');

	try {
		// Import seeding functions
		const { seedElements } = await import('../seed/seed-elements.ts');
		const { seedSimplePrompts } = await import('../seed/seed-prompts.ts');

		let elementsSuccess = false;
		let promptsSuccess = false;

		// Seed elements
		console.log('📦 Seeding elements to cloud Firestore...');
		try {
			elementsSuccess = await seedElements();
			if (elementsSuccess) {
				console.log('✅ Elements seeded successfully');
			} else {
				console.log('❌ Elements seeding failed');
			}
		} catch (error) {
			console.error('❌ Elements seeding error:', error.message);
		}

		console.log('');

		// Seed prompts
		console.log('📝 Seeding prompts to cloud Firestore...');
		try {
			promptsSuccess = await seedSimplePrompts();
			if (promptsSuccess) {
				console.log('✅ Prompts seeded successfully');
			} else {
				console.log('❌ Prompts seeding failed');
			}
		} catch (error) {
			console.error('❌ Prompts seeding error:', error.message);
		}

		console.log('');
		console.log('📊 Seeding Summary:');
		console.log(`   Elements: ${elementsSuccess ? '✅' : '❌'}`);
		console.log(`   Prompts:  ${promptsSuccess ? '✅' : '❌'}`);
		console.log('');

		if (elementsSuccess && promptsSuccess) {
			console.log('🎉 Cloud seeding completed successfully!');
			console.log('');
			console.log('👀 View your data:');
			console.log('   https://console.firebase.google.com/project/pipewriter-app/firestore');
			console.log('');
			console.log('🚀 Ready to deploy to production!');
			process.exit(0);
		} else {
			console.log('💥 Some operations failed. Check errors above.');
			process.exit(1);
		}

	} catch (error) {
		console.error('💥 Cloud seeding failed:', error.message);
		console.error('');
		console.error('🔧 Troubleshooting:');
		console.error('   1. Verify FIREBASE_SERVICE_ACCOUNT is valid JSON');
		console.error('   2. Check service account has Firestore permissions');
		console.error('   3. Ensure network connectivity to Firebase');
		console.error('   4. Try running: bun run scripts/test-cloud-connection.ts');
		process.exit(1);
	}
}

// Run the seeding
seedCloud();