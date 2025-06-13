// src/lib/server/email/resend.ts
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_AUDIENCE_ID } from '$env/static/private';

// Validate environment variables
if (!RESEND_API_KEY) {
	console.error('❌ RESEND_API_KEY is not configured');
}
if (!RESEND_AUDIENCE_ID) {
	console.error('❌ RESEND_AUDIENCE_ID is not configured');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Use your verified domain - this MUST be verified in your Resend dashboard
const FROM_EMAIL = 'Ivan from Pipewriter <ivan@pipewriter.io>';

export interface EmailResult {
	success: boolean;
	message: string;
	id?: string;
	error?: any;
}

/**
 * Add subscriber to Resend audience
 */
export async function addToAudience(email: string, source: string = 'website'): Promise<EmailResult> {
	if (!resend || !RESEND_AUDIENCE_ID) {
		const error = 'Resend service not properly configured';
		console.error('❌', error);
		return { success: false, message: 'Email service unavailable' };
	}

	try {
		console.log(`📧 Adding contact ${email} to audience ${RESEND_AUDIENCE_ID} from ${source}`);

		const { data, error } = await resend.contacts.create({
			email,
			audienceId: RESEND_AUDIENCE_ID,
			unsubscribed: false,
		});

		if (error) {
			// Handle existing contact gracefully
			if (error.name === 'validation_error' &&
				error.message?.toLowerCase().includes('already exists')) {
				console.log(`ℹ️ Contact ${email} already exists in audience`);
				return {
					success: true,
					message: 'Already subscribed!',
					id: 'existing'
				};
			}

			console.error('❌ Resend audience error:', error);
			return {
				success: false,
				message: 'Subscription failed - please try again',
				error
			};
		}

		console.log(`✅ Successfully added contact ${email} to audience`);
		return {
			success: true,
			message: 'Successfully subscribed!',
			id: data?.id
		};

	} catch (err) {
		console.error('❌ Unexpected error adding to audience:', err);
		return {
			success: false,
			message: 'Subscription failed - please try again',
			error: err
		};
	}
}

/**
 * Send email using Resend
 */
export async function sendEmail({
	to,
	subject,
	html,
	text,
	from = FROM_EMAIL
}: {
	to: string;
	subject: string;
	html: string;
	text: string;
	from?: string;
}): Promise<EmailResult> {
	if (!resend) {
		const error = 'Resend client not initialized - check RESEND_API_KEY';
		console.error('❌', error);
		return { success: false, message: 'Email service unavailable', error };
	}

	try {
		console.log(`📤 Sending email to ${to} with subject "${subject}" from ${from}`);

		const { data, error } = await resend.emails.send({
			from,
			to,
			subject,
			html,
			text
		});

		if (error) {
			console.error('❌ Error sending email:', error);
			return {
				success: false,
				message: 'Failed to send email',
				error
			};
		}

		console.log(`✅ Email sent successfully. ID: ${data?.id}`);
		return {
			success: true,
			message: 'Email sent successfully',
			id: data?.id
		};

	} catch (err) {
		console.error('❌ Unexpected error sending email:', err);
		return {
			success: false,
			message: 'Failed to send email',
			error: err
		};
	}
}

/**
 * Subscribe user and send welcome email
 */
export async function subscribeWithWelcomeEmail(
	email: string,
	source: string = 'website'
): Promise<EmailResult> {
	// First, add to audience
	const subscribeResult = await addToAudience(email, source);

	if (!subscribeResult.success) {
		return subscribeResult;
	}

	// Only send welcome email to new subscribers
	if (subscribeResult.id === 'existing') {
		console.log(`ℹ️ Skipping welcome email for existing subscriber: ${email}`);
		return {
			success: true,
			message: "You're already subscribed! Check your inbox for updates.",
			id: subscribeResult.id
		};
	}

	// Import welcome email template dynamically to avoid import issues
	try {
		const { generateWelcomeEmail } = await import('./templates/welcome.js');
		const { subject, html, text } = generateWelcomeEmail(email);

		console.log(`📧 Sending welcome email to new subscriber: ${email}`);

		const emailResult = await sendEmail({
			to: email,
			subject,
			html,
			text
		});

		if (!emailResult.success) {
			console.error(`❌ Welcome email failed for ${email}:`, emailResult.error);
			// Still return success for subscription, but note email failure
			return {
				success: true,
				message: 'Successfully subscribed! Welcome email may take a few minutes to arrive.',
				id: subscribeResult.id,
				error: `Welcome email failed: ${emailResult.message}`
			};
		}

		console.log(`✅ Welcome email sent successfully to ${email}`);
		return {
			success: true,
			message: 'Successfully subscribed! Check your inbox for a welcome message.',
			id: emailResult.id
		};

	} catch (err) {
		console.error('❌ Error importing welcome email template:', err);
		return {
			success: true,
			message: 'Successfully subscribed! Welcome email may take a few minutes to arrive.',
			id: subscribeResult.id,
			error: 'Welcome email template error'
		};
	}
}