// src/lib/server/email/sequences.ts
import { sendEmail } from '../resend';

export interface EmailSequence {
	name: string;
	emails: Array<{
		delay: number; // hours
		template: string;
		subject: string;
	}>;
}

// Define your email sequences
export const sequences: Record<string, EmailSequence> = {
	welcome: {
		name: 'Welcome Series',
		emails: [
			{
				delay: 0, // Immediate
				template: 'welcome',
				subject: "You're in! (And yes, I used urgency in this subject line) 🎯"
			},
			{
				delay: 24, // 1 day later
				template: 'tutorial',
				subject: "Here's how to wireframe in Google Docs (2-min read) 📋"
			},
			{
				delay: 72, // 3 days later
				template: 'social-proof',
				subject: "How Sarah increased her project rates by 40% 💰"
			},
			{
				delay: 168, // 1 week later
				template: 'upgrade',
				subject: "Ready to unlock the full wireframe library? 🔓"
			}
		]
	},
	trial: {
		name: 'Trial Series',
		emails: [
			{
				delay: 336, // 14 days (trial ending)
				template: 'trial-ending',
				subject: "Your trial ends tomorrow (here's what you'll miss) ⏰"
			},
			{
				delay: 360, // 15 days (trial ended)
				template: 'trial-ended',
				subject: "Trial ended - but you can still get 20% off 🎯"
			}
		]
	}
};

// Schedule email in sequence
export async function scheduleEmail(
	email: string,
	sequenceName: string,
	emailIndex: number,
	subscriptionDate: Date
) {
	const sequence = sequences[sequenceName];
	if (!sequence || !sequence.emails[emailIndex]) {
		throw new Error('Invalid sequence or email index');
	}

	const emailConfig = sequence.emails[emailIndex];
	const sendAt = new Date(subscriptionDate.getTime() + emailConfig.delay * 60 * 60 * 1000);

	// Store in your database (or use Vercel KV for simple storage)
	const scheduledEmail = {
		id: `${email}-${sequenceName}-${emailIndex}`,
		email,
		sequenceName,
		emailIndex,
		sendAt: sendAt.toISOString(),
		status: 'scheduled',
		template: emailConfig.template,
		subject: emailConfig.subject
	};

	// In production, save to database
	// await db.scheduledEmails.create(scheduledEmail);
	console.log('📅 Scheduled email:', scheduledEmail);

	return scheduledEmail;
}

// Send scheduled email (called by cron job)
export async function sendScheduledEmail(scheduledEmail: any) {
	try {
		// Import template dynamically
		const { generateEmail } = await import(`./templates/${scheduledEmail.template}.js`);
		const { subject, html, text } = generateEmail(scheduledEmail.email);

		const result = await sendEmail({
			to: scheduledEmail.email,
			subject,
			html,
			text
		});

		if (result.success) {
			// Mark as sent in database
			console.log(`✅ Sent ${scheduledEmail.template} to ${scheduledEmail.email}`);
			return { success: true, emailId: result.id };
		} else {
			console.error(`❌ Failed to send ${scheduledEmail.template} to ${scheduledEmail.email}`);
			return { success: false, error: result.error };
		}
	} catch (error) {
		console.error('❌ Error sending scheduled email:', error);
		return { success: false, error };
	}
}