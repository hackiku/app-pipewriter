// src/hooks.server.ts
import { adminAuth, adminFirestore } from "$lib/server/firebase-admin";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const auth: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get("__session");

	// Default state
	event.locals.user = null;
	event.locals.authenticated = false;

	if (sessionCookie) {
		try {
			// Verify the session cookie
			const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
			const uid = decodedClaims.uid;

			// Get basic user data
			const userRecord = await adminAuth.getUser(uid);

			// Only set essential data in locals
			event.locals.user = {
				uid,
				email: userRecord.email,
				displayName: userRecord.displayName,
				photoURL: userRecord.photoURL
			};
			event.locals.authenticated = true;

		} catch (error) {
			// FIXED: Better error handling - silent cleanup for common issues
			const errorCode = error?.code || error?.errorInfo?.code;

			if (errorCode === 'auth/user-not-found' ||
				errorCode === 'auth/invalid-session-cookie' ||
				errorCode === 'auth/argument-error') {
				// Silent cleanup - these are expected when switching between users
				event.cookies.delete('__session', { path: '/' });
			} else {
				// Only log unexpected errors
				console.error('Unexpected session error:', errorCode || 'unknown');
				event.cookies.delete('__session', { path: '/' });
			}
		}
	}

	return resolve(event);
};

// API routes protection
const apiGuard: Handle = async ({ event, resolve }) => {
	// Protect API routes that need auth
	if (event.url.pathname.startsWith('/api/') &&
		!event.url.pathname.startsWith('/api/auth/') &&
		!event.locals.authenticated) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return resolve(event);
};

export const handle = sequence(auth, apiGuard);