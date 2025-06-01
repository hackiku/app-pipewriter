// scripts/debug-prompts.ts
import { adminFirestore } from '../src/lib/server/firebase-admin.js';

async function quickDebug() {
	console.log('🔍 Quick prompts debug...\n');

	try {
		// Check prompts collection
		const promptsRef = adminFirestore.collection('prompts');
		const allDocs = await promptsRef.get();
		console.log(`📊 Total docs in prompts collection: ${allDocs.size}`);

		if (allDocs.size === 0) {
			console.log('❌ No prompts found! Run: npm run seed:prompts');
			return;
		}

		// Check active prompts
		const activeDocs = await promptsRef.where('active', '==', true).get();
		console.log(`✅ Active prompts: ${activeDocs.size}`);

		// Check system prompts
		const systemDocs = await promptsRef
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.get();
		console.log(`🏢 System prompts: ${systemDocs.size}`);

		// Categories breakdown
		const categories = {};
		activeDocs.docs.forEach((doc) => {
			const category = doc.data().category;
			categories[category] = (categories[category] || 0) + 1;
		});

		console.log('\n📂 Categories:');
		Object.entries(categories).forEach(([cat, count]) => {
			console.log(`   ${cat}: ${count}`);
		});

		// Sample prompt
		if (activeDocs.size > 0) {
			const sample = activeDocs.docs[0].data();
			console.log('\n📝 Sample prompt:');
			console.log(`   Title: ${sample.title}`);
			console.log(`   Category: ${sample.category}`);
			console.log(`   Tier: ${sample.metadata?.tier}`);
			console.log(`   System: ${sample.isSystem}`);
		}

		console.log('\n🎯 Next steps:');
		console.log('   1. Visit: http://localhost:5173/prompty');
		console.log('   2. Check console for loading logs');
		console.log('   3. Should see prompts manager UI');
	} catch (error) {
		console.error('❌ Error:', error.message);
		console.log('\n🔧 Troubleshooting:');
		console.log('   1. Is Firebase emulator running?');
		console.log('   2. Run: firebase emulators:start');
		console.log('   3. Then: npm run seed:prompts');
	}
}

quickDebug();
