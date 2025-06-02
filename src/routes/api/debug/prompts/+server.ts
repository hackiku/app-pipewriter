// src/routes/api/debug/prompts/+server.ts - No auth required in dev
import { json } from '@sveltejs/kit';
import { adminFirestore } from '$lib/server/firebase-admin';
import { dev } from '$app/environment';

export async function GET() {
	// Only allow in development
	if (!dev) {
		return json({ error: 'Debug endpoint only available in development' }, { status: 403 });
	}

	try {
		console.log('🧪 Debug: Checking prompts...');

		// Test direct Firebase access
		const promptsRef = adminFirestore.collection('prompts');
		const snapshot = await promptsRef.get();

		console.log('🧪 Raw Firebase result:', snapshot.size, 'docs');

		const prompts = snapshot.docs.map(doc => ({
			id: doc.id,
			title: doc.data().title,
			category: doc.data().category,
			isSystem: doc.data().isSystem,
			active: doc.data().active,
			tier: doc.data().metadata?.tier
		}));

		// Group by category
		const grouped = prompts.reduce((acc, prompt) => {
			if (!acc[prompt.category]) {
				acc[prompt.category] = [];
			}
			acc[prompt.category].push(prompt);
			return acc;
		}, {});

		return json({
			success: true,
			debug: {
				totalDocs: snapshot.size,
				activePrompts: prompts.filter(p => p.active).length,
				systemPrompts: prompts.filter(p => p.isSystem).length,
				categories: Object.keys(grouped),
				categoryCounts: Object.entries(grouped).map(([cat, items]) => ({
					category: cat,
					count: items.length
				})),
				samplePrompts: prompts.slice(0, 3)
			},
			prompts: grouped
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