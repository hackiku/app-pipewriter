// src/routes/api/auth/provision-user/+server.ts
import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebase-admin';
import { provisionNewUser } from '$lib/services/firestore/user-provisioning';

export async function POST({ request, cookies }) {
	try {
		const sessionCookie = cookies.get('__session');

		if (!sessionCookie) {
			return json({ error: 'No session cookie' }, { status: 401 });
		}

		// Verify the session and get user info
		const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
		const uid = decodedClaims.uid;

		// Get full user record from Firebase Auth
		const authUser = await adminAuth.getUser(uid);

		// Provision the user in Firestore
		const userData = await provisionNewUser({
			uid: authUser.uid,
			email: authUser.email!,
			displayName: authUser.displayName,
			photoURL: authUser.photoURL
		});

		return json({
			success: true,
			user: userData,
			message: 'User provisioned successfully'
		});

	} catch (error) {
		console.error('Error provisioning user:', error);
		return json({
			error: 'Failed to provision user',
			details: error.message
		}, { status: 500 });
	}
}