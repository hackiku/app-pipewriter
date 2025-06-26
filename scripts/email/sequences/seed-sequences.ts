// scripts/email/sequences/seed-sequences.ts - Following your pattern
import { adminFirestore } from '../../../src/lib/server/firebase-admin.ts';

const emailSequencesData = [
	{
		id: 'welcome-sequence',
		name: 'Welcome Series',
		description: '3-email onboarding sequence for new Pipewriter users',

		emails: [
			{
				templateId: 'welcome',
				delayHours: 0,
				name: 'Welcome Email',
				description: 'Immediate welcome with meta copywriting angle'
			},
			{
				templateId: 'tutorial',
				delayHours: 24,
				name: 'Tutorial Email',
				description: 'Step-by-step wireframing walkthrough'
			},
			{
				templateId: 'upgrade',
				delayHours: 72,
				name: 'Social Proof & Upgrade',
				description: 'Sarah case study + trial CTA'
			}
		],

		// Trigger conditions
		triggers: ['user_signup', 'email_subscribe'],

		// Target audience
		targetAudience: {
			userTiers: ['free', 'trial'], // Don't send to pro users
			sources: ['website', 'addon-about', 'google-marketplace']
		},

		// Business metrics
		expectedConversionRate: 0.25, // 25% trial signup rate
		estimatedValue: 120, // $10/month * 12 months

		// Your established patterns
		active: true,
		metadata: {
			tier: 'system',
			tags: ['onboarding', 'conversion', 'trial'],
			category: 'onboarding',
			version: '1.0'
		},

		createdAt: new Date(),
		updatedAt: new Date()
	},

	// Future sequence (for when you add more)
	{
		id: 'trial-ending-sequence',
		name: 'Trial Ending Series',
		description: '2-email sequence for users whose trial is expiring',

		emails: [
			{
				templateId: 'trial-ending',
				delayHours: 0, // 14 days after trial start
				name: 'Trial Ending',
				description: 'Trial ends tomorrow, upgrade urgency'
			},
			{
				templateId: 'trial-ended',
				delayHours: 24, // 15 days after trial start
				name: 'Trial Ended',
				description: 'Trial ended, last chance discount'
			}
		],

		triggers: ['trial_day_13'], // 13 days after trial start

		targetAudience: {
			userTiers: ['trial'],
			sources: ['all']
		},

		expectedConversionRate: 0.30, // 30% trial to paid conversion
		estimatedValue: 120,

		active: false, // Not ready yet - missing templates
		metadata: {
			tier: 'system',
			tags: ['trial', 'conversion', 'urgency'],
			category: 'trial-conversion',
			version: '1.0'
		},

		createdAt: new Date(),
		updatedAt: new Date()
	}
];

/**
 * Seed email sequences to Firestore (environment agnostic)
 */
export async function seedEmailSequences(): Promise<boolean> {
	console.log('📅 Seeding email sequences to Firestore...');

	try {
		const batch = adminFirestore.batch();
		let totalSeeded = 0;
		let activeSequences = 0;
		const categoryCount: Record<string, number> = {};

		emailSequencesData.forEach((sequence) => {
			// Store in email/sequences subcollection
			const sequenceRef = adminFirestore
				.collection('email')
				.doc('sequences')
				.collection('items')
				.doc(sequence.id);

			const firestoreSequence = {
				...sequence,
				// Add computed fields
				totalEmails: sequence.emails.length,
				maxDelayHours: Math.max(...sequence.emails.map(e => e.delayHours)),

				// Search terms
				searchTerms: [
					sequence.id.toLowerCase(),
					sequence.name.toLowerCase(),
					sequence.description.toLowerCase(),
					sequence.metadata.category.toLowerCase(),
					...(sequence.metadata.tags || []),
					...sequence.emails.map(e => e.templateId)
				].filter(Boolean),

				// Ensure dates
				createdAt: new Date(),
				updatedAt: new Date()
			};

			batch.set(sequenceRef, firestoreSequence);

			// Count stats
			totalSeeded++;
			if (sequence.active) activeSequences++;

			const category = sequence.metadata.category;
			categoryCount[category] = (categoryCount[category] || 0) + 1;
		});

		await batch.commit();

		console.log(`✅ Successfully seeded ${totalSeeded} email sequences`);
		console.log(`   🟢 Active sequences: ${activeSequences}`);
		console.log(`   📂 Categories:`, categoryCount);
		console.log(`   📅 Sequences: ${emailSequencesData.map(s => s.id).join(', ')}`);

		// Create analytics document
		await createSequencesAnalytics();

		return true;
	} catch (error) {
		console.error('❌ Error seeding email sequences:', error);
		return false;
	}
}

/**
 * Create email sequences analytics document
 */
async function createSequencesAnalytics(): Promise<boolean> {
	try {
		const totalSequences = emailSequencesData.length;
		const activeSequences = emailSequencesData.filter(s => s.active).length;
		const totalEmails = emailSequencesData.reduce((sum, seq) => sum + seq.emails.length, 0);

		const categoryBreakdown = emailSequencesData.reduce(
			(acc, seq) => {
				const category = seq.metadata.category;
				acc[category] = (acc[category] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		const analyticsData = {
			totalSequences,
			activeSequences,
			inactiveSequences: totalSequences - activeSequences,
			totalEmailsInAllSequences: totalEmails,
			categoryBreakdown,
			averageEmailsPerSequence: Math.round(totalEmails / totalSequences * 100) / 100,
			lastUpdated: new Date(),
			version: '1.0'
		};

		await adminFirestore
			.collection('email')
			.doc('sequences')
			.collection('_meta')
			.doc('analytics')
			.set(analyticsData);

		console.log('✅ Email sequences analytics created');

		return true;
	} catch (error) {
		console.error('❌ Error creating sequences analytics:', error);
		return false;
	}
}