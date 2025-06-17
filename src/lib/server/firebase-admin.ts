// src/lib/server/firebase-admin.ts - FIXED WITH CONNECTION TESTING

import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Environment detection
let isProduction = false;
let isBuildTime = false;

// Build time detection
isBuildTime = process.env.BUILDING === 'true' ||
	process.argv.some(arg => arg.includes('build')) ||
	process.env.VITE_BUILDING === 'true';

if (isBuildTime) {
	console.log('🔥 Firebase Admin: BUILD TIME');
} else {
	// Production if service account exists, dev if not
	isProduction = !!process.env.FIREBASE_SERVICE_ACCOUNT;
	console.log(`🔥 Firebase Admin: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
}

function getAdminApp(): App {
	const apps = getApps();
	if (apps.length > 0) {
		console.log('🔄 Using existing Firebase Admin app');
		return apps[0];
	}

	// Build time: minimal config
	if (isBuildTime) {
		console.log('🏗️ Build time: minimal Firebase config');
		return initializeApp({ projectId: 'pipewriter-app' });
	}

	// Production: use service account
	if (isProduction) {
		console.log('🌐 Initializing PRODUCTION Firebase Admin with service account');

		const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
		if (!serviceAccount) {
			throw new Error('FIREBASE_SERVICE_ACCOUNT required for production');
		}

		try {
			const parsedAccount = JSON.parse(serviceAccount);
			console.log(`✅ Service account parsed for project: ${parsedAccount.project_id}`);

			if (parsedAccount.project_id !== 'pipewriter-app') {
				throw new Error(`Wrong project ID: expected pipewriter-app, got ${parsedAccount.project_id}`);
			}

			const app = initializeApp({
				credential: cert(parsedAccount),
				projectId: 'pipewriter-app'
			});

			console.log('✅ Production Firebase Admin initialized');
			return app;

		} catch (error) {
			console.error('❌ Failed to parse service account JSON:', error.message);
			throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT format: ${error.message}`);
		}
	}

	// Development: use emulator
	console.log('🔧 Initializing DEVELOPMENT Firebase Admin for emulator');

	// Set emulator environment variables BEFORE initializing
	process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
	process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

	console.log('🔧 Emulator environment variables set:');
	console.log(`  - FIRESTORE_EMULATOR_HOST: ${process.env.FIRESTORE_EMULATOR_HOST}`);
	console.log(`  - FIREBASE_AUTH_EMULATOR_HOST: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);

	const app = initializeApp({ projectId: 'pipewriter-app' });
	console.log('✅ Development Firebase Admin initialized');
	return app;
}

// Initialize
console.log('🚀 Initializing Firebase Admin...');
const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminFirestore = getFirestore(app);

// Test connection (only in non-build environments)
if (!isBuildTime) {
	// Test Firestore connection
	setTimeout(async () => {
		try {
			console.log('🧪 Testing Firestore connection...');

			const testRef = adminFirestore.collection('_test').doc('connection');
			await testRef.set({
				timestamp: new Date(),
				environment: isProduction ? 'production' : 'development'
			});

			const testDoc = await testRef.get();
			if (testDoc.exists) {
				console.log('✅ Firestore connection test PASSED');
				await testRef.delete(); // Clean up
			} else {
				console.warn('⚠️ Firestore connection test: document not found after write');
			}

		} catch (error) {
			console.error('❌ Firestore connection test FAILED:', error);
			console.error('❌ This will cause data loading to fail!');
			console.error('❌ Check your Firebase configuration and network connectivity');
		}
	}, 1000); // Delay to avoid blocking initialization
}

console.log(`🎯 Firebase Admin ready for ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);