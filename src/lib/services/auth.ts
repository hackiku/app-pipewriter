// lib/services/auth.ts - Updated for route groups
import { browser } from '$app/environment';

/**
 * Route-based context detection
 */
function isAddonRoute(): boolean {
	if (!browser) return false;
	return window.location.pathname.startsWith('/addon') || window.location.pathname === '/gdocs-login';
}

/**
 * Sign in with iframe-aware navigation
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
		console.log('[AUTH] Firebase sign in successful:', result.user.email);

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

		console.log('[AUTH] Session created');

		// Route-aware navigation
		if (isAddonRoute()) {
			// In addon context: navigate to main addon page
			window.location.href = '/addon';
		} else {
			// Homepage context: just reload
			window.location.reload();
		}

	} catch (error) {
		console.error('[AUTH] Sign in failed:', error);
		throw error;
	}
}

/**
 * Sign out with iframe-aware navigation
 */
export async function signOut() {
	if (!browser) return;

	try {
		const { signOut } = await import('firebase/auth');
		const { getFirebaseService } = await import('./firebase/client');

		await signOut(getFirebaseService().auth);
		console.log('[AUTH] Firebase sign out successful');

		// Delete server session
		await fetch('/api/auth/session', { method: 'DELETE' });
		console.log('[AUTH] Server session deleted');

		// Route-aware navigation  
		if (isAddonRoute()) {
			// In addon context: navigate to login page
			window.location.href = '/gdocs-login';
		} else {
			// Homepage context: just reload
			window.location.reload();
		}

	} catch (error) {
		console.error('[AUTH] Sign out failed:', error);
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

		console.log('[AUTH] Cleared session for account switch');

		// Small delay
		await new Promise(resolve => setTimeout(resolve, 100));

		// Sign in with account picker
		await signIn();

	} catch (error) {
		console.error('[AUTH] Account switch failed:', error);
		throw error;
	}
}