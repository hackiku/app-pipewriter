// src/routes/api/user/set-trial/+server.ts
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';
import { dev } from '$app/environment';

export async function POST({ request, locals }) {
	// Only allow in development mode for safety
	if (!dev) {
		return json({ error: 'Only available in development mode' }, { status: 403 });
	}

	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { days } = await request.json();
		const uid = locals.user.uid;

		// Calculate new trial start date based on requested days
		const trialStartDate = new Date();

		// If days is 0, set to yesterday to expire trial
		// Otherwise, set to today
		if (days <= 0) {
			trialStartDate.setDate(trialStartDate.getDate() - 99); // Far in the past
		}

		// Update user in Firestore
		await adminFirestore.collection('users').doc(uid).set({
			trialStartDate,
			pro: false // Ensure pro is false when setting a trial
		}, { merge: true });

		return json({ success: true, days });
	} catch (error) {
		console.error('Error setting trial period:', error);
		return json({ error: 'Failed to set trial period' }, { status: 500 });
	}
}