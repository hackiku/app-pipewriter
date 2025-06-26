// src/lib/server/email/firebase-templates.ts
import { adminFirestore } from '../firebase-admin';

export interface EmailTemplate {
	id: string;
	name: string;
	subject: string;
	previewText: string;
	text: string;
	html: string;
	variables: string[];
	active: boolean;
	metadata: {
		tier: string;
		tags: string[];
		category: string;
		version: string;
	};
	templateEngine: string;
	estimatedReadTime: string;
	usage: number;
	lastSentAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface EmailSequence {
	id: string;
	name: string;
	description: string;
	emails: Array<{
		templateId: string;
		delayHours: number;
		name: string;
		description: string;
	}>;
	triggers: string[];
	targetAudience: {
		userTiers: string[];
		sources: string[];
	};
	active: boolean;
	metadata: {
		tier: string;
		tags: string[];
		category: string;
		version: string;
	};
}

/**
 * Load email template from Firebase
 */
export async function getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
	try {
		console.log(`📧 Loading template: ${templateId}`);

		const templateRef = adminFirestore
			.collection('email')
			.doc('templates')
			.collection('items')
			.doc(templateId);

		const templateDoc = await templateRef.get();

		if (!templateDoc.exists) {
			console.error(`❌ Template not found: ${templateId}`);
			return null;
		}

		const templateData = templateDoc.data() as EmailTemplate;
		console.log(`✅ Template loaded: ${templateData.name}`);

		return templateData;
	} catch (error) {
		console.error(`❌ Error loading template ${templateId}:`, error);
		return null;
	}
}

/**
 * Load email sequence from Firebase
 */
export async function getEmailSequence(sequenceId: string): Promise<EmailSequence | null> {
	try {
		console.log(`📅 Loading sequence: ${sequenceId}`);

		const sequenceRef = adminFirestore
			.collection('email')
			.doc('sequences')
			.collection('items')
			.doc(sequenceId);

		const sequenceDoc = await sequenceRef.get();

		if (!sequenceDoc.exists) {
			console.error(`❌ Sequence not found: ${sequenceId}`);
			return null;
		}

		const sequenceData = sequenceDoc.data() as EmailSequence;
		console.log(`✅ Sequence loaded: ${sequenceData.name}`);

		return sequenceData;
	} catch (error) {
		console.error(`❌ Error loading sequence ${sequenceId}:`, error);
		return null;
	}
}

/**
 * Load all email templates
 */
export async function getAllEmailTemplates(): Promise<EmailTemplate[]> {
	try {
		console.log('📧 Loading all email templates...');

		const templatesRef = adminFirestore
			.collection('email')
			.doc('templates')
			.collection('items')
			.where('active', '==', true);

		const snapshot = await templatesRef.get();

		const templates = snapshot.docs.map(doc => doc.data() as EmailTemplate);

		console.log(`✅ Loaded ${templates.length} email templates`);

		return templates;
	} catch (error) {
		console.error('❌ Error loading all templates:', error);
		return [];
	}
}

/**
 * Process template variables (simple mustache-style replacement)
 */
export function processTemplate(
	template: string,
	variables: Record<string, string>
): string {
	let processed = template;

	// Replace {{variable}} with actual values
	Object.entries(variables).forEach(([key, value]) => {
		const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
		processed = processed.replace(regex, value);
	});

	// Handle {{name || 'there'}} fallbacks
	const fallbackRegex = /\{\{\s*(\w+)\s*\|\|\s*['"]([^'"]+)['"]\s*\}\}/g;
	processed = processed.replace(fallbackRegex, (match, varName, fallback) => {
		return variables[varName] || fallback;
	});

	return processed;
}

/**
 * Generate email from template with variables
 */
export async function generateEmailFromTemplate(
	templateId: string,
	variables: Record<string, string> = {}
): Promise<{
	subject: string;
	html: string;
	text: string;
	previewText: string;
} | null> {
	try {
		const template = await getEmailTemplate(templateId);

		if (!template) {
			return null;
		}

		// Process variables in all fields
		const subject = processTemplate(template.subject, variables);
		const html = processTemplate(template.html, variables);
		const text = processTemplate(template.text, variables);
		const previewText = processTemplate(template.previewText, variables);

		console.log(`✅ Generated email from template: ${template.name}`);

		return {
			subject,
			html,
			text,
			previewText
		};
	} catch (error) {
		console.error(`❌ Error generating email from template ${templateId}:`, error);
		return null;
	}
}

/**
 * Fallback to hardcoded template if Firebase fails
 */
export async function getEmailTemplateWithFallback(templateId: string): Promise<EmailTemplate | null> {
	// Try Firebase first
	const firebaseTemplate = await getEmailTemplate(templateId);
	if (firebaseTemplate) {
		return firebaseTemplate;
	}

	// Fallback to hardcoded templates
	console.warn(`⚠️ Falling back to hardcoded template: ${templateId}`);

	try {
		if (templateId === 'welcome') {
			const { generateWelcomeEmail } = await import('./templates/welcome.ts');
			const { subject, html, text } = generateWelcomeEmail('{{email}}');

			return {
				id: 'welcome',
				name: 'Welcome Email (Fallback)',
				subject,
				previewText: 'Welcome to Pipewriter...',
				text,
				html,
				variables: ['email', 'name'],
				active: true,
				metadata: {
					tier: 'system',
					tags: ['fallback'],
					category: 'onboarding',
					version: '1.0'
				},
				templateEngine: 'mustache',
				estimatedReadTime: '2 minutes',
				usage: 0,
				lastSentAt: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};
		}
	} catch (error) {
		console.error(`❌ Fallback template failed for ${templateId}:`, error);
	}

	return null;
}