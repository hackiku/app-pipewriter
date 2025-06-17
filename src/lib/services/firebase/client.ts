// src/lib/services/firebase/client.ts - CLEAN & SIMPLE

import { browser } from '$app/environment';
import { dev } from '$app/environment';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration - FIXED for new project
const firebaseConfig = {
	apiKey: "AIzaSyAtLmu0o_oMg4TUXO7xUERPdIx-be_ZCxA",
	authDomain: "pipewriter-app.firebaseapp.com",
	projectId: "pipewriter-app",
	storageBucket: "pipewriter-app.firebasestorage.app",
	messagingSenderId: "947838557985",
	appId: "1:947838557985:web:b2cb45f15b9792b27aa860",
	measurementId: "G-3P7NB95Z19"
};

class FirebaseService {
	private static instance: FirebaseService;
	public app: any;
	public auth: any;
	public db: any;
	public rtdb: any;
	public functions: any;
	private emulatorsConnected = false;

	private constructor() {
		if (!browser) return;

		this.app = initializeApp(firebaseConfig);
		this.auth = getAuth(this.app);
		this.db = getFirestore(this.app);
		this.rtdb = getDatabase(this.app);
		this.functions = getFunctions(this.app);

		// FIXED: Only connect to emulators in dev mode and only once
		if (dev && !this.emulatorsConnected) {
			this.connectToEmulators();
		}
	}

	private connectToEmulators() {
		try {
			console.log('🔧 Connecting to Firebase emulators...');

			connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
			connectFirestoreEmulator(this.db, 'localhost', 8080);
			connectDatabaseEmulator(this.rtdb, 'localhost', 9000);
			connectFunctionsEmulator(this.functions, 'localhost', 5001);

			this.emulatorsConnected = true;
			console.log('✅ Connected to Firebase emulators');
		} catch (error) {
			console.warn('⚠️ Could not connect to emulators:', error.message);
		}
	}

	static getInstance(): FirebaseService {
		if (!FirebaseService.instance) {
			FirebaseService.instance = new FirebaseService();
		}
		return FirebaseService.instance;
	}
}

export function getFirebaseService(): FirebaseService {
	return FirebaseService.getInstance();
}