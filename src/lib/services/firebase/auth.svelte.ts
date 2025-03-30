// src/lib/services/firebase/auth.svelte.ts
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { browser } from '$app/environment';
import { getFirebaseService } from './client';

// Export state variables directly
let user = $state<User | null>(null);
let loading = $state(true);

// Initialize listener in a browser-only context
if (browser) {
	try {
		const { auth } = getFirebaseService();
		if (auth) {
			onAuthStateChanged(auth, (firebaseUser) => {
				user = firebaseUser;
				loading = false;
				console.log("Auth state changed:", firebaseUser?.displayName || "Not signed in");
			});
		}
	} catch (error) {
		console.error("Firebase auth initialization error:", error);
		loading = false;
	}
}

// Sign out function
export async function logout() {
	if (!browser) return false;

	try {
		const { auth } = getFirebaseService();
		await auth.signOut();
		return true;
	} catch (error) {
		console.error("Logout error:", error);
		return false;
	}
}

// Helper for testing Google sign-in within components
export async function signInWithGoogle() {
	if (!browser) return false;

	try {
		const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
		const { auth } = getFirebaseService();
		const provider = new GoogleAuthProvider();
		const result = await signInWithPopup(auth, provider);
		return result.user;
	} catch (error) {
		console.error("Google sign-in error:", error);
		return false;
	}
}