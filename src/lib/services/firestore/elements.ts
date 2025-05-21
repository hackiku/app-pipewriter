// src/lib/services/firestore/elements.ts
import { getFirebaseService } from '$lib/services/firebase/client';
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import type { ElementDefinition, ElementTheme } from '$lib/data/addon/types';

class FirestoreElementService {
	private static instance: FirestoreElementService;
	private elementsCache: Map<string, ElementDefinition> = new Map();
	private cacheExpiry: number = 0;
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

	static getInstance(): FirestoreElementService {
		if (!this.instance) {
			this.instance = new FirestoreElementService();
		}
		return this.instance;
	}

	async getElements(forceRefresh = false): Promise<ElementDefinition[]> {
		const now = Date.now();

		if (!forceRefresh && this.cacheExpiry > now && this.elementsCache.size > 0) {
			return Array.from(this.elementsCache.values());
		}

		try {
			const { db } = getFirebaseService();
			const elementsRef = collection(db, 'elements');
			const q = query(
				elementsRef,
				where('active', '==', true),
				orderBy('category'),
				orderBy('id')
			);

			const snapshot = await getDocs(q);
			this.elementsCache.clear();

			snapshot.docs.forEach(doc => {
				const element = { ...doc.data(), id: doc.id } as ElementDefinition;
				this.elementsCache.set(element.id, element);
			});

			this.cacheExpiry = now + this.CACHE_DURATION;
			return Array.from(this.elementsCache.values());
		} catch (error) {
			console.error('Error fetching elements from Firestore:', error);
			return this.getFallbackElements();
		}
	}

	async getElementsByCategory(userTier: 'free' | 'trial' | 'pro'): Promise<Record<string, ElementDefinition[]>> {
		const elements = await this.getElements();

		return elements.reduce((grouped, element) => {
			// Filter by user tier access
			const elementTier = element.metadata?.tier || 'free';
			const hasAccess = this.checkTierAccess(userTier, elementTier);

			if (hasAccess) {
				if (!grouped[element.category]) {
					grouped[element.category] = [];
				}
				grouped[element.category].push({
					...element,
					isLocked: false
				});
			} else {
				// Include locked elements for UI display
				if (!grouped[element.category]) {
					grouped[element.category] = [];
				}
				grouped[element.category].push({
					...element,
					isLocked: true
				});
			}

			return grouped;
		}, {} as Record<string, ElementDefinition[]>);
	}

	private checkTierAccess(userTier: string, elementTier: string): boolean {
		if (userTier === 'pro') return true;
		if (userTier === 'trial') return elementTier !== 'pro';
		return elementTier === 'free';
	}

	private getFallbackElements(): ElementDefinition[] {
		// Return your current elementsDb as fallback
		return Object.values(elementsDb);
	}
}

export const firestoreElementService = FirestoreElementService.getInstance();