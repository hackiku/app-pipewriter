// src/lib/server/firebase-admin.ts
import { FIREBASE_SERVICE_ACCOUNT } from '$env/static/private';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { dev } from '$app/environment';

// Initialize Firebase Admin if not already initialized
function getAdminApp(): App {
	const apps = getApps();
	if (apps.length > 0) {
		return apps[0];
	}

	// Parse the service account JSON
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

// Get the app
const app = getAdminApp();

// Export the auth and firestore instances
export const adminAuth = getAuth(app);
export const adminFirestore = getFirestore(app);

// For development with emulator:
if (dev) {
	console.log('🔥 Using Firebase Auth Emulator in development mode');

	// Set environment variables for the Admin SDK to connect to emulators
	// This is what the docs recommend instead of useEmulator()
	process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

	// Only uncomment if using Firestore emulator
	// process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
}