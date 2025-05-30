// scripts/seed/seed-prompts.ts
import { adminFirestore } from '../../src/lib/server/firebase-admin.js';

// Comprehensive prompts data for writers and content creators
const promptsData = [
	// ===== WRITING =====
	{
		id: 'polish-copy',
		category: 'writing',
		title: 'Polish Copy',
		description: 'Improve clarity, tone and engagement while keeping the same meaning and length',
		content:
			'Please improve the clarity, tone and engagement of the selected text while maintaining the same core meaning and approximate length. Focus on making it more compelling and readable.',
		metadata: {
			tier: 'free',
			tags: ['polish', 'clarity', 'engagement'],
			usage: 0
		}
	},
	{
		id: 'executive-summary',
		category: 'writing',
		title: 'Executive Summary',
		description: 'Convert to executive summary with key points and clear structure',
		content:
			'Convert the selected text into a clear executive summary with bullet points highlighting the key takeaways, decisions, and action items. Keep it concise and actionable.',
		metadata: {
			tier: 'free',
			tags: ['summary', 'executive', 'structure'],
			usage: 0
		}
	},
	{
		id: 'expand-ideas',
		category: 'writing',
		title: 'Expand Ideas',
		description: 'Develop and elaborate on key concepts with examples and details',
		content:
			'Expand on the selected ideas by adding relevant examples, supporting details, and clear explanations. Make the concepts more comprehensive and easier to understand.',
		metadata: {
			tier: 'trial',
			tags: ['expand', 'elaborate', 'examples'],
			usage: 0
		}
	},
	{
		id: 'tone-adjustment',
		category: 'writing',
		title: 'Adjust Tone',
		description: 'Modify writing tone for different audiences (professional, casual, persuasive)',
		content:
			'Adjust the tone of the selected text to be more [specify: professional/casual/persuasive/friendly]. Maintain the core message while adapting the language and style for the target audience.',
		metadata: {
			tier: 'pro',
			tags: ['tone', 'audience', 'style'],
			usage: 0
		}
	},

	// ===== CODE =====
	{
		id: 'html-structure',
		category: 'code',
		title: 'HTML Structure',
		description: 'Convert to semantic HTML with proper heading hierarchy and tags',
		content:
			'Convert this content to clean, semantic HTML with proper heading hierarchy (h1, h2, h3) and appropriate tags like <p>, <ul>, <ol>, <strong>, <em>. Ensure accessibility and semantic meaning.',
		metadata: {
			tier: 'free',
			tags: ['html', 'semantic', 'structure'],
			usage: 0
		}
	},
	{
		id: 'clean-markup',
		category: 'code',
		title: 'Clean Markup',
		description: 'Strip formatting and convert to clean, minimal HTML structure',
		content:
			'Remove all unnecessary formatting and convert to clean, minimal HTML with just the essential semantic structure. Focus on content hierarchy and readability.',
		metadata: {
			tier: 'free',
			tags: ['cleanup', 'minimal', 'semantic'],
			usage: 0
		}
	},
	{
		id: 'markdown-conversion',
		category: 'code',
		title: 'Markdown Format',
		description: 'Convert content to clean Markdown with proper formatting',
		content:
			'Convert the selected content to clean Markdown format with proper headings (#, ##), lists (-, *), emphasis (**bold**, *italic*), and code blocks when appropriate.',
		metadata: {
			tier: 'trial',
			tags: ['markdown', 'formatting', 'conversion'],
			usage: 0
		}
	},
	{
		id: 'component-structure',
		category: 'code',
		title: 'Component Structure',
		description: 'Structure content as reusable component with props and documentation',
		content:
			'Structure this content as a reusable component with clear props, documentation, and modular design. Include usage examples and configuration options.',
		metadata: {
			tier: 'pro',
			tags: ['components', 'modular', 'documentation'],
			usage: 0
		}
	},

	// ===== DESIGN =====
	{
		id: 'content-sections',
		category: 'design',
		title: 'Content Sections',
		description: 'Organize into clear sections with headers and logical flow',
		content:
			'Reorganize this content into clear, logical sections with descriptive headers and improved information hierarchy. Ensure smooth flow between sections.',
		metadata: {
			tier: 'free',
			tags: ['sections', 'organization', 'hierarchy'],
			usage: 0
		}
	},
	{
		id: 'bullet-points',
		category: 'design',
		title: 'Scannable Lists',
		description: 'Convert to scannable bullet points and lists for better readability',
		content:
			'Convert this content into scannable bullet points and numbered lists that improve readability and comprehension. Use parallel structure and clear language.',
		metadata: {
			tier: 'free',
			tags: ['lists', 'scannable', 'readability'],
			usage: 0
		}
	},
	{
		id: 'visual-hierarchy',
		category: 'design',
		title: 'Visual Hierarchy',
		description: 'Improve content structure with clear headings and emphasis',
		content:
			'Improve the visual hierarchy of this content with clear headings, subheadings, and strategic use of emphasis. Make the structure immediately apparent to readers.',
		metadata: {
			tier: 'trial',
			tags: ['hierarchy', 'headings', 'emphasis'],
			usage: 0
		}
	},
	{
		id: 'layout-optimization',
		category: 'design',
		title: 'Layout Optimization',
		description: 'Optimize content layout for better user experience and engagement',
		content:
			'Optimize the layout and structure of this content for better user experience, engagement, and conversion. Consider spacing, grouping, and visual flow.',
		metadata: {
			tier: 'pro',
			tags: ['layout', 'ux', 'optimization'],
			usage: 0
		}
	},

	// ===== MARKETING =====
	{
		id: 'call-to-action',
		category: 'marketing',
		title: 'Strong CTA',
		description: 'Create compelling calls-to-action that drive engagement',
		content:
			'Transform this content into compelling calls-to-action that drive engagement and conversions. Use action-oriented language and clear value propositions.',
		metadata: {
			tier: 'trial',
			tags: ['cta', 'conversion', 'engagement'],
			usage: 0
		}
	},
	{
		id: 'benefit-focused',
		category: 'marketing',
		title: 'Benefit-Focused',
		description: 'Rewrite focusing on benefits and value for the reader',
		content:
			'Rewrite this content to focus on benefits and value for the reader. Transform features into benefits and make the value proposition clear and compelling.',
		metadata: {
			tier: 'trial',
			tags: ['benefits', 'value', 'persuasive'],
			usage: 0
		}
	},
	{
		id: 'social-proof',
		category: 'marketing',
		title: 'Add Social Proof',
		description: 'Incorporate social proof elements to build trust and credibility',
		content:
			'Enhance this content with social proof elements like testimonials, statistics, case studies, or endorsements to build trust and credibility with readers.',
		metadata: {
			tier: 'pro',
			tags: ['social-proof', 'trust', 'credibility'],
			usage: 0
		}
	},

	// ===== TECHNICAL =====
	{
		id: 'api-documentation',
		category: 'technical',
		title: 'API Documentation',
		description: 'Format as clear API documentation with examples and parameters',
		content:
			'Format this content as clear API documentation with endpoint descriptions, parameters, request/response examples, and error handling information.',
		metadata: {
			tier: 'pro',
			tags: ['api', 'documentation', 'technical'],
			usage: 0
		}
	},
	{
		id: 'troubleshooting-guide',
		category: 'technical',
		title: 'Troubleshooting Guide',
		description: 'Structure as step-by-step troubleshooting guide with solutions',
		content:
			'Structure this content as a clear troubleshooting guide with step-by-step instructions, common issues, solutions, and preventive measures.',
		metadata: {
			tier: 'pro',
			tags: ['troubleshooting', 'guide', 'solutions'],
			usage: 0
		}
	}
];

async function seedPrompts() {
	console.log('🌱 Seeding prompts to Firestore...');

	const batch = adminFirestore.batch();
	let totalSeeded = 0;
	const tierCounts = { free: 0, trial: 0, pro: 0 };
	const categoryCounts: Record<string, number> = {};

	promptsData.forEach((prompt) => {
		const promptRef = adminFirestore.collection('prompts').doc(prompt.id);

		const firestorePrompt = {
			...prompt,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),

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

		console.log(`✅ Successfully seeded ${totalSeeded} prompts`);
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

	const totalPrompts = promptsData.length;
	const tierBreakdown = promptsData.reduce(
		(acc, prompt) => {
			const tier = prompt.metadata?.tier || 'free';
			acc[tier] = (acc[tier] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const categoryBreakdown = promptsData.reduce(
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
		version: '1.0'
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
	console.log('🚀 Starting prompts seeding...');
	console.log('');

	const success1 = await seedPrompts();
	console.log('');

	const success2 = await createPromptsAnalytics();
	console.log('');

	if (success1 && success2) {
		console.log('🎉 Prompts seeding completed successfully!');
		console.log('');
		console.log('👀 View prompts in Firestore console:');
		console.log('   http://localhost:4000/firestore/data/prompts');
		console.log('');
		console.log('🧪 Test the new system in your app!');
		console.log('');
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

export { seedPrompts, createPromptsAnalytics };
