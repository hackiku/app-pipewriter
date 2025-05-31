// lib/services/auth.ts - Final clean auth service
import { browser } from '$app/environment';

/**
 * Route-based context detection (no iframe detection needed)
 */
function isAddonRoute(): boolean {
	if (!browser) return false;
	return window.location.pathname === '/addon';
}

/**
 * Sign in with route-based behavior
 */
export async function signIn() {
	if (!browser) return;

	try {
		const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
		const { getFirebaseService } = await import('./firebase/client');

		const { auth } = getFirebaseService();
		const provider = new GoogleAuthProvider();

		// Always show account picker for better UX
		provider.setCustomParameters({
			prompt: 'select_account'
		});

		const result = await signInWithPopup(auth, provider);
		console.log('Firebase sign in successful:', result.user.email);

		// Create server session
		const idToken = await result.user.getIdToken();
		const response = await fetch('/api/auth/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ idToken })
		});

		if (!response.ok) {
			throw new Error('Failed to create session');
		}

		console.log('Session created');

		// Route-based reload behavior
		window.location.reload(); // Always reload current page

	} catch (error) {
		console.error('Sign in failed:', error);
		throw error;
	}
}

/**
 * Sign out with route-based behavior
 */
export async function signOut() {
	if (!browser) return;

	try {
		const { signOut } = await import('firebase/auth');
		const { getFirebaseService } = await import('./firebase/client');

		await signOut(getFirebaseService().auth);
		console.log('Firebase sign out successful');

		// Delete server session
		await fetch('/api/auth/session', { method: 'DELETE' });
		console.log('Server session deleted');

		// Route-based reload behavior
		window.location.reload(); // Always reload current page

	} catch (error) {
		console.error('Sign out failed:', error);
		throw error;
	}
}

/**
 * Switch account - always shows account picker
 */
export async function switchAccount() {
	if (!browser) return;

	try {
		// Sign out first
		const { signOut: firebaseSignOut } = await import('firebase/auth');
		const { getFirebaseService } = await import('./firebase/client');

		await firebaseSignOut(getFirebaseService().auth);
		await fetch('/api/auth/session', { method: 'DELETE' });

		// Small delay
		await new Promise(resolve => setTimeout(resolve, 100));

		// Sign in with account picker
		await signIn();

	} catch (error) {
		console.error('Account switch failed:', error);
		throw error;
	}
}