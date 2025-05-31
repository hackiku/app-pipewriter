// lib/services/auth.ts
import { browser } from '$app/environment';

/**
 * Simple, bulletproof auth for iframe context
 * No reactive state, no circular references, no complexity
 */

export async function signIn() {
	if (!browser) return;

	try {
		// Import Firebase only when needed
		const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
		const { getFirebaseService } = await import('./firebase/client');

		const { auth } = getFirebaseService();
		const provider = new GoogleAuthProvider();

		// Sign in with popup
		const result = await signInWithPopup(auth, provider);
		console.log('Firebase sign in successful:', result.user.email);

		// Get ID token
		const idToken = await result.user.getIdToken();

		// Create server session (this now also provisions user)
		const response = await fetch('/api/auth/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ idToken })
		});

		if (!response.ok) {
			throw new Error('Failed to create session');
		}

		console.log('Session created, user provisioned');

		// Simple reload - server handles everything else
		window.location.reload();

	} catch (error) {
		console.error('Sign in failed:', error);
		throw error;
	}
}

export async function signOut() {
	if (!browser) return;

	try {
		// Import Firebase only when needed  
		const { signOut } = await import('firebase/auth');
		const { getFirebaseService } = await import('./firebase/client');

		const { auth } = getFirebaseService();

		// Sign out from Firebase
		await signOut(auth);
		console.log('Firebase sign out successful');

		// Delete server session
		await fetch('/api/auth/session', { method: 'DELETE' });
		console.log('Server session deleted');

		// Simple reload - server handles everything else
		window.location.reload();

	} catch (error) {
		console.error('Sign out failed:', error);
		throw error;
	}
}
