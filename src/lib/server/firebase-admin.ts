// src/lib/server/firebase-admin.ts

import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let isDev = false;
let isScript = false;
let isBuildTime = false;

// FIXED: Proper build-time vs runtime detection
isBuildTime = process.env.BUILDING === 'true' ||
	process.argv.some(arg => arg.includes('build')) ||
	process.env.VITE_BUILDING === 'true'; // SvelteKit build detection

if (isBuildTime) {
	console.log(`🔥 Firebase Admin: BUILD TIME (analysis only)`);
} else {
	// RUNTIME: Detect dev vs production properly
	try {
		if (typeof process !== 'undefined' && process.env.USE_FIREBASE_EMULATOR) {
			// Script mode with explicit emulator flag
			isScript = true;
			isDev = process.env.USE_FIREBASE_EMULATOR === 'true';
		} else {
			// SvelteKit runtime - use proper import
			const { dev } = await import('$app/environment');
			isDev = dev;
		}
	} catch {
		// Fallback for standalone scripts
		isScript = true;
		isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
	}

	console.log(`🔥 Firebase Admin: ${isDev ? 'EMULATOR' : 'PRODUCTION'} (${isScript ? 'script' : 'sveltekit'})`);
}

function getAdminApp(): App {
	const apps = getApps();
	if (apps.length > 0) return apps[0];

	// BUILD TIME: Use minimal config for static analysis only
	if (isBuildTime) {
		return initializeApp({ projectId: 'pipewriter' });
	}

	// RUNTIME DEV: Use emulator
	if (isDev) {
		console.log('🔧 Using Firebase emulator in development');
		return initializeApp({ projectId: 'pipewriter' });
	}

	// RUNTIME PRODUCTION: Require service account
	console.log('🔥 Initializing Firebase Admin for PRODUCTION');
	const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
	if (!serviceAccount) {
		console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable not found');
		console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('FIREBASE')));
		throw new Error('FIREBASE_SERVICE_ACCOUNT required for production runtime');
	}

	try {
		const parsedAccount = JSON.parse(serviceAccount);
		console.log('✅ Service account parsed successfully for project:', parsedAccount.project_id);

		return initializeApp({
			credential: cert(parsedAccount),
			projectId: 'pipewriter'
		});
	} catch (parseError) {
		console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError);
		throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON format');
	}
}

const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminFirestore = getFirestore(app);

// Emulator setup (only in dev, not during build)
if (isDev && !isBuildTime) {
	console.log('🔧 Configuring Firebase emulators');
	process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
	process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

	try {
		adminFirestore.settings({ host: 'localhost:8080', ssl: false });
	} catch (error) {
		console.warn('⚠️ Could not configure Firestore emulator settings:', error.message);
	}
}