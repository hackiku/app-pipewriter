// scripts/seed-production.js
process.env.USE_FIREBASE_EMULATOR = 'false';

async function seed() {
	console.log('🚀 Seeding Production');

	if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
		console.error('❌ FIREBASE_SERVICE_ACCOUNT not set');
		process.exit(1);
	}

	try {
		const { seedElements } = await import('./seed/seed-elements.js');
		const { seedSimplePrompts } = await import('./seed/simple-prompts.js');

		console.log('📦 Seeding elements...');
		await seedElements();

		console.log('📝 Seeding prompts...');
		await seedSimplePrompts();

		console.log('✅ Production seeded!');
		console.log('🔗 https://console.firebase.google.com/project/pipewriter/firestore');
	} catch (e) {
		console.error('💥 Seeding failed:', e.message);
		process.exit(1);
	}
}

seed();
