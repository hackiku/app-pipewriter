// scripts/seed/seed-dev.ts - DEV ONLY (Emulators)
// Forces emulator environment, no flags, no confusion

// FORCE emulator environment - no detection chaos
process.env.USE_FIREBASE_EMULATOR = 'true';
process.env.NODE_ENV = 'development';

// Clear any production env vars to prevent conflicts
delete process.env.FIREBASE_SERVICE_ACCOUNT;

async function seedDev() {
	console.log('🔧 DEVELOPMENT SEEDING (Emulators Only)');
	console.log('==========================================');
	console.log('');
	console.log('🎯 Target: Firebase Emulators');
	console.log('   Firestore: http://127.0.0.1:8080');
	console.log('   Auth: http://127.0.0.1:9099');
	console.log('   UI: http://127.0.0.1:5000');
	console.log('');

	console.log('🔧 Connecting to emulators...');

	try {
		// Import seeding functions (they'll use emulator automatically)
		const { seedElements } = await import('./elements/seed-elements.ts');
		const { seedPrompts } = await import('./prompts/seed-prompts.ts');

		let elementsSuccess = false;
		let promptsSuccess = false;

		// Seed elements
		console.log('📦 Seeding elements to emulator...');
		try {
			elementsSuccess = await seedElements();
			if (elementsSuccess) {
				console.log('✅ Elements seeded to emulator');
			} else {
				console.log('❌ Elements seeding failed');
			}
		} catch (error) {
			console.error('❌ Elements error:', error.message);
		}

		console.log('');

		// Seed prompts
		console.log('📝 Seeding prompts to emulator...');
		try {
			promptsSuccess = await seedPrompts();
			if (promptsSuccess) {
				console.log('✅ Prompts seeded to emulator');
			} else {
				console.log('❌ Prompts seeding failed');
			}
		} catch (error) {
			console.error('❌ Prompts error:', error.message);
		}

		console.log('');
		console.log('📊 Development Seeding Summary:');
		console.log(`   Elements: ${elementsSuccess ? '✅' : '❌'}`);
		console.log(`   Prompts:  ${promptsSuccess ? '✅' : '❌'}`);
		console.log('');

		if (elementsSuccess && promptsSuccess) {
			console.log('🎉 Development seeding completed successfully!');
			console.log('');
			console.log('👀 View your data:');
			console.log('   Firestore UI: http://127.0.0.1:5000/firestore');
			console.log('   Elements: http://127.0.0.1:5000/firestore/data/elements');
			console.log('   Prompts: http://127.0.0.1:5000/firestore/data/prompts');
			console.log('');
			console.log('🚀 Ready to develop!');
			console.log('   Run: npm run dev');
			process.exit(0);
		} else {
			console.log('💥 Some operations failed. Check errors above.');
			process.exit(1);
		}
	} catch (error) {
		console.error('💥 Development seeding failed:', error.message);
		console.error('');
		console.error('🔧 Troubleshooting:');
		console.error('   1. Make sure emulators are running: firebase emulators:start');
		console.error('   2. Check emulator ports (5000, 8080, 9099)');
		console.error('   3. Clear emulator data if needed: npm run emulators:clear');
		process.exit(1);
	}
}

// Run the seeding
seedDev();
