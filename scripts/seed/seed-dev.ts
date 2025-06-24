// scripts/seed/seed-dev.ts - DEV ONLY (Emulators)
// Forces emulator environment, no flags, no confusion

// FORCE emulator environment - no detection chaos
process.env.USE_FIREBASE_EMULATOR = 'true';
process.env.NODE_ENV = 'development';

// Clear any production env vars to prevent conflicts
delete process.env.FIREBASE_SERVICE_ACCOUNT;

/**
 * Clear emulator data without restarting emulators
 */
async function clearEmulatorData() {
	try {
		// Import after env vars are set
		const { adminFirestore } = await import('../../src/lib/server/firebase-admin.ts');

		// Delete elements collection
		const elementsSnapshot = await adminFirestore.collection('elements').get();
		if (!elementsSnapshot.empty) {
			const batch1 = adminFirestore.batch();
			elementsSnapshot.docs.forEach((doc) => batch1.delete(doc.ref));
			await batch1.commit();
			console.log(`   🗑️ Deleted ${elementsSnapshot.size} elements`);
		}

		// Delete prompts collection
		const promptsSnapshot = await adminFirestore.collection('prompts').get();
		if (!promptsSnapshot.empty) {
			const batch2 = adminFirestore.batch();
			promptsSnapshot.docs.forEach((doc) => batch2.delete(doc.ref));
			await batch2.commit();
			console.log(`   🗑️ Deleted ${promptsSnapshot.size} prompts`);
		}
	} catch (error) {
		console.warn('⚠️ Could not clear data:', error.message);
		console.warn('   Data will be overwritten during seeding');
	}
}

async function seedDev() {
	const shouldClear = process.argv.includes('--clear');

	console.log('🔧 DEVELOPMENT SEEDING (Emulators Only)');
	console.log('==========================================');
	console.log('');
	console.log('🎯 Target: Firebase Emulators');
	console.log('   Firestore: http://127.0.0.1:8080');
	console.log('   Auth: http://127.0.0.1:9099');
	console.log('   UI: http://127.0.0.1:5000');
	if (shouldClear) {
		console.log('   🗑️ Clear mode: Will delete existing data first');
	}
	console.log('');

	console.log('🔧 Connecting to emulators...');

	try {
		// Clear existing data if requested
		if (shouldClear) {
			console.log('🗑️ Clearing existing emulator data...');
			await clearEmulatorData();
			console.log('✅ Emulator data cleared');
			console.log('');
		}

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
