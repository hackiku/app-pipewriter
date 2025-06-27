// scripts/email/dev-seed-email.ts - SAFE ENVIRONMENT HANDLING  
// No global environment pollution - keeps your main seed scripts untouched

/**
 * Temporarily set environment for this script only
 */
async function withEmulatorEnvironment<T>(fn: () => Promise<T>): Promise<T> {
	// Save original environment
	const originalEnv = {
		USE_FIREBASE_EMULATOR: process.env.USE_FIREBASE_EMULATOR,
		NODE_ENV: process.env.NODE_ENV,
		FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT
	};

	try {
		// Set emulator environment for this script only
		process.env.USE_FIREBASE_EMULATOR = 'true';
		process.env.NODE_ENV = 'development';
		delete process.env.FIREBASE_SERVICE_ACCOUNT;

		console.log('🔧 Temporarily set emulator environment for seeding');

		// Run the function
		const result = await fn();

		return result;
	} finally {
		// Restore original environment
		if (originalEnv.USE_FIREBASE_EMULATOR !== undefined) {
			process.env.USE_FIREBASE_EMULATOR = originalEnv.USE_FIREBASE_EMULATOR;
		} else {
			delete process.env.USE_FIREBASE_EMULATOR;
		}

		if (originalEnv.NODE_ENV !== undefined) {
			process.env.NODE_ENV = originalEnv.NODE_ENV;
		}

		if (originalEnv.FIREBASE_SERVICE_ACCOUNT !== undefined) {
			process.env.FIREBASE_SERVICE_ACCOUNT = originalEnv.FIREBASE_SERVICE_ACCOUNT;
		}

		console.log('✅ Restored original environment');
	}
}

/**
 * Clear email data from emulators without restarting
 */
async function clearEmailData() {
	try {
		// Import after env vars are set
		const { adminFirestore } = await import('../../src/lib/server/firebase-admin.ts');

		console.log('   🗑️ Clearing email templates...');
		// Delete email/templates subcollection
		const templatesSnapshot = await adminFirestore
			.collection('email')
			.doc('templates')
			.collection('items')
			.get();

		if (!templatesSnapshot.empty) {
			const batch1 = adminFirestore.batch();
			templatesSnapshot.docs.forEach((doc) => batch1.delete(doc.ref));
			await batch1.commit();
			console.log(`   🗑️ Deleted ${templatesSnapshot.size} email templates`);
		}

		console.log('   🗑️ Clearing email sequences...');
		// Delete email/sequences subcollection  
		const sequencesSnapshot = await adminFirestore
			.collection('email')
			.doc('sequences')
			.collection('items')
			.get();

		if (!sequencesSnapshot.empty) {
			const batch2 = adminFirestore.batch();
			sequencesSnapshot.docs.forEach((doc) => batch2.delete(doc.ref));
			await batch2.commit();
			console.log(`   🗑️ Deleted ${sequencesSnapshot.size} email sequences`);
		}

		console.log('   🗑️ Clearing email analytics...');
		// Clear analytics subcollections
		const templateAnalyticsSnapshot = await adminFirestore
			.collection('email')
			.doc('templates')
			.collection('_meta')
			.get();

		if (!templateAnalyticsSnapshot.empty) {
			const batch3 = adminFirestore.batch();
			templateAnalyticsSnapshot.docs.forEach((doc) => batch3.delete(doc.ref));
			await batch3.commit();
		}

		const sequenceAnalyticsSnapshot = await adminFirestore
			.collection('email')
			.doc('sequences')
			.collection('_meta')
			.get();

		if (!sequenceAnalyticsSnapshot.empty) {
			const batch4 = adminFirestore.batch();
			sequenceAnalyticsSnapshot.docs.forEach((doc) => batch4.delete(doc.ref));
			await batch4.commit();
		}

	} catch (error) {
		console.warn('⚠️ Could not clear email data:', error.message);
		console.warn('   Data will be overwritten during seeding');
	}
}

async function seedEmailDev() {
	const shouldClear = process.argv.includes('--clear');

	console.log('📧 DEVELOPMENT EMAIL SEEDING (Emulators Only)');
	console.log('===============================================');
	console.log('');
	console.log('🎯 Target: Firebase Emulators');
	console.log('   Firestore: http://127.0.0.1:8080');
	console.log('   Auth: http://127.0.0.1:9099');
	console.log('   UI: http://127.0.0.1:5000');
	if (shouldClear) {
		console.log('   🗑️ Clear mode: Will delete existing email data first');
	}
	console.log('');

	// Run seeding with safe environment isolation
	await withEmulatorEnvironment(async () => {
		console.log('🔧 Connecting to emulators...');

		try {
			// Clear existing data if requested
			if (shouldClear) {
				console.log('🗑️ Clearing existing email data...');
				await clearEmailData();
				console.log('✅ Email data cleared');
				console.log('');
			}

			// Import seeding functions (they'll use emulator automatically)
			const { seedEmailTemplates } = await import('./templates/seed-templates.ts');
			const { seedEmailSequences } = await import('./sequences/seed-sequences.ts');

			let templatesSuccess = false;
			let sequencesSuccess = false;

			// Seed email templates
			console.log('📧 Seeding email templates to emulator...');
			try {
				templatesSuccess = await seedEmailTemplates();
				if (templatesSuccess) {
					console.log('✅ Email templates seeded to emulator');
				} else {
					console.log('❌ Email templates seeding failed');
				}
			} catch (error) {
				console.error('❌ Templates error:', error.message);
			}

			console.log('');

			// Seed email sequences
			console.log('📅 Seeding email sequences to emulator...');
			try {
				sequencesSuccess = await seedEmailSequences();
				if (sequencesSuccess) {
					console.log('✅ Email sequences seeded to emulator');
				} else {
					console.log('❌ Email sequences seeding failed');
				}
			} catch (error) {
				console.error('❌ Sequences error:', error.message);
			}

			console.log('');
			console.log('📊 Development Email Seeding Summary:');
			console.log(`   Templates: ${templatesSuccess ? '✅' : '❌'}`);
			console.log(`   Sequences: ${sequencesSuccess ? '✅' : '❌'}`);
			console.log('');

			if (templatesSuccess && sequencesSuccess) {
				console.log('🎉 Development email seeding completed successfully!');
				console.log('');
				console.log('👀 View your email data:');
				console.log('   Firestore UI: http://127.0.0.1:5000/firestore');
				console.log('   Email Collection: http://127.0.0.1:5000/firestore/data/email');
				console.log('   Templates: http://127.0.0.1:5000/firestore/data/email/templates/items');
				console.log('   Sequences: http://127.0.0.1:5000/firestore/data/email/sequences/items');
				console.log('');
				console.log('📧 Ready to send some emails!');
				console.log('   Test endpoint: POST /api/email/subscribe');
				console.log('   Welcome sequence: 3 emails (0h, 24h, 72h)');
				process.exit(0);
			} else {
				console.log('💥 Some operations failed. Check errors above.');
				process.exit(1);
			}
		} catch (error) {
			console.error('💥 Development email seeding failed:', error.message);
			console.error('');
			console.error('🔧 Troubleshooting:');
			console.error('   1. Make sure emulators are running: firebase emulators:start');
			console.error('   2. Check emulator ports (5000, 8080, 9099)');
			console.error('   3. Run with --clear to reset email data');
			console.error('   4. Check that template files exist in templates/ directory');
			process.exit(1);
		}
	});
}

// Run the seeding
seedEmailDev();