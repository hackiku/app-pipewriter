// src/routes/api/payment/create-checkout/+server.ts
import { json } from '@sveltejs/kit';
import { adminAuth, adminFirestore } from '$lib/server/firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST({ request, cookies }) {
	try {
		const { productId } = await request.json();
		const sessionCookie = cookies.get('__session');

		if (!sessionCookie) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Verify the session
		const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
		const uid = decodedClaims.uid;

		// Get the product
		const productRef = adminFirestore.collection('products').doc(productId);
		const productDoc = await productRef.get();

		if (!productDoc.exists) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		const product = productDoc.data();

		// Get or create Stripe customer
		let customerData = { id: undefined };
		const userDoc = await adminFirestore.collection('users').doc(uid).get();
		const userData = userDoc.data() || {};

		if (userData.stripeCustomerId) {
			customerData.id = userData.stripeCustomerId;
		} else {
			// Get user email for new customer
			const userRecord = await adminAuth.getUser(uid);

			// Create customer in Stripe
			const customer = await stripe.customers.create({
				email: userRecord.email,
				metadata: { firebaseUserId: uid }
			});

			// Save Stripe customer ID to Firestore
			await adminFirestore.collection('users').doc(uid).update({
				stripeCustomerId: customer.id
			});

			customerData.id = customer.id;
		}

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			customer: customerData.id,
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: product.name,
							description: product.description,
						},
						unit_amount: product.price * 100, // Stripe uses cents
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `${request.headers.get('origin')}/dashboard/purchases?success=true`,
			cancel_url: `${request.headers.get('origin')}/dashboard/store`,
			metadata: {
				productId,
				userId: uid
			}
		});

		return json({ sessionId: session.id });
	} catch (error) {
		console.error('Error creating checkout session:', error);
		return json({ error: 'Failed to create checkout session' }, { status: 500 });
	}
}