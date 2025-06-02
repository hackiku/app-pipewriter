// src/lib/server/data-loaders.ts - UPDATED VERSION with simplified prompts loading
import { adminFirestore } from './firebase-admin';

// Keep existing ElementData interface and getFilteredElements function EXACTLY as is
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
 * KEEP EXISTING - Load elements with proper access control and locking
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
 * SIMPLIFIED - Load prompts (system only for now)
 */
export async function getFilteredPrompts(userTier: 'free' | 'trial' | 'pro', userId: string): Promise<Record<string, PromptData[]>> {
	try {
		console.log(`🔄 Loading prompts for user ${userId} (tier: ${userTier})`);

		// SIMPLIFIED: Just load system prompts for now
		const promptsRef = adminFirestore.collection('prompts');

		// Try simple query first
		console.log('📦 Querying prompts collection...');
		const snapshot = await promptsRef
			.where('active', '==', true)
			.get();

		console.log(`📦 Found ${snapshot.size} total active prompts`);

		if (snapshot.size === 0) {
			console.warn('⚠️ No active prompts found');
			return {};
		}

		// Filter for system prompts and convert
		const systemPrompts = snapshot.docs
			.filter(doc => {
				const data = doc.data();
				return data.isSystem === true;
			})
			.map(doc => {
				const data = doc.data();
				const tier = data.metadata?.tier || 'free';

				return {
					id: doc.id,
					category: data.category,
					title: data.title,
					description: data.description || '',
					content: data.content,
					metadata: data.metadata,
					isLocked: !canUseTier(userTier, tier),
					isSystem: true,
					isUserCustom: false,
					createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
					updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
				};
			});

		console.log(`📦 Filtered to ${systemPrompts.length} system prompts`);

		// Group by category
		const grouped = systemPrompts.reduce((acc, prompt) => {
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

		console.log(`✅ Loaded prompts: ${Object.entries(grouped).map(([cat, items]) => `${cat}:${items.length}`).join(', ')}`);

		return grouped;

	} catch (error) {
		console.error('❌ Error loading prompts:', error);
		console.error('❌ Error details:', error.message);
		console.error('❌ Error stack:', error.stack);
		return {};
	}
}

/**
 * Simple tier access check
 */
function canUseTier(userTier: 'free' | 'trial' | 'pro', promptTier: 'free' | 'trial' | 'pro'): boolean {
	if (userTier === 'pro') return true;
	if (userTier === 'trial') return promptTier !== 'pro';
	return promptTier === 'free';
}