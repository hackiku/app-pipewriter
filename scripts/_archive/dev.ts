// scripts/seed/dev.ts
process.env.USE_FIREBASE_EMULATOR = 'true';

async function seedDev() {
	console.log('🔧 Seeding Development (Emulator)');

	try {
		const { seedElements } = await import('./seed-elements.ts');
		const { seedSimplePrompts } = await import('./simple-prompts.ts');

		console.log('📦 Seeding elements...');
		await seedElements();

		console.log('📝 Seeding prompts...');
		await seedSimplePrompts();

		console.log('✅ Development seeded!');
		console.log('🔗 http://localhost:4000/firestore (Emulator UI)');
	} catch (e) {
		console.error('💥 Dev seeding failed:', e.message);
		console.error('📋 Make sure Firebase emulator is running: firebase emulators:start');
		process.exit(1);
	}
}

seedDev();