// src/routes/api/webhooks/stripe/+server.ts
export async function POST({ request }) {
	const payload = await request.text();
	const sig = request.headers.get('stripe-signature');

	try {
		const event = stripe.webhooks.constructEvent(
			payload, sig, process.env.STRIPE_WEBHOOK_SECRET
		);

		if (event.type === 'checkout.session.completed') {
			const session = event.data.object;
			const { productId, userId } = session.metadata;

			// Record purchase in Firestore
			const purchaseData = {
				productId,
				purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
				price: session.amount_total / 100, // Convert from cents
				status: 'completed',
				stripeSessionId: session.id,
				stripePaymentIntentId: session.payment_intent
			};

			// Add to user's purchases
			await adminFirestore
				.collection('users')
				.doc(userId)
				.collection('purchases')
				.add(purchaseData);

			// Add to orders collection
			await adminFirestore
				.collection('orders')
				.add({
					...purchaseData,
					userId
				});
		}

		return new Response(null, { status: 200 });
	} catch (error) {
		console.error('Webhook error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}