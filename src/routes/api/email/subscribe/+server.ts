// src/routes/api/email/subscribe/+server.ts

import { json } from '@sveltejs/kit';
import { subscribeWithWelcomeEmail } from '$lib/server/email/resend';
import type { RequestHandler } from './$types';

// Email validation regex - more permissive but still secure
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, source = 'website' } = await request.json();

		// Validate email is provided
		if (!email) {
			console.log('❌ No email provided in subscription request');
			return json({
				success: false,
				message: 'Email address is required'
			}, { status: 400 });
		}

		// Validate email format
		if (!EMAIL_REGEX.test(email.trim())) {
			console.log(`❌ Invalid email format: ${email}`);
			return json({
				success: false,
				message: 'Please enter a valid email address'
			}, { status: 400 });
		}

		const cleanEmail = email.trim().toLowerCase();
		console.log(`🚀 Processing subscription for ${cleanEmail} from ${source}`);

		// Subscribe user and send welcome email
		const result = await subscribeWithWelcomeEmail(cleanEmail, source);

		// Log the result for debugging
		if (result.success) {
			console.log(`✅ Subscription successful for ${cleanEmail}:`, result.message);
			if (result.error) {
				console.log(`⚠️ Note: ${result.error}`);
			}
		} else {
			console.log(`❌ Subscription failed for ${cleanEmail}:`, result.message);
		}

		return json({
			success: result.success,
			message: result.message,
			// Include debug info in development
			...(process.env.NODE_ENV === 'development' && {
				debug: {
					emailId: result.id,
					error: result.error,
					source
				}
			})
		}, {
			status: result.success ? 200 : 400
		});

	} catch (error) {
		console.error('❌ Unexpected subscription endpoint error:', error);

		return json({
			success: false,
			message: 'An unexpected error occurred. Please try again.',
			...(process.env.NODE_ENV === 'development' && {
				debug: {
					error: error instanceof Error ? error.message : 'Unknown error'
				}
			})
		}, { status: 500 });
	}
};