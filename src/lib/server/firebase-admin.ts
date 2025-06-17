// src/lib/server/firebase-admin.ts - CLEAN & SIMPLE

import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// SIMPLE: Just check the actual environment
let isProduction = false;
let isBuildTime = false;

// Build time detection
isBuildTime = process.env.BUILDING === 'true' ||
	process.argv.some(arg => arg.includes('build')) ||
	process.env.VITE_BUILDING === 'true';

if (isBuildTime) {
	console.log('🔥 Firebase Admin: BUILD TIME');
} else {
	// SIMPLE LOGIC: Production if service account exists, dev if not
	isProduction = !!process.env.FIREBASE_SERVICE_ACCOUNT;
	console.log(`🔥 Firebase Admin: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
}

function getAdminApp(): App {
	const apps = getApps();
	if (apps.length > 0) return apps[0];

	// Build time: minimal config
	if (isBuildTime) {
		return initializeApp({ projectId: 'pipewriter-app' });
	}

	// Production: use service account
	if (isProduction) {
		console.log('🌐 Initializing for PRODUCTION with service account');

		const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
		if (!serviceAccount) {
			throw new Error('FIREBASE_SERVICE_ACCOUNT required for production');
		}

		try {
			const parsedAccount = JSON.parse(serviceAccount);
			console.log(`✅ Service account loaded for project: ${parsedAccount.project_id}`);

			return initializeApp({
				credential: cert(parsedAccount),
				projectId: 'pipewriter-app'
			});
		} catch (error) {
			console.error('❌ Invalid service account JSON:', error.message);
			throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT format');
		}
	}

	// Development: use emulator
	console.log('🔧 Initializing for DEVELOPMENT with emulator');
	return initializeApp({ projectId: 'pipewriter-app' });
}

// Initialize
const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminFirestore = getFirestore(app);

// Configure emulators ONLY in development
if (!isBuildTime && !isProduction) {
	console.log('🔧 Configuring Firebase emulators');

	// Set emulator environment variables
	process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
	process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

	// Configure Firestore to use emulator
	try {
		adminFirestore.settings({
			host: 'localhost:8080',
			ssl: false
		});
		console.log('✅ Firestore configured for emulator');
	} catch (error) {
		console.warn('⚠️ Could not configure Firestore emulator:', error.message);
	}
} else if (isProduction) {
	console.log('🌐 Configured for production Firebase');
}