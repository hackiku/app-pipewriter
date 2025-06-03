// scripts/seed-production.ts
// IMPORTANT: Set environment BEFORE any Firebase imports
process.env.USE_FIREBASE_EMULATOR = 'false';
process.env.NODE_ENV = 'production';

import { seedElements } from './seed/seed-elements.js';
import { seedSimplePrompts } from './seed/simple-prompts.js';

async function seedProduction() {
	console.log('🚀 SEEDING PRODUCTION FIREBASE');
	console.log('⚠️  This will add data to your live Firestore database');
	console.log('');

	// Confirm this is what we want
	const projectId = process.env.FIREBASE_PROJECT_ID || 'pipewriter';
	console.log(`📍 Target: ${projectId} (PRODUCTION)`);
	console.log('');

	// Wait a moment for user to cancel if needed
	await new Promise((resolve) => setTimeout(resolve, 3000));

	try {
		// Seed elements first
		console.log('1️⃣ Seeding elements...');
		await seedElements();
		console.log('');

		// Seed system prompts
		console.log('2️⃣ Seeding system prompts...');
		await seedSimplePrompts();
		console.log('');

		console.log('🎉 PRODUCTION SEEDING COMPLETE!');
		console.log('');
		console.log('✅ Your Firebase Console should now show:');
		console.log('   📦 Elements collection with 25+ items');
		console.log('   📝 Prompts collection with 6+ system prompts');
		console.log('');
		console.log('🔗 Check your data:');
		console.log(`   https://console.firebase.google.com/project/${projectId}/firestore`);
		console.log('');
		console.log('🚀 Test your app:');
		console.log('   https://app-pipewriter.vercel.app/');
	} catch (error) {
		console.error('💥 Production seeding failed:', error);
		process.exit(1);
	}
}

seedProduction();
