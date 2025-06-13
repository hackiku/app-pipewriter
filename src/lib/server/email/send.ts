// src/lib/server/email/send.ts
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { generateWelcomeEmail, generateNewsSharedEmail } from './templates';
import type { Submission } from '$lib/types/submission';

// Initialize Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Use your verified domain for the from address
const FROM_EMAIL = 'SpaceFomo <news@mail.spacefomo.com>';

/**
 * Send an email using Resend
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
}): Promise<{ success: boolean; id?: string; error?: any }> {
	if (!resend) {
		console.error('Resend client not initialized');
		return { success: false, error: 'Resend not configured' };
	}

	try {
		console.log(`Sending email to ${to} with subject "${subject}" from ${from}`);

		const { data, error } = await resend.emails.send({
			from,
			to,
			subject,
			html,
			text
		});

		if (error) {
			console.error('Error sending email:', error);
			return { success: false, error };
		}

		console.log(`Email sent successfully. ID: ${data?.id}`);
		return { success: true, id: data?.id };
	} catch (err) {
		console.error('Unexpected error sending email:', err);
		return { success: false, error: err };
	}
}

/**
 * Send a welcome email to a new subscriber
 */
export async function sendWelcomeEmail(email: string): Promise<{ success: boolean; id?: string; error?: any }> {
	const { subject, html, text } = generateWelcomeEmail(email);
	return sendEmail({ to: email, subject, html, text });
}

/**
 * Send a news shared confirmation email
 */
export async function sendNewsSharedEmail(email: string, submission: Submission): Promise<{ success: boolean; id?: string; error?: any }> {
	const { subject, html, text } = generateNewsSharedEmail(email, submission);
	return sendEmail({ to: email, subject, html, text });
}