// src/routes/api/email/unsubscribe/+server.ts
import { json } from '@sveltejs/kit';
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_AUDIENCE_ID } from '$env/static/private';
import type { RequestHandler } from './$types';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Unsubscribe contact in Resend audience
 */
async function unsubscribeFromAudience(email: string): Promise<{
	success: boolean;
	message: string;
}> {
	if (!resend || !RESEND_AUDIENCE_ID) {
		return { success: false, message: 'Email service not configured' };
	}

	try {
		// First find the contact
		const { data: contacts, error: findError } = await resend.contacts.list({
			audienceId: RESEND_AUDIENCE_ID,
		});

		if (findError) {
			console.error('Error finding contacts:', findError);
			return { success: false, message: 'Error finding subscriber' };
		}

		// Find the specific contact by email
		const contact = contacts?.data?.find(c => c.email === email);

		if (!contact) {
			return { success: false, message: 'Email not found in subscriber list' };
		}

		// If already unsubscribed, return success
		if (contact.unsubscribed) {
			return { success: true, message: 'Already unsubscribed' };
		}

		// Update subscription status
		const { error: updateError } = await resend.contacts.update({
			audienceId: RESEND_AUDIENCE_ID,
			id: contact.id,
			unsubscribed: true
		});

		if (updateError) {
			console.error('Error updating contact:', updateError);
			return { success: false, message: 'Failed to unsubscribe' };
		}

		console.log(`Successfully unsubscribed ${email}`);
		return { success: true, message: 'Successfully unsubscribed' };
	} catch (err) {
		console.error('Error unsubscribing:', err);
		return { success: false, message: 'Unsubscribe failed' };
	}
}

// POST /api/email/unsubscribe (for API calls)
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();

		if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			return json({
				success: false,
				message: 'Valid email address is required'
			}, { status: 400 });
		}

		const result = await unsubscribeFromAudience(email);

		return json(result, {
			status: result.success ? 200 : 400
		});

	} catch (error) {
		console.error('Unsubscribe API error:', error);
		return json({
			success: false,
			message: 'Unexpected error processing unsubscribe request'
		}, { status: 500 });
	}
};

// GET /api/email/unsubscribe?email=... (for email links)
export const GET: RequestHandler = async ({ url }) => {
	try {
		const email = url.searchParams.get('email');

		if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			return new Response('Invalid email address', { status: 400 });
		}

		const result = await unsubscribeFromAudience(email);

		if (result.success) {
			// Redirect to confirmation page
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/unsubscribed?success=true'
				}
			});
		} else {
			return new Response('Error unsubscribing. Please try again later.', {
				status: 500
			});
		}

	} catch (error) {
		console.error('Unsubscribe GET error:', error);
		return new Response('Error processing unsubscribe request', { status: 500 });
	}
};

