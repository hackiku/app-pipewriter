// scripts/debug-app-data.ts - Test your app's data loading logic
process.env.USE_FIREBASE_EMULATOR = 'false';

async function debugAppData() {
  console.log('🔍 Testing App Data Loading Logic');

  try {
    // Test the exact functions your app uses
    const { getFilteredElements, getFilteredPrompts } = await import('../src/lib/server/data-loaders.js');

    console.log('\n📦 Testing Elements Loading...');
    const elements = await getFilteredElements('free');
    console.log(`Elements loaded: ${Object.keys(elements).length} categories`);
    console.log(`Total elements: ${Object.values(elements).flat().length}`);
    console.log(`Categories: ${Object.keys(elements).join(', ')}`);

    // Test each tier
    const trialElements = await getFilteredElements('trial');
    const proElements = await getFilteredElements('pro');
    console.log(`Trial elements: ${Object.values(trialElements).flat().length}`);
    console.log(`Pro elements: ${Object.values(proElements).flat().length}`);

    console.log('\n📝 Testing Prompts Loading...');
    // Create a test user ID for prompts
    const testUid = 'test-user-debug';

    try {
      const prompts = await getFilteredPrompts('free', testUid);
      console.log(`Prompts loaded: ${Object.keys(prompts).length} categories`);
      console.log(`Total prompts: ${Object.values(prompts).flat().length}`);
      console.log(`Categories: ${Object.keys(prompts).join(', ')}`);
    } catch (e) {
      console.log(`⚠️ Prompts failed (expected for non-existent user): ${e.message}`);

      // Test with actual user if exists
      const { adminFirestore } = await import('../src/lib/server/firebase-admin.js');
      const usersSnapshot = await adminFirestore.collection('users').limit(1).get();

      if (!usersSnapshot.empty) {
        const realUid = usersSnapshot.docs[0].id;
        console.log(`\n🔄 Testing with real user: ${realUid}`);
        const realPrompts = await getFilteredPrompts('free', realUid);
        console.log(`Real user prompts: ${Object.values(realPrompts).flat().length}`);
      }
    }

    console.log('\n✅ App data loading works!');

  } catch (error) {
    console.error('❌ App data loading failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugAppData();
