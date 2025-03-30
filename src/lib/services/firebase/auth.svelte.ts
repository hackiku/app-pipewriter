// src/lib/services/firebase/auth.svelte.ts
import { getFirebaseService } from '$lib/services/firebase/client';
import { browser } from '$app/environment';
import type { User } from 'firebase/auth';

// Define state with the correct Svelte 5 runes syntax
let user = $state<User | null>(null);
let loading = $state(true);

// Initialize Firebase auth
if (browser) {
	import('firebase/auth').then(({ onAuthStateChanged }) => {
		const { auth } = getFirebaseService();
		onAuthStateChanged(auth, (firebaseUser) => {
			user = firebaseUser;
			loading = false;
			console.log("Auth state:", user ? "Signed in" : "Signed out");
		});
	});
}

// Simple sign in function
export function signIn() {
	if (!browser) return;

	return import('firebase/auth').then(({ GoogleAuthProvider, signInWithPopup }) => {
		const { auth } = getFirebaseService();
		const provider = new GoogleAuthProvider();
		return signInWithPopup(auth, provider)
			.then(result => {
				console.log("Signed in:", result.user.displayName);
				return result.user;
			})
			.catch(error => {
				console.error("Sign in failed:", error.message);
				throw error;
			});
	});
}

// Simple sign out function
export function signOut() {
	if (!browser) return;

	return import('firebase/auth').then(({ signOut: firebaseSignOut }) => {
		const { auth } = getFirebaseService();
		return firebaseSignOut(auth)
			.then(() => {
				console.log("Signed out");
				return true;
			})
			.catch(error => {
				console.error("Sign out failed:", error.message);
				throw error;
			});
	});
}

// Export getters for reactive state
export function getUser() {
	return user;
}

export function isLoading() {
	return loading;
}

export function isAuthenticated() {
	return !!user;
}