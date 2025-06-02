// scripts/seed/simple-prompts.ts - ULTRA SIMPLE
import { adminFirestore } from '../../src/lib/server/firebase-admin.js';

const simplePrompts = [
	// WRITING
	{
		id: 'clear-writing',
		category: 'writing',
		title: 'Make it Clear',
		content:
			'Rewrite this text to be clearer and easier to understand. Remove jargon and complex words.',
		metadata: { tier: 'free', tags: ['clarity'] }
	},
	{
		id: 'professional-tone',
		category: 'writing',
		title: 'Professional Tone',
		content: 'Adjust this text to sound professional and confident.',
		metadata: { tier: 'free', tags: ['professional'] }
	},

	// CODE
	{
		id: 'clean-html',
		category: 'code',
		title: 'Clean HTML',
		content: 'Convert this to clean, semantic HTML with proper tags.',
		metadata: { tier: 'free', tags: ['html'] }
	},
	{
		id: 'add-comments',
		category: 'code',
		title: 'Add Comments',
		content: 'Add helpful comments to this code to explain what it does.',
		metadata: { tier: 'trial', tags: ['comments'] }
	},

	// DESIGN
	{
		id: 'ui-copy',
		category: 'design',
		title: 'UI Copy',
		content: 'Turn this into friendly, helpful text for a user interface.',
		metadata: { tier: 'free', tags: ['ui'] }
	},
	{
		id: 'error-message',
		category: 'design',
		title: 'Error Message',
		content: 'Create a helpful error message that explains the problem and how to fix it.',
		metadata: { tier: 'trial', tags: ['error'] }
	}
];

async function seedSimplePrompts() {
	console.log('🌱 Seeding simple prompts...');

	// Clear existing prompts first
	const existingSnapshot = await adminFirestore.collection('prompts').get();
	const batch = adminFirestore.batch();

	existingSnapshot.docs.forEach((doc) => {
		batch.delete(doc.ref);
	});

	await batch.commit();
	console.log('🗑️ Cleared existing prompts');

	// Add new simple prompts
	const newBatch = adminFirestore.batch();

	simplePrompts.forEach((prompt) => {
		const promptRef = adminFirestore.collection('prompts').doc(prompt.id);
		newBatch.set(promptRef, {
			...prompt,
			active: true,
			isSystem: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	});

	await newBatch.commit();
	console.log(`✅ Seeded ${simplePrompts.length} simple prompts`);
}

export { seedSimplePrompts };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedSimplePrompts()
		.then(() => {
			console.log('🎉 Simple prompts ready!');
			process.exit(0);
		})
		.catch((error) => {
			console.error('💥 Error:', error);
			process.exit(1);
		});
}
