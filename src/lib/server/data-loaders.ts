// src/lib/server/data-loaders.ts - FIXED WITH DEBUGGING
import { adminFirestore } from './firebase-admin';

export interface ElementData {
	id: string;
	category: string;
	description: string;
	metadata?: {
		tier?: 'free' | 'trial' | 'pro';
		supports?: {
			darkMode?: boolean;
			customColors?: boolean;
			customText?: boolean;
		};
	};
	displayOrder?: number;
	isLocked: boolean;
	svgPath: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface PromptData {
	id: string;
	category: string;
	title: string;
	content: string;
	metadata?: {
		tier?: 'free' | 'trial' | 'pro';
		tags?: string[];
		usage?: number;
		isDefault?: boolean;
		originalSystemId?: string;
	};
	createdAt?: string;
	updatedAt?: string;
}

function serializeFirestoreDoc(doc: any): any {
	const data = doc.data();
	return {
		id: doc.id,
		...data,
		createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
		updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
	};
}

/**
 * Load elements with proper access control and locking
 */
export async function getFilteredElements(userTier: 'free' | 'trial' | 'pro'): Promise<Record<string, ElementData[]>> {
	console.log(`[ELEMENTS] Starting load for tier: ${userTier}`);

	try {
		// Check if adminFirestore is available
		if (!adminFirestore) {
			throw new Error('adminFirestore not initialized');
		}

		console.log('[ELEMENTS] Querying elements collection...');
		const elementsRef = adminFirestore.collection('elements');

		const snapshot = await elementsRef
			.where('active', '==', true)
			.orderBy('displayOrder')
			.get();

		console.log(`[ELEMENTS] Query completed. Found ${snapshot.size} documents`);

		if (snapshot.empty) {
			console.warn('[ELEMENTS] ⚠️ No elements found in Firestore!');
			console.warn('[ELEMENTS] Check if elements were seeded properly');
			return {};
		}

		const allElements = snapshot.docs.map(doc => {
			const serialized = serializeFirestoreDoc(doc);
			console.log(`[ELEMENTS] Processing element: ${serialized.id}`);
			return serialized;
		});

		console.log(`[ELEMENTS] Serialized ${allElements.length} elements`);

		// Apply access control
		const userAccess = {
			canUseElement: (elementTier: string) => {
				if (userTier === 'pro') return true;
				if (userTier === 'trial') return true; // Trial gets full access
				return elementTier === 'free';
			}
		};

		const elementsWithAccess = allElements.map(element => ({
			...element,
			isLocked: !userAccess.canUseElement(element.metadata?.tier || 'free'),
			svgPath: `/elements/${element.id}.svg`
		}));

		// Group by category
		const grouped = elementsWithAccess.reduce((acc, element) => {
			if (!acc[element.category]) {
				acc[element.category] = [];
			}
			acc[element.category].push(element);
			return acc;
		}, {} as Record<string, ElementData[]>);

		const categoryCount = Object.keys(grouped).length;
		const totalElements = elementsWithAccess.length;

		console.log(`[ELEMENTS] ✅ Success: ${totalElements} elements in ${categoryCount} categories`);
		console.log(`[ELEMENTS] Categories: ${Object.keys(grouped).join(', ')}`);

		return grouped;

	} catch (error) {
		console.error('[ELEMENTS] ❌ Critical error loading elements:', error);
		console.error('[ELEMENTS] Error details:', {
			name: error.name,
			message: error.message,
			code: error.code,
			stack: error.stack
		});

		// Don't return empty object - throw so layout.server.ts can handle
		throw new Error(`Failed to load elements: ${error.message}`);
	}
}

/**
 * Load ONLY user prompts (simplified after migration)
 */
export async function getFilteredPrompts(userTier: 'free' | 'trial' | 'pro', userId: string): Promise<Record<string, PromptData[]>> {
	console.log(`[PROMPTS] Starting load for user: ${userId}, tier: ${userTier}`);

	try {
		// Check if adminFirestore is available
		if (!adminFirestore) {
			throw new Error('adminFirestore not initialized');
		}

		if (!userId) {
			throw new Error('userId is required');
		}

		console.log(`[PROMPTS] Querying user prompts collection...`);
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(userId)
			.collection('prompts');

		const userSnapshot = await userPromptsRef
			.where('active', '==', true)
			.orderBy('category')
			.orderBy('title')
			.get();

		console.log(`[PROMPTS] Query completed. Found ${userSnapshot.size} user prompts`);

		if (userSnapshot.empty) {
			console.warn(`[PROMPTS] ⚠️ No prompts found for user ${userId}`);
			console.warn('[PROMPTS] Check if user was properly provisioned with prompts');
			return {};
		}

		// Convert to PromptData format
		const allPrompts = userSnapshot.docs.map(doc => {
			const serialized = serializeFirestoreDoc(doc);
			console.log(`[PROMPTS] Processing prompt: ${serialized.id} (${serialized.category})`);
			return serialized;
		});

		console.log(`[PROMPTS] Serialized ${allPrompts.length} prompts`);

		// Group by category
		const grouped = allPrompts.reduce((acc, prompt) => {
			if (!acc[prompt.category]) {
				acc[prompt.category] = [];
			}
			acc[prompt.category].push(prompt);
			return acc;
		}, {} as Record<string, PromptData[]>);

		// Sort within categories
		Object.keys(grouped).forEach(category => {
			grouped[category].sort((a, b) => a.title.localeCompare(b.title));
		});

		const categoryCount = Object.keys(grouped).length;
		const totalPrompts = allPrompts.length;

		console.log(`[PROMPTS] ✅ Success: ${totalPrompts} prompts in ${categoryCount} categories`);
		console.log(`[PROMPTS] Categories: ${Object.keys(grouped).join(', ')}`);

		return grouped;

	} catch (error) {
		console.error(`[PROMPTS] ❌ Critical error loading prompts for user ${userId}:`, error);
		console.error('[PROMPTS] Error details:', {
			name: error.name,
			message: error.message,
			code: error.code,
			stack: error.stack
		});

		// Don't return empty object - throw so layout.server.ts can handle
		throw new Error(`Failed to load prompts for user ${userId}: ${error.message}`);
	}
}