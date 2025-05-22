// src/lib/server/firebase-admin.ts
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we're in a SvelteKit context or standalone script
const isSvelteKitContext = typeof globalThis !== 'undefined' &&
	typeof process !== 'undefined' &&
	process.env.NODE_ENV !== undefined;

// Get environment variables - handle both SvelteKit and standalone contexts
let FIREBASE_SERVICE_ACCOUNT: string;
let isDev = false;

if (isSvelteKitContext) {
	// SvelteKit context - use dynamic import
	try {
		const { FIREBASE_SERVICE_ACCOUNT: serviceAccount } = await import('$env/static/private');
		const { dev } = await import('$app/environment');
		FIREBASE_SERVICE_ACCOUNT = serviceAccount;
		isDev = dev;
	} catch (e) {
		// Fallback to process.env if SvelteKit env isn't available
		FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT || '';
		isDev = process.env.NODE_ENV === 'development';
	}
} else {
	// Standalone script context - use process.env directly
	FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT || '';
	isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

function getAdminApp(): App {
	const apps = getApps();
	if (apps.length > 0) {
		return apps[0];
	}

	if (isDev) {
		// In development, use emulator-friendly config
		console.log('🔥 Initializing Firebase Admin for EMULATOR use');

		return initializeApp({
			projectId: 'pipewriter', // Your project ID from firebase.json
		});
	} else {
		// Production: use service account
		if (!FIREBASE_SERVICE_ACCOUNT) {
			throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
		}

		let serviceAccount;
		try {
			serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
		} catch (e) {
			console.error('Error parsing Firebase service account JSON:', e);
			throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
		}

		return initializeApp({
			credential: cert(serviceAccount)
		});
	}
}

const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminFirestore = getFirestore(app);

// Configure emulators in development
if (isDev) {
	console.log('🔥 Configuring Firebase Admin for emulator connection');

	// Set environment variables that the Admin SDK reads
	process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
	process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

	// Also configure Firestore client directly
	try {
		adminFirestore.settings({
			host: 'localhost:8080',
			ssl: false
		});
		console.log('✅ Firestore configured for emulator');
	} catch (error) {
		console.log('⚠️ Firestore settings already configured (this is normal)');
	}
}