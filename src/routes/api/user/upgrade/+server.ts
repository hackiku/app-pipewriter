// src/routes/api/user/upgrade/+server.ts
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

export async function POST({ locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;

		// Server-side operation using adminFirestore
		await adminFirestore.collection('users').doc(uid).update({
			pro: true
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error upgrading user:', error);
		return json({ error: 'Failed to upgrade' }, { status: 500 });
	}
}