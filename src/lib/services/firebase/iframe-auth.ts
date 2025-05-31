// src/lib/services/firebase/iframe-auth.ts
// DEAD SIMPLE iframe auth - no reactive state, no complex listeners
import { browser } from '$app/environment';

/**
 * Simple iframe-only auth functions
 * No reactive state, no complex listeners, no feedback loops
 */

export async function iframeSignIn() {
	if (!browser) return;

	try {
		// Import Firebase only when needed
		const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
		const { getFirebaseService } = await import('$lib/services/firebase/client');

		const { auth } = getFirebaseService();
		const provider = new GoogleAuthProvider();

		// Sign in
		const result = await signInWithPopup(auth, provider);
		console.log('Firebase sign in successful:', result.user.email);

		// Get ID token
		const idToken = await result.user.getIdToken();

		// Create server session
		const response = await fetch('/api/auth/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ idToken })
		});

		if (!response.ok) {
			throw new Error('Failed to create session');
		}

		console.log('Server session created');

		// Simple reload - no complex state management
		window.location.reload();

	} catch (error) {
		console.error('Sign in failed:', error);
		throw error;
	}
}

export async function iframeSignOut() {
	if (!browser) return;

	try {
		// Import Firebase only when needed
		const { signOut } = await import('firebase/auth');
		const { getFirebaseService } = await import('$lib/services/firebase/client');

		const { auth } = getFirebaseService();

		// Sign out from Firebase
		await signOut(auth);
		console.log('Firebase sign out successful');

		// Delete server session
		await fetch('/api/auth/session', { method: 'DELETE' });
		console.log('Server session deleted');

		// Simple reload - no complex state management
		window.location.reload();

	} catch (error) {
		console.error('Sign out failed:', error);
		throw error;
	}
}