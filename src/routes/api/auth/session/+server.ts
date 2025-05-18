// src/routes/api/auth/session/+server.ts

import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebase-admin';

// Duration of the session cookie (5 days)
const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;

// Create a session from an ID token
export async function POST({ request, cookies }) {
	try {
		// Get the ID token passed from client
		const { idToken } = await request.json();

		if (!idToken) {
			return json({ error: 'No ID token provided' }, { status: 400 });
		}

		// Verify the ID token and create a session cookie
		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN
		});

		// Set cookie options
		const options = {
			maxAge: SESSION_EXPIRES_IN / 1000, // Convert to seconds
			httpOnly: true,
			secure: true, // Set to true in production
			path: '/',
			sameSite: 'strict'
		};

		// Set the cookie
		cookies.set('__session', sessionCookie, options);

		return json({ success: true });
	} catch (error) {
		console.error('Error creating session:', error);
		return json({ error: 'Failed to create session' }, { status: 401 });
	}
}

// Log out by clearing the session cookie
export async function DELETE({ cookies }) {
	cookies.delete('__session', { path: '/' });
	return json({ success: true });
}