// SIMPLIFIED: Single session endpoint handles everything
// src/routes/api/auth/session/+server.ts - FINAL VERSION

import { json } from '@sveltejs/kit';
import { adminAuth, adminFirestore } from '$lib/server/firebase-admin';
import { dev } from '$app/environment';

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days

/**
 * SINGLE SOURCE OF TRUTH for user provisioning
 * Creates session AND provisions user in one atomic operation
 */
export async function POST({ request, cookies }) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return json({ error: 'No ID token provided' }, { status: 400 });
		}

		// Verify token and create session
		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN
		});

		// Get user info
		const decodedToken = await adminAuth.verifyIdToken(idToken);
		const authUser = await adminAuth.getUser(decodedToken.uid);

		// ATOMIC USER PROVISIONING - Firebase best practice
		const userRef = adminFirestore.collection('users').doc(authUser.uid);
		const userDoc = await userRef.get();

		const now = new Date();

		if (!userDoc.exists) {
			// NEW USER: Create with trial (Firebase auth already created the auth user)
			await userRef.set({
				// Identity (from Firebase Auth)
				uid: authUser.uid,
				email: authUser.email,
				displayName: authUser.displayName || null,
				photoURL: authUser.photoURL || null,

				// App-specific subscription data
				tier: 'trial',
				pro: false,
				trialStartDate: now,

				// Usage tracking
				projectsCreated: 0,
				elementsUsed: 0,

				// Timestamps
				createdAt: now,
				updatedAt: now,
				lastLoginDate: now,
			});

			console.log(`✅ NEW USER: ${authUser.email} (trial activated)`);
		} else {
			// EXISTING USER: Just update login info
			await userRef.update({
				lastLoginDate: now,
				updatedAt: now,
				// Sync auth info in case it changed
				email: authUser.email,
				displayName: authUser.displayName || null,
				photoURL: authUser.photoURL || null,
			});

			console.log(`✅ EXISTING USER: ${authUser.email} (login updated)`);
		}

		// Set secure iframe-compatible cookie
		cookies.set('__session', sessionCookie, {
			maxAge: SESSION_EXPIRES_IN / 1000,
			httpOnly: true,
			secure: true,
			path: '/',
			sameSite: 'none' // Required for iframe
		});

		return json({ success: true });

	} catch (error) {
		console.error('Session/provisioning failed:', error);
		return json({
			error: 'Authentication failed',
			details: dev ? error.message : undefined
		}, { status: 401 });
	}
}

export async function DELETE({ cookies }) {
	cookies.delete('__session', { path: '/' });
	return json({ success: true });
}

/**
 * REMOVE THESE FILES - No longer needed:
 * - src/routes/api/auth/provision-user/+server.ts
 * - src/lib/services/firestore/user-provisioning.ts
 * 
 * Firebase Auth handles user creation automatically.
 * This endpoint handles Firestore user document creation.
 * Single responsibility, no duplication.
 */