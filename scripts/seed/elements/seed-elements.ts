// scripts/seed/elements/seed-elements.ts - CAMELCASE VERSION

import { adminFirestore } from '../../../src/lib/server/firebase-admin.ts';



const elementsData = [
	// ===== CONTAINERS =====
	{
		id: 'containerCenter',
		category: 'containers',
		description: 'Centered container for content sections',
		metadata: {
			supports: { darkMode: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 1
	},
	{
		id: 'backgroundEmpty',
		category: 'containers',
		description: 'Full width empty container for layouts',
		metadata: {
			supports: { darkMode: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 2
	},
	{
		id: 'backgroundColor',
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
		id: 'zigzagLeft',
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
		id: 'zigzagRight',
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
			tier: 'free'
		},
		displayOrder: 6
	},

	// ===== BLURBS =====
	{
		id: 'blurbs3',
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
		id: 'blurbs4',
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
		id: 'blurbsVertical3',
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
		id: 'list1',
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
		id: 'list2',
		category: 'lists',
		description: 'Two column list for comparison or features',
		metadata: {
			cols: 2,
			supports: { darkMode: true, customText: true },
			tier: 'trial'
		},
		displayOrder: 11
	},
	{
		id: 'list3',
		category: 'lists',
		description: '2x2 grid list layout for organized content',
		metadata: {
			cols: 2,
			rows: 2,
			supports: { darkMode: true, customText: true },
			tier: 'pro'
		},
		displayOrder: 12
	},

	// ===== BUTTONS =====
	{
		id: 'buttonPrimaryLeft',
		category: 'buttons',
		description: 'Primary call-to-action button',
		text: { cta: 'Get Started' },
		metadata: {
			variant: 'primary',
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 13
	},
	{
		id: 'buttonSecondaryLeft',
		category: 'buttons',
		description: 'Secondary outline button',
		text: { cta: 'Learn More' },
		metadata: {
			variant: 'secondary',
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 14
	},
	{
		id: 'buttons2Left',
		category: 'buttons',
		description: 'Two buttons side by side, left',
		text: { cta: 'Primary Action' },
		metadata: {
			cols: 2,
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'free'
		},
		displayOrder: 15
	},

	// ===== CARDS =====
	{
		id: 'cards2',
		category: 'cards',
		description: 'Two feature cards side by side',
		metadata: {
			cols: 2,
			supports: { darkMode: true, customText: true },
			tier: 'free'
		},
		displayOrder: 16
	},
	{
		id: 'cards3',
		category: 'cards',
		description: 'Three feature cards in a row',
		metadata: {
			cols: 3,
			supports: { darkMode: true, customText: true },
			tier: 'free'
		},
		displayOrder: 17
	},
	{
		id: 'cards4',
		category: 'cards',
		description: 'Four feature cards for comprehensive layouts',
		metadata: {
			cols: 4,
			supports: { darkMode: true, customText: true },
			tier: 'trial'
		},
		displayOrder: 18
	},
	{
		id: 'cards2x2',
		category: 'cards',
		description: '2x2 grid of cards for service offerings',
		metadata: {
			cols: 2,
			rows: 2,
			supports: { darkMode: true, customText: true },
			tier: 'free'
		},
		displayOrder: 19
	},
	{
		id: 'cards6',
		category: 'cards',
		description: 'Six cards in a 3x2 grid layout',
		metadata: {
			cols: 3,
			rows: 2,
			supports: { darkMode: true, customText: true },
			tier: 'pro'
		},
		displayOrder: 20
	},
	{
		id: 'pricing2',
		category: 'cards',
		description: 'Two pricing comparison cards',
		metadata: {
			cols: 2,
			variant: 'pricing',
			supports: { darkMode: true, customText: true, customColors: true },
			tier: 'pro'
		},
		displayOrder: 21
	}
];



// Merge with existing elements if they exist
// if (Object.keys(existingElements).length > 0) {
// 	console.log('🔄 Merging with existing elements...');

// 	// Add any existing elements that aren't in our seed data
// 	Object.entries(existingElements).forEach(([id, element]) => {
// 		if (!elementsData.find((e) => e.id === id)) {
// 			// Add displayOrder for existing elements that don't have one
// 			const elementWithOrder = {
// 				...element,
// 				displayOrder: element.displayOrder || elementsData.length + 1
// 			};
// 			elementsData.push(elementWithOrder);
// 			console.log(`   + Added existing element: ${id}`);
// 		}
// 	});
// }

/**
 * Seed elements to Firestore (environment agnostic)
 * Uses whatever firebase-admin.ts is configured for
 */
export async function seedElements(): Promise<boolean> {
	console.log('🌱 Seeding elements to Firestore...');

	try {
		const batch = adminFirestore.batch();
		let totalSeeded = 0;
		const tierCounts = { free: 0, trial: 0, pro: 0 };
		const categoryCounts: Record<string, number> = {};

		elementsData.forEach((element, index) => {
			const elementRef = adminFirestore.collection('elements').doc(element.id);

			const firestoreElement = {
				...element,
				active: true,
				createdAt: new Date(),
				updatedAt: new Date(),
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
				svgPathDark: element.metadata?.supports?.darkMode
					? `/elements/${element.id}-dark.svg`
					: null
			};

			batch.set(elementRef, firestoreElement);

			// Count stats
			totalSeeded++;
			const tier = element.metadata?.tier || 'free';
			tierCounts[tier]++;
			categoryCounts[element.category] = (categoryCounts[element.category] || 0) + 1;
		});

		await batch.commit();

		console.log(`✅ Successfully seeded ${totalSeeded} elements`);
		console.log(`   📊 Tier breakdown:`, tierCounts);
		console.log(`   📂 Categories:`, categoryCounts);
		console.log(
			`   🎨 Elements with dark mode: ${elementsData.filter((e) => e.metadata?.supports?.darkMode).length}`
		);

		// Create analytics document
		await createElementsAnalytics();

		return true;
	} catch (error) {
		console.error('❌ Error seeding elements:', error);
		return false;
	}
}

/**
 * Create elements analytics document
 */
async function createElementsAnalytics(): Promise<boolean> {
	try {
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
			elementsWithCustomColors: elementsData.filter((e) => e.metadata?.supports?.customColors)
				.length,
			lastUpdated: new Date(),
			version: '2.0'
		};

		await adminFirestore.collection('elements').doc('_analytics').set(analyticsData);
		console.log('✅ Elements analytics created');

		return true;
	} catch (error) {
		console.error('❌ Error creating analytics:', error);
		return false;
	}
}
