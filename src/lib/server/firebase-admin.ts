// src/lib/server/firebase-admin.ts

import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let isDev = false;
let isScript = false;
let isBuild = false;

// SIMPLE BUILD DETECTION: Check first, before any imports
isBuild = process.env.BUILDING === 'true' ||
	process.argv.some(arg => arg.includes('build')) ||
	process.env.NODE_ENV === 'production';

if (isBuild) {
	console.log(`🔥 Firebase Admin: BUILD MODE (analysis only)`);
} else {
	// Only do complex detection if not building
	try {
		if (typeof process !== 'undefined' && process.env.USE_FIREBASE_EMULATOR) {
			isScript = true;
			isDev = process.env.USE_FIREBASE_EMULATOR === 'true';
		} else {
			// SvelteKit context - use proper import
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

	// BUILD TIME: Use minimal config for analysis
	if (isBuild) {
		return initializeApp({ projectId: 'pipewriter' });
	}

	// DEV TIME: Use emulator
	if (isDev) {
		return initializeApp({ projectId: 'pipewriter' });
	}

	// PRODUCTION: Require service account
	const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
	if (!serviceAccount) {
		throw new Error('FIREBASE_SERVICE_ACCOUNT required for production runtime');
	}

	return initializeApp({
		credential: cert(JSON.parse(serviceAccount)),
		projectId: 'pipewriter'
	});
}

const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminFirestore = getFirestore(app);

// Emulator setup (only in dev, not during build)
if (isDev && !isBuild) {
	process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
	process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

	try {
		adminFirestore.settings({ host: 'localhost:8080', ssl: false });
	} catch {
		// Ignore errors during build analysis
	}
}