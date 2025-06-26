// src/hooks.server.ts - Enhanced version with debug routes
import { adminAuth } from "$lib/server/firebase-admin";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { dev } from '$app/environment';

const auth: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get("__session");

	// Default state
	event.locals.user = null;
	event.locals.authenticated = false;

	if (sessionCookie) {if (event.url.pathname.startsWith('/api/email/')) {
		return resolve(event);
	}
	
		try {
			// SECURITY: Always verify with checkRevoked: true
			const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
			const uid = decodedClaims.uid;

			// SECURITY: Double-check user exists and is active
			const userRecord = await adminAuth.getUser(uid);

			if (userRecord.disabled) {
				throw new Error('User account disabled');
			}

			event.locals.user = {
				uid,
				email: userRecord.email,
				displayName: userRecord.displayName,
				photoURL: userRecord.photoURL
			};
			event.locals.authenticated = true;

		} catch (error) {
			console.error('Session verification failed:', error.code || error.message);

			// SECURITY: Always clear invalid sessions
			event.cookies.delete('__session', { path: '/' });
			event.locals.user = null;
			event.locals.authenticated = false;
		}
	}

	return resolve(event);
};

// SECURITY: Protect API routes (with debug exceptions in dev)
const apiGuard: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api/')) {
		// Allow auth routes
		if (event.url.pathname.startsWith('/api/auth/')) {
			return resolve(event);
		}

		// email expose to website
		if (event.url.pathname.startsWith('/api/email/')) {
			return resolve(event);
		}		

		// -------------- DEV --------------

		// Allow debug routes in development
		if (dev && event.url.pathname.startsWith('/api/debug')) {
			return resolve(event);
		}

		// Allow test routes in development  
		if (dev && event.url.pathname.startsWith('/api/test')) {
			return resolve(event);
		}

		// Block everything else if not authenticated
		if (!event.locals.authenticated) {
			console.warn(`Unauthorized API access attempt: ${event.url.pathname}`);
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	return resolve(event);
};

export const handle = sequence(auth, apiGuard);