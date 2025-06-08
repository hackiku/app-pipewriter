// src/routes/api/auth/session/+server.ts - SIMPLIFIED
import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebase-admin';
import { provisionUserComplete } from '$lib/server/provisioning';
import { dev } from '$app/environment';

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST({ request, cookies }) {
	try {
		const { idToken } = await request.json();
		if (!idToken) {
			return json({ error: 'No ID token provided' }, { status: 400 });
		}

		// Create session
		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN
		});

		// Get user and provision (your consolidated logic)
		const decodedToken = await adminAuth.verifyIdToken(idToken);
		const authUser = await adminAuth.getUser(decodedToken.uid);

		const userData = await provisionUserComplete({
			uid: authUser.uid,
			email: authUser.email!,
			displayName: authUser.displayName,
			photoURL: authUser.photoURL
		});

		// Set cookie
		cookies.set('__session', sessionCookie, {
			maxAge: SESSION_EXPIRES_IN / 1000,
			httpOnly: true,
			secure: true,
			path: '/',
			sameSite: 'none'
		});

		return json({
			success: true,
			isNewUser: userData.isNewUser,
			promptsProvisioned: userData.promptsProvisioned
		});

	} catch (error) {
		console.error('Session creation failed:', error);
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