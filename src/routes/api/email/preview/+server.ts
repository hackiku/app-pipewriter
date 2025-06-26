// src/routes/api/email/preview/+server.ts - PROTECTED EMAIL PREVIEW

import { json } from '@sveltejs/kit';
import { getAllEmailTemplates, generateEmailFromTemplate } from '$lib/server/email/firebase-templates';
import type { RequestHandler } from './$types';

/**
 * GET /api/email/preview - List all available email templates
 * Protected route - requires authentication
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	// Check authentication (handled by API guard in hooks.server.ts)
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		console.log('📧 Loading email templates for preview...');

		const templates = await getAllEmailTemplates();

		if (templates.length === 0) {
			return json({
				success: false,
				message: 'No email templates found. Run email seeding script first.',
				templates: []
			});
		}

		// Return template list with metadata
		const templateList = templates.map(template => ({
			id: template.id,
			name: template.name,
			subject: template.subject,
			category: template.metadata.category,
			tags: template.metadata.tags,
			variables: template.variables,
			estimatedReadTime: template.estimatedReadTime,
			usage: template.usage,
			lastSentAt: template.lastSentAt,
			updatedAt: template.updatedAt
		}));

		console.log(`✅ Found ${templates.length} email templates`);

		return json({
			success: true,
			templates: templateList,
			count: templates.length
		});

	} catch (error) {
		console.error('❌ Error loading email templates:', error);
		return json({
			success: false,
			error: 'Failed to load email templates',
			message: error.message
		}, { status: 500 });
	}
};

/**
 * POST /api/email/preview - Generate and preview specific email template
 * Body: { templateId: string, variables?: Record<string, string>, format?: 'html' | 'text' | 'both' }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { templateId, variables = {}, format = 'both' } = await request.json();

		if (!templateId) {
			return json({
				success: false,
				message: 'templateId is required'
			}, { status: 400 });
		}

		console.log(`📧 Previewing template: ${templateId} with variables:`, variables);

		// Set default variables for preview
		const defaultVariables = {
			email: locals.user.email || 'preview@example.com',
			name: locals.user.displayName || 'Preview User',
			source: 'preview',
			...variables
		};

		// Generate email from template
		const emailContent = await generateEmailFromTemplate(templateId, defaultVariables);

		if (!emailContent) {
			return json({
				success: false,
				message: `Template '${templateId}' not found or failed to generate`
			}, { status: 404 });
		}

		// Return requested format(s)
		const response: any = {
			success: true,
			templateId,
			variables: defaultVariables
		};

		if (format === 'html' || format === 'both') {
			response.html = emailContent.html;
			response.subject = emailContent.subject;
			response.previewText = emailContent.previewText;
		}

		if (format === 'text' || format === 'both') {
			response.text = emailContent.text;
		}

		console.log(`✅ Generated preview for template: ${templateId}`);

		return json(response);

	} catch (error) {
		console.error('❌ Error generating email preview:', error);
		return json({
			success: false,
			error: 'Failed to generate email preview',
			message: error.message
		}, { status: 500 });
	}
};