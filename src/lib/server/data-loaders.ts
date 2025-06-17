// src/lib/server/data-loaders.ts - FIXED SERIALIZATION
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
	deletedAt?: string | null;
	restoredAt?: string | null;
}

/**
 * Convert Firestore document to serializable format - FIXED
 */
function serializeFirestoreDoc(doc: any): any {
	const data = doc.data();
	
	// Helper to serialize any date field
	const serializeDate = (date: any) => {
		if (!date) return null;
		if (date.toDate && typeof date.toDate === 'function') {
			return date.toDate().toISOString();
		}
		if (date instanceof Date) {
			return date.toISOString();
		}
		if (typeof date === 'string') {
			return date; // Already serialized
		}
		return null;
	};

	return {
		id: doc.id,
		...data,
		// Serialize all possible date fields
		createdAt: serializeDate(data.createdAt),
		updatedAt: serializeDate(data.updatedAt),
		deletedAt: serializeDate(data.deletedAt),
		restoredAt: serializeDate(data.restoredAt),
		// Add any other date fields that might exist
		trialStartDate: serializeDate(data.trialStartDate),
		lastLoginDate: serializeDate(data.lastLoginDate),
	};
}

/**
 * Load elements with proper access control and locking (unchanged)
 */
export async function getFilteredElements(userTier: 'free' | 'trial' | 'pro'): Promise<Record<string, ElementData[]>> {
	try {
		console.log('[ADDON] Loading elements...');
		const elementsRef = adminFirestore.collection('elements');
		const snapshot = await elementsRef
			.where('active', '==', true)
			.orderBy('displayOrder')
			.get();

		const allElements = snapshot.docs.map(doc => serializeFirestoreDoc(doc));

		const userAccess = {
			canUseElement: (elementTier: string) => {
				if (userTier === 'pro') return true;
				if (userTier === 'trial') return elementTier !== 'pro';
				return elementTier === 'free';
			}
		};

		const elementsWithAccess = allElements.map(element => ({
			...element,
			isLocked: !userAccess.canUseElement(element.metadata?.tier || 'free'),
			svgPath: `/elements/${element.id}.svg`
		}));

		const grouped = elementsWithAccess.reduce((acc, element) => {
			if (!acc[element.category]) {
				acc[element.category] = [];
			}
			acc[element.category].push(element);
			return acc;
		}, {} as Record<string, ElementData[]>);

		console.log(`✅ Loaded ${elementsWithAccess.length} elements for ${userTier} tier`);
		console.log(`[ADDON] Element categories: ${Object.keys(grouped).join(', ')}`);
		return grouped;

	} catch (error) {
		console.error('❌ Error loading elements:', error);
		return {};
	}
}

/**
 * SIMPLIFIED: Load ONLY user prompts (no merging, no system prompts) - FIXED SERIALIZATION
 */
export async function getFilteredPrompts(userTier: 'free' | 'trial' | 'pro', userId: string): Promise<Record<string, PromptData[]>> {
	try {
		console.log(`[ADDON] Loading prompts...`);
		console.log(`🔄 Loading user prompts for ${userId} (tier: ${userTier})`);

		// SIMPLIFIED: Only query user's prompts collection
		const userPromptsRef = adminFirestore
			.collection('users')
			.doc(userId)
			.collection('prompts');

		const userSnapshot = await userPromptsRef
			.where('active', '==', true)
			.orderBy('category')
			.orderBy('title')
			.get();

		console.log(`📦 Found ${userSnapshot.size} user prompts`);

		// Convert to PromptData format with FIXED serialization
		const allPrompts = userSnapshot.docs.map(doc => serializeFirestoreDoc(doc));

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

		console.log(`✅ Loaded ${allPrompts.length} user prompts for ${userTier} tier`);
		console.log(`[ADDON] Prompt categories: ${Object.keys(grouped).join(', ')}`);

		return grouped;

	} catch (error) {
		console.error('❌ Error loading user prompts:', error);
		console.error('Error details:', error.message);
		return {};
	}
}