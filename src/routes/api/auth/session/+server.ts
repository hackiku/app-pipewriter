// src/routes/api/auth/session/+server.ts
import { json } from '@sveltejs/kit';
import { adminAuth, adminFirestore } from '$lib/server/firebase-admin';
import { dev } from '$app/environment';

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days

/**
 * Creates session AND provisions user in one step
 */
export async function POST({ request, cookies }) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return json({ error: 'No ID token provided' }, { status: 400 });
		}

		// Create session cookie
		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN
		});

		// Get user info from token
		const decodedToken = await adminAuth.verifyIdToken(idToken);
		const authUser = await adminAuth.getUser(decodedToken.uid);

		// Provision user in Firestore (merge operation)
		const userRef = adminFirestore.collection('users').doc(authUser.uid);
		const existingDoc = await userRef.get();

		if (existingDoc.exists) {
			// Update existing user
			await userRef.update({
				lastLoginDate: new Date(),
				updatedAt: new Date(),
				email: authUser.email,
				displayName: authUser.displayName || null,
				photoURL: authUser.photoURL || null,
			});
			console.log(`✅ Updated existing user: ${authUser.email}`);
		} else {
			// Create new user with trial
			await userRef.set({
				uid: authUser.uid,
				email: authUser.email,
				displayName: authUser.displayName || null,
				photoURL: authUser.photoURL || null,
				tier: 'trial',
				pro: false,
				trialStartDate: new Date(),
				projectsCreated: 0,
				elementsUsed: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
				lastLoginDate: new Date(),
				signupSource: 'google-auth',
				onboardingCompleted: false,
			});
			console.log(`✅ Created new user with trial: ${authUser.email}`);
		}

		// Set secure cookie for iframe
		cookies.set('__session', sessionCookie, {
			maxAge: SESSION_EXPIRES_IN / 1000,
			httpOnly: true,
			secure: true,
			path: '/',
			sameSite: 'none' // Essential for iframe
		});

		return json({ success: true });

	} catch (error) {
		console.error('Session creation failed:', error);
		return json({
			error: 'Authentication failed',
			details: dev ? error.message : undefined
		}, { status: 401 });
	}
}

/**
 * Deletes session cookie
 */
export async function DELETE({ cookies }) {
	cookies.delete('__session', { path: '/' });
	console.log('Session deleted successfully');
	return json({ success: true });
}