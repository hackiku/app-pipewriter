// src/lib/context/auth.svelte.ts
import { getFirebaseService } from '$lib/services/firebase/client';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	type User,
	updateProfile
} from 'firebase/auth';
import { browser } from '$app/environment';

// Export the context function
export function createAuth() {
	// State
	const user = $state<User | null>(null);
	const loading = $state(true);
	const error = $state<string | null>(null);

	// Derived values
	const isAuthenticated = $derived(!!user);
	const displayName = $derived(user?.displayName || 'User');
	const email = $derived(user?.email || '');
	const photoURL = $derived(user?.photoURL || '');

	// Initialize auth listener
	if (browser) {
		const { auth } = getFirebaseService();
		if (auth) {
			onAuthStateChanged(auth, (firebaseUser) => {
				user = firebaseUser;
				loading = false;
				error = null;
			});
		}
	}

	// Auth functions
	async function signIn(email: string, password: string) {
		error = null;
		try {
			const { auth } = getFirebaseService();
			if (!auth) throw new Error('Auth service not available');

			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			return { success: true, user: userCredential.user };
		} catch (err: any) {
			error = err.message;
			console.error('Error signing in:', err);
			return { success: false, error: err.message };
		}
	}

	async function register(email: string, password: string, name?: string) {
		error = null;
		try {
			const { auth } = getFirebaseService();
			if (!auth) throw new Error('Auth service not available');

			const userCredential = await createUserWithEmailAndPassword(auth, email, password);

			if (name) {
				await updateProfile(userCredential.user, { displayName: name });
			}

			return { success: true, user: userCredential.user };
		} catch (err: any) {
			error = err.message;
			console.error('Error registering:', err);
			return { success: false, error: err.message };
		}
	}

	async function logOut() {
		error = null;
		try {
			const { auth } = getFirebaseService();
			if (!auth) throw new Error('Auth service not available');

			await signOut(auth);
			return { success: true };
		} catch (err: any) {
			error = err.message;
			console.error('Error logging out:', err);
			return { success: false, error: err.message };
		}
	}

	// Return the auth context
	return {
		// State getters
		get user() { return user; },
		get loading() { return loading; },
		get error() { return error; },
		get isAuthenticated() { return isAuthenticated; },
		get displayName() { return displayName; },
		get email() { return email; },
		get photoURL() { return photoURL; },

		// Methods
		signIn,
		register,
		logOut
	};
}

// Create a singleton instance
let authInstance: ReturnType<typeof createAuth> | null = null;

// Export a function to get the auth instance
export function useAuth() {
	if (!authInstance) {
		authInstance = createAuth();
	}
	return authInstance;
}