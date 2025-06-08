// src/routes/api/prompts/simple/+server.ts - FIXED VERSION
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';

/**
 * GET /api/prompts/simple - Fixed version with proper error handling
 */
export async function GET() {
	console.log('🔄 API: Starting prompts fetch...');

	try {
		console.log('🔄 API: Connecting to Firestore...');

		const promptsRef = adminFirestore.collection('prompts');
		console.log('🔄 API: Collection reference created');

		const snapshot = await promptsRef
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.get();

		console.log(`📦 API: Query completed, found ${snapshot.size} docs`);

		if (snapshot.empty) {
			console.log('❌ API: No prompts found');
			return json({
				success: true, // Changed to true since this is a valid response
				error: 'No prompts found in database',
				prompts: [],
				count: 0
			});
		}

		console.log('🔍 API: Processing documents...');

		// Process documents with better error handling
		const prompts = [];
		const errors = [];

		snapshot.docs.forEach((doc, index) => {
			try {
				const data = doc.data();
				console.log(`API: Processing doc ${index} (${doc.id}):`, {
					hasTitle: !!data.title,
					hasCategory: !!data.category,
					hasContent: !!data.content,
					category: data.category
				});

				const converted = {
					id: doc.id,
					title: data.title || 'Untitled',
					description: data.description || '',
					content: data.content || '',
					category: data.category || 'uncategorized',
					tier: data.metadata?.tier || 'free',
					isLocked: false,
					isSystem: true,
					isUserCustom: false
				};

				prompts.push(converted);

			} catch (docError) {
				console.error(`❌ API: Error processing doc ${doc.id}:`, docError);
				errors.push({ docId: doc.id, error: docError.message });
			}
		});

		// Debug: Check categories
		const categories = [...new Set(prompts.map(p => p.category))];
		console.log('🏷️ API: Categories found:', categories);

		const categoryCounts = {};
		prompts.forEach(p => {
			categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
		});
		console.log('📊 API: Category counts:', categoryCounts);

		console.log(`✅ API: Returning ${prompts.length} prompts`);

		return json({
			success: true,
			prompts,
			count: prompts.length,
			debug: {
				categories,
				categoryCounts,
				errors,
				timestamp: new Date().toISOString()
			}
		});

	} catch (error) {
		console.error('❌ API: Fatal error:', error);
		console.error('❌ API: Error stack:', error.stack);

		return json({
			success: false,
			error: `API Error: ${error.message}`,
			prompts: [],
			count: 0,
			debug: {
				errorType: error.constructor.name,
				errorMessage: error.message,
				timestamp: new Date().toISOString()
			}
		}, { status: 500 });
	}
}