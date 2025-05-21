// src/routes/api/user/downgrade/+server.ts
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

export async function POST({ request, locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const { resetTrial = false } = await request.json().catch(() => ({}));

		const updateData: any = {
			pro: false
		};

		// If resetTrial is true, completely reset the user to free tier
		if (resetTrial) {
			// Set trial start date to far in the past to expire it
			const expiredDate = new Date();
			expiredDate.setFullYear(expiredDate.getFullYear() - 1); // 1 year ago

			updateData.trialStartDate = expiredDate;

			console.log(`Resetting user ${uid} to free tier (trial expired)`);
		} else {
			console.log(`Downgrading user ${uid} from Pro (keeping trial status)`);
		}

		// Update user in Firestore
		await adminFirestore.collection('users').doc(uid).update(updateData);

		return json({
			success: true,
			resetTrial,
			message: resetTrial ? 'Reset to free tier' : 'Downgraded from Pro'
		});
	} catch (error) {
		console.error('Error downgrading user:', error);
		return json({ error: 'Failed to downgrade' }, { status: 500 });
	}
}