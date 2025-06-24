// scripts/test-cloud-connection.ts
// Quick test to verify cloud Firestore connection

// Force production mode
process.env.USE_FIREBASE_EMULATOR = 'false';
process.env.NODE_ENV = 'production';

async function testCloudConnection() {
	console.log('🧪 Testing Cloud Firestore Connection...');
	console.log('');

	try {
		// Import after setting env vars
		const { adminFirestore } = await import('../src/lib/server/firebase-admin.ts');

		console.log('✅ Firebase Admin imported successfully');

		// Test simple read operation
		console.log('📖 Testing read operation...');
		const testCollection = adminFirestore.collection('_test');
		const snapshot = await testCollection.limit(1).get();

		console.log(`✅ Read operation successful (found ${snapshot.size} documents)`);

		// Test write operation
		console.log('✍️ Testing write operation...');
		const testDoc = testCollection.doc('connection-test');
		await testDoc.set({
			timestamp: new Date(),
			test: true,
			message: 'Cloud connection successful'
		});

		console.log('✅ Write operation successful');

		// Clean up test document
		await testDoc.delete();
		console.log('🧹 Cleanup completed');

		console.log('');
		console.log('🎉 Cloud Firestore connection WORKING!');
		console.log('✅ You can now run: bun run seed:prod');

		process.exit(0);

	} catch (error) {
		console.error('❌ Cloud connection failed:');
		console.error('');
		console.error('Error:', error.message);

		if (error.message.includes('Could not load the default credentials')) {
			console.error('');
			console.error('💡 Possible fixes:');
			console.error('   1. Check FIREBASE_SERVICE_ACCOUNT environment variable');
			console.error('   2. Verify service account JSON is valid');
			console.error('   3. Ensure service account has Firestore permissions');
		}

		process.exit(1);
	}
}

testCloudConnection();