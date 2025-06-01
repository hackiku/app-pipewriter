// src/lib/server/data-loaders.ts - FIXED VERSION
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
	};
	isLocked: boolean;
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
 * Load prompts with proper access control - EXPORTED FUNCTION
 */
export async function getFilteredPrompts(userTier: 'free' | 'trial' | 'pro', userId: string): Promise<Record<string, PromptData[]>> {
	try {
		// Load system prompts
		const systemPromptsRef = adminFirestore.collection('prompts');
		const systemSnapshot = await systemPromptsRef
			.where('active', '==', true)
			.orderBy('category')
			.orderBy('title')
			.get();

		// Convert Firestore docs to serializable format
		const systemPrompts = systemSnapshot.docs.map(doc => ({
			...serializeFirestoreDoc(doc),
			isUserDefined: false
		}));

		// TODO: Load user-defined prompts when implemented
		// const userPromptsRef = adminFirestore.collection('users').doc(userId).collection('prompts');
		// const userSnapshot = await userPromptsRef.get();
		// const userPrompts = userSnapshot.docs.map(doc => serializeFirestoreDoc(doc));

		const userAccess = {
			canUsePrompt: (promptTier: string) => {
				if (userTier === 'pro') return true;
				if (userTier === 'trial') return promptTier !== 'pro';
				return promptTier === 'free';
			}
		};

		// Filter and mark locked status
		const promptsWithAccess = systemPrompts.map(prompt => ({
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

		console.log(`✅ Loaded ${promptsWithAccess.length} prompts for ${userTier} tier`);
		return grouped;

	} catch (error) {
		console.error('❌ Error loading prompts:', error);
		return {};
	}
}

/**
 * Debug helper - check what's in the elements collection
 */
export async function debugElementsCollection(): Promise<void> {
	try {
		const elementsRef = adminFirestore.collection('elements');
		const allSnapshot = await elementsRef.get();

		console.log(`🔍 Debug: Total docs in elements collection: ${allSnapshot.size}`);

		const activeSnapshot = await elementsRef.where('active', '==', true).get();
		console.log(`🔍 Debug: Active elements: ${activeSnapshot.size}`);

		if (activeSnapshot.size > 0) {
			const firstElement = activeSnapshot.docs[0].data();
			console.log(`🔍 Debug: First element sample:`, {
				id: activeSnapshot.docs[0].id,
				category: firstElement.category,
				tier: firstElement.metadata?.tier,
				displayOrder: firstElement.displayOrder,
				active: firstElement.active
			});
		}
	} catch (error) {
		console.error('❌ Debug error:', error);
	}
}