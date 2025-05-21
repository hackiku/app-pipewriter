// src/routes/api/webhooks/stripe/+server.ts
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { adminFirestore } from '$lib/server/firebase-admin';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export async function POST({ request }) {
	const payload = await request.text();
	const signature = request.headers.get('stripe-signature');

	let event;
	try {
		event = stripe.webhooks.constructEvent(
			payload,
			signature,
			STRIPE_WEBHOOK_SECRET
		);
	} catch (err) {
		console.error('Webhook signature verification failed:', err.message);
		return json({ error: err.message }, { status: 400 });
	}

	// Handle the event
	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object;
			await handleCheckoutSuccess(session);
			break;
		}
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted': {
			const subscription = event.data.object;
			await handleSubscriptionChange(subscription);
			break;
		}
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	return json({ received: true });
}

async function handleCheckoutSuccess(session) {
	// Get the customer who subscribed
	const userId = session.metadata.userId;

	if (!userId) {
		console.error('No userId in session metadata');
		return;
	}

	// Update the user's subscription status in Firestore
	try {
		const userRef = adminFirestore.collection('users').doc(userId);

		await userRef.set({
			premium: true,
			stripeCustomerId: session.customer,
			stripeSubscriptionId: session.subscription,
			updatedAt: new Date()
		}, { merge: true });

		console.log(`Updated subscription status for user ${userId}`);
	} catch (error) {
		console.error('Error updating user subscription status:', error);
	}
}

async function handleSubscriptionChange(subscription) {
	// Find the user with this subscription
	try {
		const usersSnapshot = await adminFirestore
			.collection('users')
			.where('stripeSubscriptionId', '==', subscription.id)
			.get();

		if (usersSnapshot.empty) {
			console.log('No matching user found for subscription:', subscription.id);
			return;
		}

		// Update each user with this subscription ID
		for (const doc of usersSnapshot.docs) {
			const userId = doc.id;
			const status = subscription.status;

			await adminFirestore.collection('users').doc(userId).set({
				premium: status === 'active',
				subscriptionStatus: status,
				updatedAt: new Date()
			}, { merge: true });

			console.log(`Updated subscription status to ${status} for user ${userId}`);
		}
	} catch (error) {
		console.error('Error updating subscription status:', error);
	}
}