// scripts/seed-elements.ts - FIXED VERSION
import { adminFirestore } from '../../src/lib/server/firebase-admin.js';

// Import existing elements as fallback reference
let existingElements = {};
try {
	const { elementsDb } = await import('../../src/lib/data/addon/elements.js');
	existingElements = elementsDb;
	console.log(`📦 Found ${Object.keys(existingElements).length} existing elements to migrate`);
} catch (e) {
	console.log('📦 No existing elements found, using comprehensive seed data');
}

// Comprehensive elements data - includes your existing ones plus more
const elementsData = [
	// ===== CONTAINERS =====
	{
		id: 'container-center',
		category: 'containers',
		description: 'Centered container for content sections',
		metadata: {
			supports: { darkMode: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 1
	},
	{
		id: 'background-empty',
		category: 'containers',
		description: 'Full width empty container for layouts',
		metadata: {
			supports: { darkMode: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 2
	},
	{
		id: 'background-color',
		category: 'containers',
		description: 'Full width colored background section',
		metadata: {
			supports: { darkMode: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 3
	},

	// ===== CONTENT =====
	{
		id: 'hero',
		category: 'content',
		description: 'Hero section with heading and subtext',
		text: {
			h1: 'Main Heading',
			p: 'Supporting text that explains more details about the heading above.'
		},
		metadata: {
			supports: { darkMode: true, customText: true },
			tier: 'free'
		},
		displayOrder: 4
	},
	{
		id: 'zz-left',
		category: 'content',
		description: 'Content layout with left-aligned zigzag pattern',
		text: {
			h2: 'Zigzag Left',
			p: 'Content paragraph with 10-45 words explaining the feature or benefit.'
		},
		metadata: {
			cols: 3,
			rows: 1,
			supports: { darkMode: true, customText: true },
			tier: 'free'
		},
		displayOrder: 5
	},
	{
		id: 'zz-right',
		category: 'content',
		description: 'Content layout with right-aligned zigzag pattern',
		text: {
			h2: 'Zigzag Right',
			p: 'Content paragraph with 10-40 words highlighting key information.'
		},
		metadata: {
			cols: 3,
			rows: 1,
			supports: { darkMode: true, customText: true },
			tier: 'trial'
		},
		displayOrder: 6
	},
	// ===== BLURBS =====
	{
		id: 'blurbs-3',
		category: 'blurbs',
		description: 'Three horizontal feature blurbs',
		metadata: {
			cols: 3,
			supports: { darkMode: true, customText: true },
			tier: 'free'
		},
		displayOrder: 7
	},
	{
		id: 'blurbs-4',
		category: 'blurbs',
		description: 'Four horizontal benefit blurbs',
		metadata: {
			cols: 4,
			supports: { darkMode: true, customText: true },
			tier: 'trial'
		},
		displayOrder: 8
	},
	{
		id: 'blurbs-vertical-3',
		category: 'blurbs',
		description: 'Three vertical stacked blurbs for storytelling',
		metadata: {
			rows: 3,
			supports: { darkMode: true, customText: true },
			tier: 'pro'
		},
		displayOrder: 9
	},

	// ===== LISTS =====
	{
		id: 'list-1',
		category: 'lists',
		description: 'Single column list for features or benefits',
		metadata: {
			cols: 1,
			supports: { darkMode: true, customText: true },
			tier: 'free'
		},
		displayOrder: 10
	},
	{
		id: 'list-3',
		category: 'lists',
		description: '2x2 grid list layout for organized content',
		metadata: {
			cols: 2,
			rows: 2,
			supports: { darkMode: true, customText: true },
			tier: 'pro'
		},
		displayOrder: 11
	},
	{
		id: 'list-2',
		category: 'lists',
		description: 'Two column list for comparison or features',
		metadata: {
			cols: 2,
			supports: { darkMode: true, customText: true },
			tier: 'pro'
		},
		displayOrder: 12
	},

	// ===== BUTTONS =====
	{
		id: 'button-primary-left',
		category: 'buttons',
		description: 'Left-aligned primary call-to-action button',
		text: { cta: 'Get Started' },
		metadata: {
			variant: 'primary',
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 13
	},
	{
		id: 'button-secondary-left',
		category: 'buttons',
		description: 'Left-aligned secondary outline button',
		text: { cta: 'Learn More' },
		metadata: {
			variant: 'secondary',
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 14
	},
	{
		id: 'buttons-2-left',
		category: 'buttons',
		description: 'Two buttons side by side, left-aligned',
		text: { cta: 'Primary Action' },
		metadata: {
			cols: 2,
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 15
	},
	{
		id: 'button-primary-center',
		category: 'buttons',
		description: 'Center-aligned primary action button',
		text: { cta: 'Sign Up Now' },
		metadata: {
			variant: 'primary',
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'pro'
		},
		displayOrder: 16
	},
	{
		id: 'button-secondary-center',
		category: 'buttons',
		description: 'Center-aligned secondary outline button',
		text: { cta: 'Learn More' },
		metadata: {
			variant: 'secondary',
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'pro'
		},
		displayOrder: 17
	},
	{
		id: 'buttons-2-center',
		category: 'buttons',
		description: 'Two center-aligned buttons for balanced CTAs',
		text: { cta: 'Start Free Trial' },
		metadata: {
			cols: 2,
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'pro'
		},
		displayOrder: 18
	},

	// ===== CARDS =====
	{
		id: 'cards-2',
		category: 'cards',
		description: 'Two feature cards side by side',
		metadata: {
			cols: 2,
			supports: { darkMode: true, customText: true },
			tier: 'free'
		},
		displayOrder: 19
	},
	{
		id: 'cards-3',
		category: 'cards',
		description: 'Three feature cards in a row',
		metadata: {
			cols: 3,
			supports: { darkMode: true, customText: true },
			tier: 'free'
		},
		displayOrder: 20
	},
	{
		id: 'cards-4',
		category: 'cards',
		description: 'Four feature cards for comprehensive layouts',
		metadata: {
			cols: 4,
			supports: { darkMode: true, customText: true },
			tier: 'pro'
		},
		displayOrder: 21
	},
	{
		id: 'cards-2x2',
		category: 'cards',
		description: '2x2 grid of cards for service offerings',
		metadata: {
			cols: 2,
			rows: 2,
			supports: { darkMode: true, customText: true },
			tier: 'pro'
		},
		displayOrder: 22
	},
	{
		id: 'cards-6',
		category: 'cards',
		description: 'Six cards in a 3x2 grid layout',
		metadata: {
			cols: 3,
			rows: 2,
			supports: { darkMode: true, customText: true },
			tier: 'pro'
		},
		displayOrder: 23
	},
	{
		id: 'pricing-2',
		category: 'cards',
		description: 'Two pricing comparison cards',
		metadata: {
			cols: 2,
			variant: 'pricing',
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'pro'
		},
		displayOrder: 24
	}

	// ===== SPECIAL =====
	// {
	// 	id: 'styleguide',
	// 	category: 'special',
	// 	description: 'Typography and style guide reference',
	// 	metadata: {
	// 		supports: { darkMode: false },
	// 		tier: 'free'
	// 	},
	// 	displayOrder: 25
	// }
];

// Merge with existing elements if they exist
if (Object.keys(existingElements).length > 0) {
	console.log('🔄 Merging with existing elements...');

	// Add any existing elements that aren't in our seed data
	Object.entries(existingElements).forEach(([id, element]) => {
		if (!elementsData.find((e) => e.id === id)) {
			// Add displayOrder for existing elements that don't have one
			const elementWithOrder = {
				...element,
				displayOrder: element.displayOrder || elementsData.length + 1
			};
			elementsData.push(elementWithOrder);
			console.log(`   + Added existing element: ${id}`);
		}
	});
}

async function seedElements() {
	console.log('🌱 Seeding elements to Firestore...');

	const batch = adminFirestore.batch();
	let totalSeeded = 0;
	const tierCounts = { free: 0, trial: 0, pro: 0 };
	const categoryCounts: Record<string, number> = {};

	// FIXED: Add index parameter to forEach
	elementsData.forEach((element, index) => {
		const elementRef = adminFirestore.collection('elements').doc(element.id);

		const firestoreElement = {
			...element,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			// FIXED: Now index is available, but also provide better fallback
			displayOrder: element.displayOrder ?? index + 1,

			// Add computed search-friendly fields
			searchTerms: [
				element.id,
				element.description.toLowerCase(),
				element.category.toLowerCase(),
				...(element.text ? Object.values(element.text).map((t) => String(t).toLowerCase()) : [])
			].filter(Boolean),

			// Add SVG paths for easy access
			svgPath: `/elements/${element.id}.svg`,
			svgPathDark: element.metadata?.supports?.darkMode ? `/elements/${element.id}-dark.svg` : null
		};

		batch.set(elementRef, firestoreElement);

		// Count stats
		totalSeeded++;
		const tier = element.metadata?.tier || 'free';
		tierCounts[tier]++;
		categoryCounts[element.category] = (categoryCounts[element.category] || 0) + 1;
	});

	try {
		await batch.commit();

		console.log(`✅ Successfully seeded ${totalSeeded} elements`);
		console.log(`   📊 Tier breakdown:`, tierCounts);
		console.log(`   📂 Categories:`, categoryCounts);
		console.log(
			`   🎨 Elements with dark mode: ${elementsData.filter((e) => e.metadata?.supports?.darkMode).length}`
		);

		return true;
	} catch (error) {
		console.error('❌ Error seeding elements:', error);
		return false;
	}
}

async function createElementsAnalytics() {
	console.log('📊 Creating elements analytics...');

	const totalElements = elementsData.length;
	const tierBreakdown = elementsData.reduce(
		(acc, el) => {
			const tier = el.metadata?.tier || 'free';
			acc[tier] = (acc[tier] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const categoryBreakdown = elementsData.reduce(
		(acc, el) => {
			acc[el.category] = (acc[el.category] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const analyticsData = {
		totalElements,
		tierBreakdown,
		categoryBreakdown,
		elementsWithDarkMode: elementsData.filter((e) => e.metadata?.supports?.darkMode).length,
		elementsWithCustomText: elementsData.filter((e) => e.metadata?.supports?.customText).length,
		elementsWithCustomColors: elementsData.filter((e) => e.metadata?.supports?.customColors).length,
		lastUpdated: new Date(),
		version: '2.0'
	};

	try {
		await adminFirestore.collection('elements').doc('_analytics').set(analyticsData);
		console.log('✅ Elements analytics created');
		console.log(
			`   📈 Total: ${totalElements} elements across ${Object.keys(categoryBreakdown).length} categories`
		);
		return true;
	} catch (error) {
		console.error('❌ Error creating analytics:', error);
		return false;
	}
}

async function main() {
	console.log('🚀 Starting elements seeding...');
	console.log('');

	const success1 = await seedElements();
	console.log('');

	const success2 = await createElementsAnalytics();
	console.log('');

	if (success1 && success2) {
		console.log('🎉 Elements seeding completed successfully!');
		console.log('');
		console.log('👀 View elements in Firestore console:');
		console.log('   http://localhost:4000/firestore/data/elements');
		console.log('');
		console.log('🧪 Test the new system in your app at:');
		console.log('   http://localhost:5173/addon');
		console.log('');
		console.log("🔥 Don't forget to set up firestore.rules for security!");
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

export { seedElements, createElementsAnalytics };
