// src/routes/api/user/downgrade/+server.ts
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

export async function POST({ locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;

		// Server-side operation using adminFirestore - use "pro" field
		await adminFirestore.collection('users').doc(uid).update({
			pro: false
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error downgrading user:', error);
		return json({ error: 'Failed to downgrade' }, { status: 500 });
	}
}