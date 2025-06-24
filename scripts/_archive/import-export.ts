// scripts/quick-export-import.ts - One-shot export from emulator → production
async function quickExportImport() {
	console.log('🔄 Export from emulator → Import to production');

	// Step 1: Export from emulator
	console.log('📦 Reading from emulator...');
	process.env.USE_FIREBASE_EMULATOR = 'true';
	const { adminFirestore: emulatorDb } = await import('../src/lib/server/firebase-admin.js');

	const [elementsSnapshot, promptsSnapshot] = await Promise.all([
		emulatorDb.collection('elements').get(),
		emulatorDb.collection('prompts').get()
	]);

	const elements = elementsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	const prompts = promptsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

	console.log(`📦 Found ${elements.length} elements, ${prompts.length} prompts in emulator`);

	// Step 2: Import to production
	console.log('🚀 Writing to production...');
	process.env.USE_FIREBASE_EMULATOR = 'false';

	// Re-import to get production connection
	delete require.cache[require.resolve('../src/lib/server/firebase-admin.js')];
	const { adminFirestore: prodDb } = await import('../src/lib/server/firebase-admin.js');

	// Batch write to production
	const batch = prodDb.batch();

	elements.forEach((element) => {
		const ref = prodDb.collection('elements').doc(element.id);
		batch.set(ref, element);
	});

	prompts.forEach((prompt) => {
		const ref = prodDb.collection('prompts').doc(prompt.id);
		batch.set(ref, prompt);
	});

	await batch.commit();
	console.log(`✅ Imported ${elements.length} elements, ${prompts.length} prompts to production`);
	console.log('🔗 Check: https://console.firebase.google.com/project/pipewriter/firestore');
}

quickExportImport().catch(console.error);
