// src/lib/services/firebase/auth.svelte.ts
import { getFirebaseService } from './client';
import { browser } from '$app/environment';
import type { User } from 'firebase/auth';

// Define state with the correct Svelte 5 runes syntax
let user = $state<User | null>(null);
let loading = $state(true);

// Initialize Firebase auth
if (browser) {
	import('firebase/auth').then(({ onAuthStateChanged, getIdToken }) => {
		const { auth } = getFirebaseService();
		onAuthStateChanged(auth, async (firebaseUser) => {
			user = firebaseUser;
			loading = false;
			console.log("Auth state changed:", user ? "Signed in" : "Signed out");

			// If we have a user, create a session
			if (firebaseUser) {
				try {
					// Get the ID token
					const idToken = await getIdToken(firebaseUser);

					// Send to our server to create a session
					await fetch('/api/auth/session', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ idToken })
					});
				} catch (error) {
					console.error("Error creating session:", error);
				}
			} else {
				// If signed out, clear the session
				await fetch('/api/auth/session', { method: 'DELETE' });
			}
		});
	});
}

// Other functions remain the same
// ...
// Get current user
export function getUser() {
	return user;
}

// Get loading state
export function isLoading() {
	return loading;
}

// Simple sign in function
export function signIn() {
	if (!browser) return Promise.resolve(null);

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
	if (!browser) return Promise.resolve(false);

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