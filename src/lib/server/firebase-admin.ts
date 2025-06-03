// src/lib/server/firebase-admin.ts
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let isDev = false;
let isScript = false;

// Detection: script vs SvelteKit vs mixed
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

function getAdminApp(): App {
	const apps = getApps();
	if (apps.length > 0) return apps[0];

	if (isDev) {
		return initializeApp({ projectId: 'pipewriter' });
	} else {
		const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
		if (!serviceAccount) {
			throw new Error('FIREBASE_SERVICE_ACCOUNT required for production');
		}

		return initializeApp({
			credential: cert(JSON.parse(serviceAccount)),
			projectId: 'pipewriter'
		});
	}
}

const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminFirestore = getFirestore(app);

// Emulator setup
if (isDev) {
	process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
	process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

	try {
		adminFirestore.settings({ host: 'localhost:8080', ssl: false });
	} catch { }
}