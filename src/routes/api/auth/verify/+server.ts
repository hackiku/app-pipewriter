// src/routes/api/auth/session/+server.ts
import { json } from '@sveltejs/kit';
import { adminAuth } from '$lib/server/firebase-admin';
import { dev } from '$app/environment';

// src/routes/api/auth/verify/+server.ts
export async function POST({ request }) {
	const { idToken } = await request.json();

	try {
		const decodedToken = await adminAuth.verifyIdToken(idToken);
		return json({
			valid: true,
			uid: decodedToken.uid,
			// Include other needed user info
		});
	} catch (error) {
		return json({ valid: false, error: error.message });
	}
}