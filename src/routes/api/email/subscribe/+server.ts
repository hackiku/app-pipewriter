// src/routes/api/email/subscribe/+server.ts - UPDATED TO USE FIREBASE TEMPLATES

import { json } from '@sveltejs/kit';
import { addToAudience } from '$lib/server/email/resend';
import { generateEmailFromTemplate } from '$lib/server/email/firebase-templates';
import { sendEmail } from '$lib/server/email/resend';
import type { RequestHandler } from './$types';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, source = 'website', sendWelcome = true } = await request.json();

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

		// Step 1: Add to Resend audience
		const audienceResult = await addToAudience(cleanEmail, source);

		if (!audienceResult.success) {
			console.log(`❌ Failed to add ${cleanEmail} to audience:`, audienceResult.message);
			return json({
				success: false,
				message: audienceResult.message || 'Subscription failed'
			}, { status: 400 });
		}

		// Step 2: Send welcome email using Firebase template (if requested)
		let welcomeEmailResult = null;

		if (sendWelcome && audienceResult.id !== 'existing') {
			console.log(`📧 Sending welcome email to new subscriber: ${cleanEmail}`);

			try {
				// Generate email from Firebase template
				const emailContent = await generateEmailFromTemplate('welcome', {
					email: cleanEmail,
					name: cleanEmail.split('@')[0], // Use email username as fallback name
					source: source
				});

				if (emailContent) {
					welcomeEmailResult = await sendEmail({
						to: cleanEmail,
						subject: emailContent.subject,
						html: emailContent.html,
						text: emailContent.text
					});

					if (welcomeEmailResult.success) {
						console.log(`✅ Welcome email sent successfully to ${cleanEmail}`);
					} else {
						console.error(`❌ Welcome email failed for ${cleanEmail}:`, welcomeEmailResult.error);
					}
				} else {
					console.error(`❌ Failed to generate welcome email template for ${cleanEmail}`);
					welcomeEmailResult = { success: false, error: 'Template generation failed' };
				}
			} catch (error) {
				console.error(`❌ Welcome email error for ${cleanEmail}:`, error);
				welcomeEmailResult = { success: false, error: error.message };
			}
		} else if (audienceResult.id === 'existing') {
			console.log(`ℹ️ Skipping welcome email for existing subscriber: ${cleanEmail}`);
		}

		// Determine response based on results
		const success = audienceResult.success;
		let message = audienceResult.message;

		// Add welcome email status to response
		if (sendWelcome && audienceResult.id !== 'existing') {
			if (welcomeEmailResult?.success) {
				message = 'Successfully subscribed! Check your inbox for a welcome message.';
			} else {
				message = 'Successfully subscribed! Welcome email may take a few minutes to arrive.';
			}
		}

		return json({
			success,
			message,
			// Include debug info in development
			...(process.env.NODE_ENV === 'development' && {
				debug: {
					audienceResult,
					welcomeEmailResult,
					source,
					usedFirebaseTemplate: true
				}
			})
		}, {
			status: success ? 200 : 400
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