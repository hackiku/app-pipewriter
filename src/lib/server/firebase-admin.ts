// src/lib/server/firebase-admin.ts

import { FIREBASE_SERVICE_ACCOUNT } from '$env/static/private';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Parse the service account JSON
let serviceAccount;
try {
	serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
	console.error('Error parsing Firebase service account JSON:', e);
	throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
}

// Initialize Firebase Admin if not already initialized
function getAdminApp(): App {
	const apps = getApps();
	if (apps.length > 0) {
		return apps[0];
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