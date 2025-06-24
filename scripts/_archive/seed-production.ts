// scripts/seed-production.ts - FIXED PATHS
process.env.USE_FIREBASE_EMULATOR = 'false';

async function seedProduction() {
	console.log('🚀 Seeding Production Firebase');
	console.log('===============================');

	if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
		console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable not set');
		console.error('   Make sure to set this in your deployment platform (Vercel, etc.)');
		process.exit(1);
	}

	try {
		// Import using the correct paths
		const { seedElements } = await import('./seed/seed-elements.ts');
		const { seedSimplePrompts } = await import('./seed/seed-prompts.ts');

		console.log('📦 Seeding elements...');
		const elementsSuccess = await seedElements();

		if (!elementsSuccess) {
			throw new Error('Elements seeding failed');
		}

		console.log('📝 Seeding prompts...');
		const promptsSuccess = await seedSimplePrompts();

		if (!promptsSuccess) {
			throw new Error('Prompts seeding failed');
		}

		console.log('');
		console.log('✅ Production seeding completed successfully!');
		console.log('🔗 https://console.firebase.google.com/project/pipewriter/firestore');
		console.log('');
		console.log('🚀 Your app is ready for users!');
	} catch (error) {
		console.error('💥 Production seeding failed:', error.message);
		console.error('');
		console.error('🔧 Debug steps:');
		console.error('   1. Check FIREBASE_SERVICE_ACCOUNT is valid JSON');
		console.error('   2. Verify Firebase project permissions');
		console.error('   3. Check network connectivity');
		process.exit(1);
	}
}

seedProduction();
