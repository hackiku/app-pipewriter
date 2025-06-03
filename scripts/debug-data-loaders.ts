// scripts/debug-data-loading.ts - Test your exact data loading flow
process.env.USE_FIREBASE_EMULATOR = 'false';

async function testDataLoading() {
  console.log('🔍 Testing Data Loading Flow');
  console.log('============================');

  try {
    console.log('\n1️⃣ Testing getUserWithFeatures...');
    const { getUserWithFeatures } = await import('../src/lib/server/user-features.js');

    // Test with a fake user ID first
    const testUid = 'test-user-12345';
    const userFeatures = await getUserWithFeatures(testUid);

    console.log('User features result:', {
      tier: userFeatures.tier,
      isPro: userFeatures.isPro,
      trialActive: userFeatures.trialActive,
      trialDaysLeft: userFeatures.trialDaysLeft
    });

    console.log('\n2️⃣ Testing getFilteredElements...');
    const { getFilteredElements } = await import('../src/lib/server/data-loaders.js');

    const elements = await getFilteredElements(userFeatures.tier);
    console.log(`Elements loaded: ${Object.keys(elements).length} categories`);
    console.log(`Total elements: ${Object.values(elements).flat().length}`);
    console.log(`Sample element:`, Object.values(elements).flat()[0]);

    console.log('\n3️⃣ Testing getFilteredPrompts...');
    const { getFilteredPrompts } = await import('../src/lib/server/data-loaders.js');

    try {
      const prompts = await getFilteredPrompts(userFeatures.tier, testUid);
      console.log(`Prompts loaded: ${Object.keys(prompts).length} categories`);
      console.log(`Total prompts: ${Object.values(prompts).flat().length}`);
    } catch (e) {
      console.log('Prompts failed (expected for fake user):', e.message);
    }

    console.log('\n4️⃣ Testing with real user...');
    const { adminFirestore } = await import('../src/lib/server/firebase-admin.js');

    const usersSnapshot = await adminFirestore.collection('users').limit(1).get();
    if (!usersSnapshot.empty) {
      const realUid = usersSnapshot.docs[0].id;
      console.log(`Found real user: ${realUid}`);

      const realUserFeatures = await getUserWithFeatures(realUid);
      console.log('Real user features:', realUserFeatures);

      const realPrompts = await getFilteredPrompts(realUserFeatures.tier, realUid);
      console.log(`Real user prompts: ${Object.values(realPrompts).flat().length}`);
    } else {
      console.log('No real users found in database');
    }

    console.log('\n✅ Data loading test complete!');

  } catch (error) {
    console.error('\n❌ Data loading failed:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    // Check for common issues
    if (error.message.includes('SvelteKit')) {
      console.log('\n💡 SvelteKit import issue - try running from project root');
    } else if (error.message.includes('Firebase')) {
      console.log('\n💡 Firebase connection issue - check service account');
    } else if (error.message.includes('$app')) {
      console.log('\n💡 SvelteKit environment issue - check imports');
    }
  }
}

testDataLoading();
