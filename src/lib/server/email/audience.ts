// src/lib/server/email/audience.ts

// PORT FROM SPACEFOMO

import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_AUDIENCE_ID } from '$env/static/private';
// import { supabase } from '$lib/server/db/client';

// Initialize Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Add a subscriber to Resend audience
 */
export async function addToAudience(email: string): Promise<boolean> {
	if (!resend || !RESEND_AUDIENCE_ID) {
		console.error('Resend configuration missing');
		return false;
	}

	try {
		console.log(`Adding contact ${email} to audience ${RESEND_AUDIENCE_ID}`);

		const { data, error } = await resend.contacts.create({
			email,
			audienceId: RESEND_AUDIENCE_ID,
			unsubscribed: false
		});

		if (error) {
			// Already exists is OK
			if (error.name === 'validation_error' &&
				error.message?.toLowerCase().includes('already exists')) {
				console.log(`Contact ${email} already exists in audience`);
				return true;
			}
			console.error('Resend API error:', error);
			return false;
		}

		console.log(`Successfully added contact ${email} to audience`);
		return true;
	} catch (err) {
		console.error('Error adding to audience:', err);
		return false;
	}
}

/**
 * Remove a subscriber from Resend audience
 */
export async function removeFromAudience(email: string): Promise<boolean> {
	if (!resend || !RESEND_AUDIENCE_ID) {
		console.error('Resend configuration missing');
		return false;
	}

	try {
		// First find the contact
		const { data: contacts, error: findError } = await resend.contacts.list({
			audienceId: RESEND_AUDIENCE_ID,
			email
		});

		if (findError || !contacts || contacts.length === 0) {
			console.error('Error finding contact:', findError || 'Not found');
			return false;
		}

		// Then update subscription status
		const { error: updateError } = await resend.contacts.update({
			audienceId: RESEND_AUDIENCE_ID,
			id: contacts[0].id,
			unsubscribed: true
		});

		if (updateError) {
			console.error('Error updating contact:', updateError);
			return false;
		}

		return true;
	} catch (err) {
		console.error('Error removing from audience:', err);
		return false;
	}
}

/**
 * Subscribe a user to emails (database + audience)
 */
export async function subscribeUser(email: string): Promise<{
	success: boolean;
	message: string;
	databaseUpdated: boolean;
	audienceUpdated: boolean;
}> {
	let databaseUpdated = false;
	let audienceUpdated = false;

	// Check if already subscribed
	const { data: existingUser, error: checkError } = await supabase
		.from('subscribers')
		.select('id, status')
		.eq('email', email)
		.single();

	if (!checkError && existingUser) {
		// User exists
		if (existingUser.status === 'unsubscribed') {
			// Reactivate
			const { error: updateError } = await supabase
				.from('subscribers')
				.update({
					status: 'active',
					updated_at: new Date().toISOString()
				})
				.eq('id', existingUser.id);

			if (updateError) {
				console.error('Error reactivating subscriber:', updateError);
			} else {
				databaseUpdated = true;
			}
		} else {
			// Already active
			databaseUpdated = true;
		}
	} else if (checkError && checkError.code === 'PGRST116') {
		// New user
		const { error: insertError } = await supabase
			.from('subscribers')
			.insert({
				email,
				status: 'active',
				created_at: new Date().toISOString()
			});

		if (insertError) {
			console.error('Error adding subscriber:', insertError);
		} else {
			databaseUpdated = true;
		}
	} else {
		console.error('Error checking subscription:', checkError);
	}

	// Add to Resend audience
	audienceUpdated = await addToAudience(email);

	// Determine result
	const success = databaseUpdated && audienceUpdated;
	let message = 'Subscription processing failed';

	if (success) {
		if (existingUser && existingUser.status === 'active') {
			message = 'Already subscribed';
		} else if (existingUser) {
			message = 'Subscription reactivated';
		} else {
			message = 'Successfully subscribed';
		}
	}

	return {
		success,
		message,
		databaseUpdated,
		audienceUpdated
	};
}

/**
 * Unsubscribe a user from emails
 */
export async function unsubscribeUser(email: string): Promise<{
	success: boolean;
	message: string;
	databaseUpdated: boolean;
	audienceUpdated: boolean;
}> {
	let databaseUpdated = false;

	// Update database
	const { error: updateError } = await supabase
		.from('subscribers')
		.update({
			status: 'unsubscribed',
			updated_at: new Date().toISOString()
		})
		.eq('email', email);

	if (updateError) {
		console.error('Error updating subscriber:', updateError);
	} else {
		databaseUpdated = true;
	}

	// Update Resend audience
	const audienceUpdated = await removeFromAudience(email);

	return {
		success: databaseUpdated || audienceUpdated,
		message: databaseUpdated ? 'Successfully unsubscribed' : 'Unsubscribe failed',
		databaseUpdated,
		audienceUpdated
	};
}