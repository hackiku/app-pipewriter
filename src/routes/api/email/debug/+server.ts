// src/routes/api/email/debug/+server.ts

import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { sendEmail } from '$lib/server/email/resend';
import { generateWelcomeEmail } from '$lib/server/email/templates/welcome';
import { RESEND_API_KEY, RESEND_AUDIENCE_ID } from '$env/static/private';
import type { RequestHandler } from './$types';

// Only allow in development
export const POST: RequestHandler = async ({ request }) => {
	if (!dev) {
		return json({ error: 'Debug endpoint only available in development' }, { status: 403 });
	}

	try {
		const { email, testType = 'welcome' } = await request.json();

		if (!email) {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		// Environment check
		const envCheck = {
			hasResendKey: !!RESEND_API_KEY,
			hasAudienceId: !!RESEND_AUDIENCE_ID,
			resendKeyLength: RESEND_API_KEY?.length || 0,
			audienceIdLength: RESEND_AUDIENCE_ID?.length || 0
		};

		console.log('🔍 Environment check:', envCheck);

		if (testType === 'welcome') {
			// Test welcome email
			console.log(`🧪 Testing welcome email to: ${email}`);

			const { subject, html, text } = generateWelcomeEmail(email);

			const result = await sendEmail({
				to: email,
				subject: `[TEST] ${subject}`,
				html: html.replace('Pipewriter', '[TEST] Pipewriter'),
				text: `[TEST EMAIL]\n\n${text}`
			});

			return json({
				success: result.success,
				message: result.message,
				debug: {
					emailId: result.id,
					error: result.error,
					environment: envCheck,
					template: {
						subject,
						htmlLength: html.length,
						textLength: text.length
					}
				}
			});
		}

		if (testType === 'simple') {
			// Test simple email
			console.log(`🧪 Testing simple email to: ${email}`);

			const result = await sendEmail({
				to: email,
				subject: '[TEST] Pipewriter Email Service Test',
				html: `
					<!DOCTYPE html>
					<html>
					<head><meta charset="utf-8"></head>
					<body style="font-family: Arial, sans-serif; padding: 20px;">
						<h1 style="color: #3644FE;">✅ Email Service Working!</h1>
						<p>This is a test email from your Pipewriter email service.</p>
						<p>If you received this, your Resend configuration is working correctly.</p>
						<p><strong>Test details:</strong></p>
						<ul>
							<li>Sent to: ${email}</li>
							<li>Timestamp: ${new Date().toISOString()}</li>
							<li>Environment: Development</li>
						</ul>
					</body>
					</html>
				`,
				text: `✅ Email Service Working!
				
This is a test email from your Pipewriter email service.
If you received this, your Resend configuration is working correctly.

Test details:
- Sent to: ${email}
- Timestamp: ${new Date().toISOString()}
- Environment: Development`
			});

			return json({
				success: result.success,
				message: result.message,
				debug: {
					emailId: result.id,
					error: result.error,
					environment: envCheck
				}
			});
		}

		return json({ error: 'Invalid test type' }, { status: 400 });

	} catch (error) {
		console.error('❌ Debug endpoint error:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			environment: {
				hasResendKey: !!RESEND_API_KEY,
				hasAudienceId: !!RESEND_AUDIENCE_ID
			}
		}, { status: 500 });
	}
};

// GET endpoint to check configuration
export const GET: RequestHandler = async () => {
	if (!dev) {
		return json({ error: 'Debug endpoint only available in development' }, { status: 403 });
	}

	return json({
		environment: {
			hasResendKey: !!RESEND_API_KEY,
			hasAudienceId: !!RESEND_AUDIENCE_ID,
			resendKeyLength: RESEND_API_KEY?.length || 0,
			audienceIdLength: RESEND_AUDIENCE_ID?.length || 0,
			nodeEnv: process.env.NODE_ENV
		},
		endpoints: {
			subscribe: '/api/email/subscribe',
			unsubscribe: '/api/email/unsubscribe',
			debug: '/api/email/debug'
		},
		tests: {
			simple: 'POST /api/email/debug with { "email": "test@example.com", "testType": "simple" }',
			welcome: 'POST /api/email/debug with { "email": "test@example.com", "testType": "welcome" }'
		}
	});
};