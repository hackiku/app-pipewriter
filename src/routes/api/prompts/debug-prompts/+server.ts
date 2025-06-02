// src/routes/api/prompts/debug-prompts/+server.ts
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';
import { getFilteredPrompts } from '$lib/server/data-loaders';

export async function GET({ locals }) {
	try {
		console.log('🧪 Debug: Testing prompts loading...');

		// Test 1: Direct Firebase access
		const promptsRef = adminFirestore.collection('prompts');
		const rawSnapshot = await promptsRef.limit(3).get();

		console.log('🧪 Raw Firebase test:', rawSnapshot.size, 'docs');

		// Test 2: Via data loader (if authenticated)
		let loadedPrompts = {};
		if (locals.authenticated && locals.user) {
			console.log('🧪 Testing via data loader...');
			loadedPrompts = await getFilteredPrompts('trial', locals.user.uid);
		}

		return json({
			success: true,
			rawFirebaseTest: {
				docsFound: rawSnapshot.size,
				sampleDocs: rawSnapshot.docs.map(doc => ({
					id: doc.id,
					title: doc.data().title,
					category: doc.data().category,
					isSystem: doc.data().isSystem,
					active: doc.data().active
				}))
			},
			dataLoaderTest: {
				authenticated: locals.authenticated,
				categories: Object.keys(loadedPrompts).length,
				totalPrompts: Object.values(loadedPrompts).flat().length,
				prompts: loadedPrompts
			}
		});

	} catch (error) {
		console.error('🧪 Debug error:', error);
		return json({
			success: false,
			error: error.message,
			stack: error.stack
		}, { status: 500 });
	}
}