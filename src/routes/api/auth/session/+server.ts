// src/routes/api/auth/session/+server.ts
import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebase-admin';
import { dev } from '$app/environment';

// Session duration (5 days)
const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;

/**
 * Creates a session from a Firebase ID token
 */
export async function POST({ request, cookies }) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			console.error('No ID token provided');
			return json({ error: 'No ID token provided' }, { status: 400 });
		}

		console.log('Creating session from ID token');

		// Create a session cookie
		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN
		});

		// Set cookie options
		const options = {
			maxAge: SESSION_EXPIRES_IN / 1000, // Convert to seconds
			httpOnly: true,
			secure: !dev, // Only secure in production
			path: '/',
			sameSite: 'strict'
		};

		// Set the cookie
cookies.set('__session', sessionCookie, {
  maxAge: SESSION_EXPIRES_IN / 1000,
  httpOnly: true,
  secure: !dev,
  path: '/',
  sameSite: 'strict' // Change from 'strict' to 'none' for iframe support
});

		console.log('Session created successfully');

		return json({ success: true });
	} catch (error) {
		console.error('Error creating session:', error.message);

		// Provide more detailed error info in development
		if (dev) {
			console.error('Full error details:', error);
			return json({
				error: 'Failed to create session',
				message: error.message,
				code: error.code || 'unknown_error',
				// Don't include stack trace in response, but log it
			}, { status: 401 });
		}

		return json({ error: 'Authentication failed' }, { status: 401 });
	}
}

/**
 * Deletes the session cookie
 */
export async function DELETE({ cookies }) {
	cookies.delete('__session', { path: '/' });
	console.log('Session deleted successfully');
	return json({ success: true });
}