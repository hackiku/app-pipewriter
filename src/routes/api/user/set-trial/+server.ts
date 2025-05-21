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
		// To set the start date, we count back from today
		const trialStartDate = new Date();
		trialStartDate.setDate(trialStartDate.getDate() - (days > 0 ? 0 : 1)); // If days is 0, set to yesterday to expire trial

		// Update user in Firestore
		await adminFirestore.collection('users').doc(uid).set({
			trialStartDate,
			pro: false 
		}, { merge: true });

		return json({ success: true, days });
	} catch (error) {
		console.error('Error setting trial period:', error);
		return json({ error: 'Failed to set trial period' }, { status: 500 });
	}
}