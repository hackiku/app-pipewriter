// src/routes/api/auth/session/+server.ts
import { json } from '@sveltejs/kit';
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { FIREBASE_SERVICE_ACCOUNT } from '$env/static/private';

// Initialize Firebase Admin if not already done
if (!getApps().length) {
	// Parse the service account if it's a string
	let serviceAccount;
	try {
		serviceAccount = typeof FIREBASE_SERVICE_ACCOUNT === 'string'
			? JSON.parse(FIREBASE_SERVICE_ACCOUNT)
			: FIREBASE_SERVICE_ACCOUNT;
	} catch (error) {
		console.error('Error parsing Firebase credentials:', error);
		throw new Error('Invalid Firebase credentials');
	}

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount)
	});
}

// Session duration (5 days)
const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;

export async function POST({ request, cookies }) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			console.error('No ID token provided');
			return json({ error: 'No ID token provided' }, { status: 400 });
		}

		console.log('Creating session from ID token');

		// Create a session cookie
		const sessionCookie = await admin.auth().createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN
		});

		// Set cookie options
		const options = {
			maxAge: SESSION_EXPIRES_IN / 1000, // Convert to seconds for cookie
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			sameSite: 'strict'
		};

		// Set the cookie
		cookies.set('__session', sessionCookie, options);

		return json({ success: true });
	} catch (error) {
		console.error('Error creating session:', error.message);
		return json({ error: 'Failed to create session' }, { status: 401 });
	}
}

export async function DELETE({ cookies }) {
	cookies.delete('__session', { path: '/' });
	return json({ success: true });
}