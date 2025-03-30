// src/lib/services/firebase/client.ts

import { browser } from '$app/environment';
import { dev } from '$app/environment';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAk6KQXu1lJ0LUNFiJQYVqt_licw99KWeE",
	authDomain: "pipewriter.firebaseapp.com",
	projectId: "pipewriter",
	storageBucket: "pipewriter.firebasestorage.app",
	messagingSenderId: "367706147083",
	appId: "1:367706147083:web:e628e01f31cac4f355fa0e",
	measurementId: "G-JBCLW4SLJQ"
};

// Singleton pattern similar to your GoogleAppsService
class FirebaseService {
	private static instance: FirebaseService;
	public app: any;
	public auth: any;
	public db: any;
	public rtdb: any;
	public functions: any;

	private constructor() {
		if (!browser) return;

		this.app = initializeApp(firebaseConfig);
		this.auth = getAuth(this.app);
		this.db = getFirestore(this.app);
		this.rtdb = getDatabase(this.app);
		this.functions = getFunctions(this.app);

		// Connect to emulators in development mode
		if (dev) {
			connectAuthEmulator(this.auth, 'http://localhost:9099');
			connectFirestoreEmulator(this.db, 'localhost', 8080);
			connectDatabaseEmulator(this.rtdb, 'localhost', 9000);
			connectFunctionsEmulator(this.functions, 'localhost', 5001);
		}
	}

	static getInstance(): FirebaseService {
		if (!FirebaseService.instance) {
			FirebaseService.instance = new FirebaseService();
		}
		return FirebaseService.instance;
	}
}

// Export a helper function for convenience
export function getFirebaseService(): FirebaseService {
	return FirebaseService.getInstance();
}