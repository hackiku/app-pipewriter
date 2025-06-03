// src/lib/server/firebase-admin.ts - FIXED for production scripts
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// FIXED: Better environment detection
function getEnvironmentConfig() {
	// 1. Check explicit override first
	const explicitEmulator = process.env.USE_FIREBASE_EMULATOR === 'true';
	const explicitProduction = process.env.USE_FIREBASE_EMULATOR === 'false';

	if (explicitProduction) {
		console.log('🌍 Explicit PRODUCTION mode detected');
		return { isDev: false, useEmulator: false };
	}

	if (explicitEmulator) {
		console.log('🧪 Explicit EMULATOR mode detected');
		return { isDev: true, useEmulator: true };
	}

	// 2. Check NODE_ENV
	const nodeEnv = process.env.NODE_ENV;
	if (nodeEnv === 'production') {
		console.log('🌍 NODE_ENV=production detected');
		return { isDev: false, useEmulator: false };
	}

	if (nodeEnv === 'development') {
		console.log('🧪 NODE_ENV=development detected');
		return { isDev: true, useEmulator: true };
	}

	// 3. Try SvelteKit context detection
	try {
		// This will only work in SvelteKit context
		const { dev } = require('$app/environment');
		console.log(`🎯 SvelteKit context detected, dev=${dev}`);
		return { isDev: dev, useEmulator: dev };
	} catch (e) {
		// Not in SvelteKit context, probably a script
		console.log('📜 Standalone script context detected');
	}

	// 4. Default to development for safety
	console.log('⚠️ Defaulting to development mode');
	return { isDev: true, useEmulator: true };
}

// Get service account
function getServiceAccount(): string {
	// Try SvelteKit environment first
	try {
		const { FIREBASE_SERVICE_ACCOUNT } = require('$env/static/private');
		return FIREBASE_SERVICE_ACCOUNT;
	} catch (e) {
		// Fall back to process.env
		return process.env.FIREBASE_SERVICE_ACCOUNT || '';
	}
}

function getAdminApp(): App {
	const apps = getApps();
	if (apps.length > 0) {
		return apps[0];
	}

	const { isDev, useEmulator } = getEnvironmentConfig();
	const serviceAccount = getServiceAccount();

	if (useEmulator) {
		// Development/Emulator mode
		console.log('🔥 Initializing Firebase Admin for EMULATOR use');

		return initializeApp({
			projectId: 'pipewriter',
		});
	} else {
		// Production mode
		console.log('🌍 Initializing Firebase Admin for PRODUCTION use');

		if (!serviceAccount) {
			throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required for production');
		}

		let serviceAccountObj;
		try {
			serviceAccountObj = JSON.parse(serviceAccount);
		} catch (e) {
			console.error('Error parsing Firebase service account JSON:', e);
			throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
		}

		return initializeApp({
			credential: cert(serviceAccountObj),
			projectId: serviceAccountObj.project_id
		});
	}
}

const { isDev, useEmulator } = getEnvironmentConfig();
const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminFirestore = getFirestore(app);

// Configure emulators ONLY in development
if (useEmulator) {
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
} else {
	console.log('🌍 Firebase Admin configured for PRODUCTION');
}