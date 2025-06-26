// src/routes/api/email/test/+server.ts - SEND TEST EMAILS

import { json } from '@sveltejs/kit';
import { generateEmailFromTemplate, getEmailSequence } from '$lib/server/email/firebase-templates';
import { sendEmail } from '$lib/server/email/resend';
import type { RequestHandler } from './$types';

/**
 * POST /api/email/test - Send test emails
 * Body: { 
 *   type: 'single' | 'sequence',
 *   templateId?: string,
 *   sequenceId?: string,
 *   email?: string,
 *   variables?: Record<string, string>,
 *   delaySeconds?: number
 * }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const {
			type,
			templateId,
			sequenceId,
			email,
			variables = {},
			delaySeconds = 5
		} = await request.json();

		// Use authenticated user's email as default
		const targetEmail = email || locals.user.email;

		if (!targetEmail) {
			return json({
				success: false,
				message: 'No email address available for testing'
			}, { status: 400 });
		}

		// Set default variables
		const defaultVariables = {
			email: targetEmail,
			name: locals.user.displayName || targetEmail.split('@')[0],
			source: 'test',
			...variables
		};

		console.log(`🧪 Test email request: ${type} to ${targetEmail}`);

		if (type === 'single') {
			if (!templateId) {
				return json({
					success: false,
					message: 'templateId is required for single email test'
				}, { status: 400 });
			}

			return await sendSingleTestEmail(templateId, targetEmail, defaultVariables);
		}

		if (type === 'sequence') {
			if (!sequenceId) {
				return json({
					success: false,
					message: 'sequenceId is required for sequence email test'
				}, { status: 400 });
			}

			return await sendSequenceTestEmails(sequenceId, targetEmail, defaultVariables, delaySeconds);
		}

		return json({
			success: false,
			message: 'Invalid type. Must be "single" or "sequence"'
		}, { status: 400 });

	} catch (error) {
		console.error('❌ Error in email test:', error);
		return json({
			success: false,
			error: 'Failed to send test email',
			message: error.message
		}, { status: 500 });
	}
};

/**
 * Send a single test email
 */
async function sendSingleTestEmail(
	templateId: string,
	email: string,
	variables: Record<string, string>
): Promise<Response> {
	try {
		console.log(`📧 Sending single test email: ${templateId} to ${email}`);

		const emailContent = await generateEmailFromTemplate(templateId, variables);

		if (!emailContent) {
			return json({
				success: false,
				message: `Template '${templateId}' not found or failed to generate`
			}, { status: 404 });
		}

		// Add [TEST] prefix to subject
		const testSubject = `[TEST] ${emailContent.subject}`;

		const result = await sendEmail({
			to: email,
			subject: testSubject,
			html: emailContent.html,
			text: `[TEST EMAIL]\n\n${emailContent.text}`
		});

		if (result.success) {
			console.log(`✅ Test email sent successfully: ${templateId} to ${email}`);
			return json({
				success: true,
				message: `Test email sent successfully to ${email}`,
				templateId,
				emailId: result.id,
				subject: testSubject
			});
		} else {
			console.error(`❌ Test email failed: ${templateId} to ${email}`, result.error);
			return json({
				success: false,
				message: 'Failed to send test email',
				error: result.error
			}, { status: 500 });
		}

	} catch (error) {
		console.error(`❌ Error sending single test email:`, error);
		return json({
			success: false,
			message: 'Error sending test email',
			error: error.message
		}, { status: 500 });
	}
}

/**
 * Send test emails for an entire sequence with delays
 */
async function sendSequenceTestEmails(
	sequenceId: string,
	email: string,
	variables: Record<string, string>,
	delaySeconds: number
): Promise<Response> {
	try {
		console.log(`📅 Sending test sequence: ${sequenceId} to ${email} with ${delaySeconds}s delays`);

		const sequence = await getEmailSequence(sequenceId);

		if (!sequence) {
			return json({
				success: false,
				message: `Sequence '${sequenceId}' not found`
			}, { status: 404 });
		}

		if (!sequence.active) {
			return json({
				success: false,
				message: `Sequence '${sequenceId}' is not active`
			}, { status: 400 });
		}

		const results = [];
		const emailsToSend = sequence.emails.filter(Boolean);

		console.log(`📧 Sending ${emailsToSend.length} emails from sequence: ${sequence.name}`);

		// Send emails with delays
		for (let i = 0; i < emailsToSend.length; i++) {
			const emailConfig = emailsToSend[i];

			try {
				// Add delay before sending (except first email)
				if (i > 0) {
					console.log(`⏱️ Waiting ${delaySeconds} seconds before sending ${emailConfig.templateId}...`);
					await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
				}

				const emailContent = await generateEmailFromTemplate(emailConfig.templateId, variables);

				if (emailContent) {
					const testSubject = `[TEST ${i + 1}/${emailsToSend.length}] ${emailContent.subject}`;

					const result = await sendEmail({
						to: email,
						subject: testSubject,
						html: emailContent.html,
						text: `[TEST EMAIL ${i + 1} of ${emailsToSend.length}]\n\n${emailContent.text}`
					});

					results.push({
						templateId: emailConfig.templateId,
						name: emailConfig.name,
						success: result.success,
						emailId: result.id,
						subject: testSubject,
						error: result.error || null
					});

					if (result.success) {
						console.log(`✅ Sent test email ${i + 1}/${emailsToSend.length}: ${emailConfig.templateId}`);
					} else {
						console.error(`❌ Failed test email ${i + 1}/${emailsToSend.length}: ${emailConfig.templateId}`, result.error);
					}
				} else {
					results.push({
						templateId: emailConfig.templateId,
						name: emailConfig.name,
						success: false,
						error: 'Failed to generate template'
					});
				}
			} catch (error) {
				results.push({
					templateId: emailConfig.templateId,
					name: emailConfig.name,
					success: false,
					error: error.message
				});
			}
		}

		const successCount = results.filter(r => r.success).length;
		const totalCount = results.length;

		console.log(`🎯 Sequence test complete: ${successCount}/${totalCount} emails sent successfully`);

		return json({
			success: successCount > 0,
			message: `Sent ${successCount}/${totalCount} test emails from sequence '${sequence.name}'`,
			sequenceId,
			sequenceName: sequence.name,
			totalEmails: totalCount,
			successfulEmails: successCount,
			results,
			delaySeconds
		});

	} catch (error) {
		console.error(`❌ Error sending sequence test emails:`, error);
		return json({
			success: false,
			message: 'Error sending sequence test emails',
			error: error.message
		}, { status: 500 });
	}
}