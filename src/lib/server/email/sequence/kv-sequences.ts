// src/lib/server/email/kv-sequences.ts
// Simple email sequences using Vercel KV (no database needed!)

import { kv } from '@vercel/kv';

interface ScheduledEmail {
	id: string;
	email: string;
	sequenceName: string;
	emailIndex: number;
	sendAt: string;
	status: 'scheduled' | 'sent' | 'failed';
	template: string;
	subject: string;
}

// Start a user's email sequence
export async function startEmailSequence(email: string, sequenceName: string = 'welcome') {
	const now = new Date();
	const sequences = getSequences();
	const sequence = sequences[sequenceName];

	if (!sequence) {
		throw new Error(`Unknown sequence: ${sequenceName}`);
	}

	// Schedule all emails in the sequence
	const scheduledEmails = [];

	for (let i = 0; i < sequence.emails.length; i++) {
		const emailConfig = sequence.emails[i];
		const sendAt = new Date(now.getTime() + emailConfig.delay * 60 * 60 * 1000);

		const scheduledEmail: ScheduledEmail = {
			id: `${email}-${sequenceName}-${i}-${Date.now()}`,
			email,
			sequenceName,
			emailIndex: i,
			sendAt: sendAt.toISOString(),
			status: 'scheduled',
			template: emailConfig.template,
			subject: emailConfig.subject
		};

		// Store in Vercel KV
		await kv.set(`scheduled:${scheduledEmail.id}`, scheduledEmail);

		// Add to time-based index for efficient querying
		const timeKey = `time:${sendAt.toISOString().slice(0, 13)}`; // Hour-based key
		await kv.sadd(timeKey, scheduledEmail.id);
		await kv.expire(timeKey, 60 * 60 * 24 * 7); // Expire after 1 week

		scheduledEmails.push(scheduledEmail);
	}

	console.log(`📅 Scheduled ${scheduledEmails.length} emails for ${email} in ${sequenceName} sequence`);
	return scheduledEmails;
}

// Get emails that should be sent now
export async function getEmailsToSend(): Promise<ScheduledEmail[]> {
	const now = new Date();
	const emailsToSend: ScheduledEmail[] = [];

	// Check the last 2 hours for any emails we should send
	for (let i = 0; i <= 2; i++) {
		const checkTime = new Date(now.getTime() - i * 60 * 60 * 1000);
		const timeKey = `time:${checkTime.toISOString().slice(0, 13)}`;

		const emailIds = await kv.smembers(timeKey);

		for (const emailId of emailIds) {
			if (typeof emailId === 'string') {
				const scheduledEmail = await kv.get<ScheduledEmail>(`scheduled:${emailId}`);

				if (scheduledEmail &&
					scheduledEmail.status === 'scheduled' &&
					new Date(scheduledEmail.sendAt) <= now) {
					emailsToSend.push(scheduledEmail);
				}
			}
		}
	}

	return emailsToSend;
}

// Mark email as sent
export async function markEmailAsSent(emailId: string, success: boolean) {
	const scheduledEmail = await kv.get<ScheduledEmail>(`scheduled:${emailId}`);

	if (scheduledEmail) {
		scheduledEmail.status = success ? 'sent' : 'failed';
		await kv.set(`scheduled:${emailId}`, scheduledEmail);

		// Remove from time index if sent successfully
		if (success) {
			const sendTime = new Date(scheduledEmail.sendAt);
			const timeKey = `time:${sendTime.toISOString().slice(0, 13)}`;
			await kv.srem(timeKey, emailId);
		}
	}
}

// Get user's email history (for debugging)
export async function getUserEmailHistory(email: string): Promise<ScheduledEmail[]> {
	// This is inefficient for large scale, but fine for debugging
	// In production, you'd want to maintain user-specific indexes
	const pattern = `scheduled:${email}-*`;
	const keys = await kv.keys(pattern);

	const emails = [];
	for (const key of keys) {
		const email = await kv.get<ScheduledEmail>(key);
		if (email) emails.push(email);
	}

	return emails.sort((a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime());
}

// Sequence definitions (same as before)
function getSequences() {
	return {
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
}