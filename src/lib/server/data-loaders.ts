// src/lib/server/data-loaders.ts - UPDATED VERSION with user prompts
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
	// Serializable date fields
	createdAt?: string;
	updatedAt?: string;
}

export interface PromptData {
	id: string;
	category: string;
	title: string;
	description: string;
	content: string;
	metadata?: {
		tier?: 'free' | 'trial' | 'pro';
		tags?: string[];
		usage?: number;
	};
	isLocked: boolean;
	isSystem: boolean;
	isUserCustom: boolean;
	// Serializable date fields
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Convert Firestore document to serializable format
 */
function serializeFirestoreDoc(doc: any): any {
	const data = doc.data();
	return {
		id: doc.id,
		...data,
		// Convert Firestore Timestamps to ISO strings for serialization
		createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
		updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
	};
}

/**
 * Load elements with proper access control and locking
 */
export async function getFilteredElements(userTier: 'free' | 'trial' | 'pro'): Promise<Record<string, ElementData[]>> {
	try {
		const elementsRef = adminFirestore.collection('elements');
		const snapshot = await elementsRef
			.where('active', '==', true)
			.orderBy('displayOrder')
			.get();

		// Convert Firestore docs to serializable format
		const allElements = snapshot.docs.map(doc => serializeFirestoreDoc(doc));

		// Create user access checker
		const userAccess = {
			canUseElement: (elementTier: string) => {
				if (userTier === 'pro') return true;
				if (userTier === 'trial') return elementTier !== 'pro';
				return elementTier === 'free';
			}
		};

		// Filter and mark locked status
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

		console.log(`✅ Loaded ${elementsWithAccess.length} elements for ${userTier} tier`);
		return grouped;

	} catch (error) {
		console.error('❌ Error loading elements:', error);
		return {};
	}
}

/**
 * UPDATED: Load prompts with user customizations merged with system prompts
 */
export async function getFilteredPrompts(userTier: 'free' | 'trial' | 'pro', userId: string): Promise<Record<string, PromptData[]>> {
	try {
		console.log(`🔄 Loading prompts for user ${userId} (tier: ${userTier})`);

		// Load system prompts
		const systemPromptsRef = adminFirestore.collection('prompts');
		const systemSnapshot = await systemPromptsRef
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.orderBy('category')
			.orderBy('title')
			.get();

		console.log(`📦 Found ${systemSnapshot.size} system prompts`);

		// Load user's custom prompts
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(userId)
			.collection('prompts');

		const userSnapshot = await userPromptsRef
			.where('active', '==', true)
			.get();

		console.log(`👤 Found ${userSnapshot.size} user custom prompts`);

		// Merge prompts (user prompts override system prompts with same ID)
		const allPrompts = new Map();

		// Add system prompts first
		systemSnapshot.docs.forEach(doc => {
			const promptData = serializeFirestoreDoc(doc);
			allPrompts.set(doc.id, {
				...promptData,
				isSystem: true,
				isUserCustom: false
			});
		});

		// Override with user prompts (user customizations take precedence)
		userSnapshot.docs.forEach(doc => {
			const promptData = serializeFirestoreDoc(doc);
			allPrompts.set(doc.id, {
				...promptData,
				isSystem: false,
				isUserCustom: true
			});
		});

		// Apply tier-based access control
		const userAccess = {
			canUsePrompt: (promptTier: string) => {
				if (userTier === 'pro') return true;
				if (userTier === 'trial') return promptTier !== 'pro';
				return promptTier === 'free';
			}
		};

		// Filter and mark locked status
		const promptsWithAccess = Array.from(allPrompts.values()).map(prompt => ({
			...prompt,
			isLocked: !userAccess.canUsePrompt(prompt.metadata?.tier || 'free')
		}));

		// Group by category
		const grouped = promptsWithAccess.reduce((acc, prompt) => {
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

		console.log(`✅ Loaded ${promptsWithAccess.length} total prompts (${systemSnapshot.size} system + ${userSnapshot.size} custom) for ${userTier} tier`);
		console.log(`📂 Categories: ${Object.keys(grouped).join(', ')}`);

		return grouped;

	} catch (error) {
		console.error('❌ Error loading prompts:', error);
		console.error('Error details:', error.message);
		return {};
	}
}

/**
 * Debug helper - check what's in the prompts collection
 */
export async function debugPromptsCollection(): Promise<void> {
	try {
		const promptsRef = adminFirestore.collection('prompts');
		const allSnapshot = await promptsRef.get();

		console.log(`🔍 Debug: Total docs in prompts collection: ${allSnapshot.size}`);

		const activeSnapshot = await promptsRef.where('active', '==', true).get();
		console.log(`🔍 Debug: Active prompts: ${activeSnapshot.size}`);

		const systemSnapshot = await promptsRef
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.get();
		console.log(`🔍 Debug: System prompts: ${systemSnapshot.size}`);

		if (activeSnapshot.size > 0) {
			const firstPrompt = activeSnapshot.docs[0].data();
			console.log(`🔍 Debug: First prompt sample:`, {
				id: activeSnapshot.docs[0].id,
				title: firstPrompt.title,
				category: firstPrompt.category,
				tier: firstPrompt.metadata?.tier,
				isSystem: firstPrompt.isSystem,
				active: firstPrompt.active
			});
		}

		// Check categories
		const categories = new Set();
		activeSnapshot.docs.forEach(doc => {
			categories.add(doc.data().category);
		});
		console.log(`🔍 Debug: Categories found: ${Array.from(categories).join(', ')}`);

	} catch (error) {
		console.error('❌ Debug error:', error);
	}
}