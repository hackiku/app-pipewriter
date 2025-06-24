// scripts/seed/seed-prod.ts - PRODUCTION ONLY
// Forces production environment, requires service account, has safety checks

// FORCE production environment - no detection chaos
process.env.USE_FIREBASE_EMULATOR = 'false';
process.env.NODE_ENV = 'production';

async function seedProd() {
	console.log('🌐 PRODUCTION SEEDING');
	console.log('=====================');
	console.log('');
	console.log('⚠️  WARNING: This will modify LIVE production data!');
	console.log('');

	// SAFETY: Require service account
	if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
		console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable required');
		console.error('   This script only works with production Firebase');
		console.error('   Set the service account JSON in your environment');
		process.exit(1);
	}

	// SAFETY: Verify service account project
	try {
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
		if (serviceAccount.project_id !== 'pipewriter-app') {
			console.error('❌ Wrong project ID in service account');
			console.error(`   Expected: pipewriter-app`);
			console.error(`   Got: ${serviceAccount.project_id}`);
			process.exit(1);
		}
		console.log(`✅ Service account verified for project: ${serviceAccount.project_id}`);
	} catch (error) {
		console.error('❌ Invalid FIREBASE_SERVICE_ACCOUNT JSON:', error.message);
		process.exit(1);
	}

	// SAFETY: Check for --force flag (since this is production)
	const hasForceFlag = process.argv.includes('--force');
	if (!hasForceFlag) {
		console.error('❌ Production seeding requires --force flag for safety');
		console.error('   Run: bun run scripts/seed/seed-prod.ts --force');
		console.error('');
		console.error('   This prevents accidental production data modification');
		process.exit(1);
	}

	console.log('🔥 Target: Firebase Production');
	console.log('   Project: pipewriter-app');
	console.log('   Console: https://console.firebase.google.com/project/pipewriter-app');
	console.log('');

	// Final confirmation
	console.log('⏰ Starting in 3 seconds...');
	await new Promise((resolve) => setTimeout(resolve, 3000));

	try {
		// Import seeding functions (they'll use production automatically)
		const { seedElements } = await import('./elements/seed-elements.ts');
		const { seedPrompts } = await import('./prompts/seed-prompts.ts');

		let elementsSuccess = false;
		let promptsSuccess = false;

		// Seed elements
		console.log('📦 Seeding elements to production...');
		try {
			elementsSuccess = await seedElements();
			if (elementsSuccess) {
				console.log('✅ Elements seeded to production');
			} else {
				console.log('❌ Elements seeding failed');
			}
		} catch (error) {
			console.error('❌ Elements error:', error.message);
		}

		console.log('');

		// Seed prompts
		console.log('📝 Seeding prompts to production...');
		try {
			promptsSuccess = await seedPrompts();
			if (promptsSuccess) {
				console.log('✅ Prompts seeded to production');
			} else {
				console.log('❌ Prompts seeding failed');
			}
		} catch (error) {
			console.error('❌ Prompts error:', error.message);
		}

		console.log('');
		console.log('📊 Production Seeding Summary:');
		console.log(`   Elements: ${elementsSuccess ? '✅' : '❌'}`);
		console.log(`   Prompts:  ${promptsSuccess ? '✅' : '❌'}`);
		console.log('');

		if (elementsSuccess && promptsSuccess) {
			console.log('🎉 Production seeding completed successfully!');
			console.log('');
			console.log('👀 View your data:');
			console.log(
				'   Firebase Console: https://console.firebase.google.com/project/pipewriter-app/firestore'
			);
			console.log(
				'   Elements: https://console.firebase.google.com/project/pipewriter-app/firestore/data/elements'
			);
			console.log(
				'   Prompts: https://console.firebase.google.com/project/pipewriter-app/firestore/data/prompts'
			);
			console.log('');
			console.log('🚀 Production is ready!');
			process.exit(0);
		} else {
			console.log('💥 Some operations failed. Check errors above.');
			process.exit(1);
		}
	} catch (error) {
		console.error('💥 Production seeding failed:', error.message);
		console.error('');
		console.error('🔧 Troubleshooting:');
		console.error('   1. Verify FIREBASE_SERVICE_ACCOUNT is valid JSON');
		console.error('   2. Check service account has Firestore permissions');
		console.error('   3. Ensure network connectivity to Firebase');
		console.error('   4. Check project ID is correct (pipewriter-app)');
		process.exit(1);
	}
}

// Run the seeding
seedProd();
