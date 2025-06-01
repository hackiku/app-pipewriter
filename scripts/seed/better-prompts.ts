// scripts/seed/better-prompts.ts - Professional prompts for writers
import { adminFirestore } from '../../src/lib/server/firebase-admin.js';

/**
 * PROFESSIONAL PROMPTS LIBRARY
 * Curated for UX writers, copywriters, and content creators
 * Based on real-world writing needs and best practices
 */
const professionalPrompts = [
	// ===== WRITING ESSENTIALS =====
	{
		id: 'polish-clarity',
		category: 'writing',
		title: 'Polish for Clarity',
		description: 'Improve clarity and readability while maintaining meaning',
		content:
			'Rewrite this text to be clearer and more readable. Remove jargon, simplify complex sentences, and ensure the core message comes through immediately. Keep the same length and tone.',
		metadata: {
			tier: 'free',
			tags: ['clarity', 'readability', 'polish'],
			usage: 0
		}
	},
	{
		id: 'executive-brief',
		category: 'writing',
		title: 'Executive Brief',
		description: 'Transform into executive summary with key points',
		content:
			'Convert this content into an executive brief. Lead with the most important takeaway, then add 3-5 bullet points covering key decisions, actions needed, and impact. Keep it under 150 words.',
		metadata: {
			tier: 'free',
			tags: ['executive', 'summary', 'brief'],
			usage: 0
		}
	},
	{
		id: 'user-focused',
		category: 'writing',
		title: 'User-Focused Rewrite',
		description: "Rewrite from the user's perspective and needs",
		content:
			'Rewrite this content from the user\'s perspective. Focus on what they need to know, what actions they should take, and what benefits they\'ll get. Use "you" language and action-oriented phrases.',
		metadata: {
			tier: 'trial',
			tags: ['user-centered', 'perspective', 'benefits'],
			usage: 0
		}
	},
	{
		id: 'tone-professional',
		category: 'writing',
		title: 'Professional Tone',
		description: 'Adjust to professional, confident tone',
		content:
			'Adjust this text to sound professional and confident without being stuffy. Use clear, direct language that builds trust and authority. Remove any uncertain phrases like "maybe" or "perhaps".',
		metadata: {
			tier: 'trial',
			tags: ['professional', 'confidence', 'authority'],
			usage: 0
		}
	},
	{
		id: 'concise-impact',
		category: 'writing',
		title: 'Cut to Impact',
		description: 'Make more concise while increasing impact',
		content:
			'Cut this text by 30-40% while making it more impactful. Remove filler words, combine ideas, and lead with the strongest points. Every sentence should add value.',
		metadata: {
			tier: 'pro',
			tags: ['concise', 'impact', 'efficiency'],
			usage: 0
		}
	},

	// ===== UX/UI WRITING =====
	{
		id: 'microcopy-friendly',
		category: 'ux',
		title: 'Friendly Microcopy',
		description: 'Convert to friendly, helpful interface text',
		content:
			'Turn this into friendly, helpful microcopy for a user interface. Use conversational tone, anticipate user concerns, and guide them clearly through their next steps.',
		metadata: {
			tier: 'free',
			tags: ['microcopy', 'ui', 'friendly'],
			usage: 0
		}
	},
	{
		id: 'error-helpful',
		category: 'ux',
		title: 'Helpful Error Message',
		description: 'Create clear, actionable error message',
		content:
			'Transform this into a helpful error message. Explain what went wrong in plain language, why it happened, and give the user clear steps to fix it. Be empathetic, not technical.',
		metadata: {
			tier: 'free',
			tags: ['error', 'helpful', 'actionable'],
			usage: 0
		}
	},
	{
		id: 'onboarding-flow',
		category: 'ux',
		title: 'Onboarding Copy',
		description: 'Create encouraging onboarding flow text',
		content:
			'Write onboarding copy that encourages users and reduces anxiety. Explain the value at each step, use progress indicators, and celebrate small wins. Keep it motivating.',
		metadata: {
			tier: 'trial',
			tags: ['onboarding', 'encouraging', 'progress'],
			usage: 0
		}
	},
	{
		id: 'empty-states',
		category: 'ux',
		title: 'Engaging Empty State',
		description: 'Write compelling empty state copy',
		content:
			'Create engaging empty state copy that motivates action. Explain what this space will contain when populated, and provide a clear, encouraging call-to-action to get started.',
		metadata: {
			tier: 'pro',
			tags: ['empty-state', 'motivation', 'action'],
			usage: 0
		}
	},

	// ===== MARKETING & CONVERSION =====
	{
		id: 'value-proposition',
		category: 'marketing',
		title: 'Clear Value Prop',
		description: 'Craft clear, compelling value proposition',
		content:
			'Transform this into a clear value proposition. Lead with the main benefit, explain what makes it unique, and make it immediately clear why someone should care. Use specific, concrete language.',
		metadata: {
			tier: 'free',
			tags: ['value-prop', 'benefits', 'unique'],
			usage: 0
		}
	},
	{
		id: 'cta-compelling',
		category: 'marketing',
		title: 'Compelling CTA',
		description: 'Write action-driving call-to-action',
		content:
			"Create a compelling call-to-action that drives action. Use action verbs, create urgency or excitement, and make the value clear. Consider the user's mindset at this moment.",
		metadata: {
			tier: 'trial',
			tags: ['cta', 'action', 'urgency'],
			usage: 0
		}
	},
	{
		id: 'social-proof',
		category: 'marketing',
		title: 'Add Social Proof',
		description: 'Incorporate credible social proof elements',
		content:
			'Enhance this content with social proof. Add credible testimonials, usage statistics, customer names, or other trust signals that make people more likely to believe and act.',
		metadata: {
			tier: 'pro',
			tags: ['social-proof', 'trust', 'credibility'],
			usage: 0
		}
	},
	{
		id: 'objection-handling',
		category: 'marketing',
		title: 'Handle Objections',
		description: 'Address common concerns and objections',
		content:
			'Rewrite this to address common objections and concerns. Anticipate what readers might worry about and provide reassuring, specific responses that build confidence.',
		metadata: {
			tier: 'pro',
			tags: ['objections', 'concerns', 'reassurance'],
			usage: 0
		}
	},

	// ===== STRUCTURE & FORMAT =====
	{
		id: 'scannable-format',
		category: 'structure',
		title: 'Scannable Format',
		description: 'Format for easy scanning and reading',
		content:
			'Restructure this content to be easily scannable. Use clear headings, bullet points, short paragraphs, and visual hierarchy. Busy readers should get the key points quickly.',
		metadata: {
			tier: 'free',
			tags: ['scannable', 'formatting', 'hierarchy'],
			usage: 0
		}
	},
	{
		id: 'story-structure',
		category: 'structure',
		title: 'Story Structure',
		description: 'Organize with narrative flow and engagement',
		content:
			'Reorganize this content with story structure. Create a compelling opening, build through challenges or problems, and resolve with clear outcomes. Make it engaging and memorable.',
		metadata: {
			tier: 'trial',
			tags: ['story', 'narrative', 'engagement'],
			usage: 0
		}
	},
	{
		id: 'progressive-disclosure',
		category: 'structure',
		title: 'Progressive Disclosure',
		description: 'Structure information in digestible layers',
		content:
			'Restructure this using progressive disclosure. Start with the essential information, then add layers of detail for those who want more. Use expandable sections or clear information hierarchy.',
		metadata: {
			tier: 'pro',
			tags: ['progressive', 'disclosure', 'layers'],
			usage: 0
		}
	},

	// ===== TECHNICAL/CODE =====
	{
		id: 'clean-html',
		category: 'technical',
		title: 'Clean HTML',
		description: 'Convert to semantic, accessible HTML',
		content:
			'Convert this content to clean, semantic HTML. Use proper heading hierarchy (h1, h2, h3), meaningful tags like <article>, <section>, <aside>, and ensure accessibility with proper ARIA labels.',
		metadata: {
			tier: 'free',
			tags: ['html', 'semantic', 'accessibility'],
			usage: 0
		}
	},
	{
		id: 'api-documentation',
		category: 'technical',
		title: 'API Documentation',
		description: 'Format as clear API documentation',
		content:
			'Structure this as clear API documentation. Include endpoint description, parameters with types, example requests/responses, error codes, and usage notes. Make it developer-friendly.',
		metadata: {
			tier: 'pro',
			tags: ['api', 'documentation', 'technical'],
			usage: 0
		}
	}
];

async function seedBetterPrompts() {
	console.log('🌱 Seeding professional prompts library...');

	const batch = adminFirestore.batch();
	let totalSeeded = 0;
	const tierCounts = { free: 0, trial: 0, pro: 0 };
	const categoryCounts: Record<string, number> = {};

	professionalPrompts.forEach((prompt) => {
		const promptRef = adminFirestore.collection('prompts').doc(prompt.id);

		const firestorePrompt = {
			...prompt,
			active: true,
			isSystem: true, // Mark as system prompt
			createdAt: new Date(),
			updatedAt: new Date(),
			version: '2.0',

			// Add computed search-friendly fields
			searchTerms: [
				prompt.id,
				prompt.title.toLowerCase(),
				prompt.description.toLowerCase(),
				prompt.category.toLowerCase(),
				...(prompt.metadata?.tags || [])
			].filter(Boolean)
		};

		batch.set(promptRef, firestorePrompt);

		// Count stats
		totalSeeded++;
		const tier = prompt.metadata?.tier || 'free';
		tierCounts[tier]++;
		categoryCounts[prompt.category] = (categoryCounts[prompt.category] || 0) + 1;
	});

	try {
		await batch.commit();

		console.log(`✅ Successfully seeded ${totalSeeded} professional prompts`);
		console.log(`   📊 Tier breakdown:`, tierCounts);
		console.log(`   📂 Categories:`, categoryCounts);

		return true;
	} catch (error) {
		console.error('❌ Error seeding prompts:', error);
		return false;
	}
}

async function createPromptsAnalytics() {
	console.log('📊 Creating prompts analytics...');

	const totalPrompts = professionalPrompts.length;
	const tierBreakdown = professionalPrompts.reduce(
		(acc, prompt) => {
			const tier = prompt.metadata?.tier || 'free';
			acc[tier] = (acc[tier] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const categoryBreakdown = professionalPrompts.reduce(
		(acc, prompt) => {
			acc[prompt.category] = (acc[prompt.category] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const analyticsData = {
		totalPrompts,
		tierBreakdown,
		categoryBreakdown,
		lastUpdated: new Date(),
		version: '2.0',
		description: 'Professional prompts library for writers and content creators'
	};

	try {
		await adminFirestore.collection('prompts').doc('_analytics').set(analyticsData);
		console.log('✅ Prompts analytics created');
		console.log(
			`   📈 Total: ${totalPrompts} prompts across ${Object.keys(categoryBreakdown).length} categories`
		);
		return true;
	} catch (error) {
		console.error('❌ Error creating analytics:', error);
		return false;
	}
}

async function main() {
	console.log('🚀 Starting professional prompts seeding...');
	console.log('');

	const success1 = await seedBetterPrompts();
	console.log('');

	const success2 = await createPromptsAnalytics();
	console.log('');

	if (success1 && success2) {
		console.log('🎉 Professional prompts library ready!');
		console.log('');
		console.log('📚 Categories created:');
		console.log('   📝 Writing: Core writing improvement prompts');
		console.log('   🎨 UX: User experience and interface copy');
		console.log('   📈 Marketing: Value props, CTAs, and conversion');
		console.log('   📋 Structure: Content organization and formatting');
		console.log('   ⚙️  Technical: HTML, API docs, and code');
		console.log('');
		console.log('👀 View in Firestore: http://localhost:4000/firestore/data/prompts');
	} else {
		console.log('💥 Seeding failed - check errors above');
		process.exit(1);
	}

	process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error('💥 Fatal error:', error);
		process.exit(1);
	});
}

export { seedBetterPrompts, createPromptsAnalytics };
