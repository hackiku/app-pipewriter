// src/lib/services/firebase/auth.svelte.ts
import { getFirebaseService } from './client';
import { browser } from '$app/environment';
import { invalidateAll } from '$app/navigation';
import type { User } from 'firebase/auth';

// Define state with the correct Svelte 5 runes syntax
let user = $state<User | null>(null);
let loading = $state(true);
let error = $state<string | null>(null);

// Helper to detect if we're on addon route (iframe context)
function isAddonRoute(): boolean {
	return browser && window.location.pathname === '/addon';
}

// Initialize Firebase auth
if (browser) {
	import('firebase/auth').then(({ onAuthStateChanged, getIdToken }) => {
		const { auth } = getFirebaseService();
		onAuthStateChanged(auth, async (firebaseUser) => {
			user = firebaseUser;
			loading = false;
			error = null;
			console.log("Auth state changed:", user ? "Signed in" : "Signed out");

			// If we have a user, create a session and provision them
			if (firebaseUser) {
				try {
					// Get the ID token
					const idToken = await getIdToken(firebaseUser);

					// Send to our server to create a session
					const response = await fetch('/api/auth/session', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ idToken })
					});

					const data = await response.json();

					if (!response.ok) {
						throw new Error(data.error || 'Failed to create session');
					}

					console.log('Session created successfully');

					// Auto-provision user in Firestore
					try {
						const provisionResponse = await fetch('/api/auth/provision-user', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							}
						});

						if (provisionResponse.ok) {
							const provisionData = await provisionResponse.json();
							console.log('User provisioned:', provisionData.message);
						} else {
							console.warn('User provisioning failed, but auth succeeded');
						}
					} catch (provisionError) {
						console.warn('User provisioning error:', provisionError);
						// Don't fail the whole auth flow if provisioning fails
					}

					// IFRAME-AWARE REFRESH
					if (isAddonRoute()) {
						// In addon/iframe: just reload the page to update server data
						console.log('Addon route: reloading page for auth update');
						window.location.reload();
					} else {
						// Normal web app: use SvelteKit's invalidation
						await invalidateAll();
					}

				} catch (err) {
					console.error("Error creating session:", err);
					error = err.message;
				}
			} else {
				// If signed out, clear the session
				try {
					await fetch('/api/auth/session', { method: 'DELETE' });
					console.log('Session deleted successfully');

					// IFRAME-AWARE REFRESH
					if (isAddonRoute()) {
						// In addon/iframe: just reload to show login
						console.log('Addon route: reloading page for sign out');
						window.location.reload();
					} else {
						// Normal web app: use SvelteKit's invalidation
						await invalidateAll();
					}
				} catch (err) {
					console.error("Error deleting session:", err);
				}
			}
		});
	});
}

// Get current user
export function getUser() {
	return user;
}

// Get loading state
export function isLoading() {
	return loading;
}

// Get error state
export function getError() {
	return error;
}

// Simple sign in function
export function signIn() {
	if (!browser) return Promise.resolve(null);
	error = null;

	return import('firebase/auth').then(({ GoogleAuthProvider, signInWithPopup }) => {
		const { auth } = getFirebaseService();
		const provider = new GoogleAuthProvider();

		return signInWithPopup(auth, provider)
			.then(result => {
				console.log("Signed in:", result.user.displayName);
				// Auth state change handler will handle the reload/invalidation
				return result.user;
			})
			.catch(err => {
				console.error("Sign in failed:", err.message);
				error = err.message;
				throw err;
			});
	});
}

// Simple sign out function with iframe awareness
export async function signOut() {
	if (!browser) return Promise.resolve(false);
	error = null;

	return import('firebase/auth').then(({ signOut: firebaseSignOut }) => {
		const { auth } = getFirebaseService();
		return firebaseSignOut(auth)
			.then(async () => {
				console.log("Signed out");

				// Delete session on server
				await fetch('/api/auth/session', { method: 'DELETE' });

				// IFRAME-AWARE LOGOUT
				if (isAddonRoute()) {
					// In addon/iframe: just reload to show login UI
					console.log('Addon route logout: reloading page');
					window.location.reload();
				} else {
					// Normal web app: use SvelteKit's invalidation
					console.log('Normal route logout: using invalidateAll');
					await invalidateAll();
				}

				return true;
			})
			.catch(err => {
				console.error("Sign out failed:", err.message);
				error = err.message;
				throw err;
			});
	});
}