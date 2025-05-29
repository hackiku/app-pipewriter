// src/lib/services/firestore/elements.ts

import { getFirebaseService } from '$lib/services/firebase/client';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import type { ElementDefinition, ElementTheme } from '$lib/types/elements';
import { browser } from '$app/environment';

export interface ElementWithAccess extends ElementDefinition {
	isLocked: boolean;
	svgPath: string;
	svgPathDark?: string;
}

class ElementsService {
	private static instance: ElementsService;
	private elementsCache = new Map<string, ElementDefinition>();
	private cacheExpiry = 0;
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
	private unsubscribe: (() => void) | null = null;

	static getInstance(): ElementsService {
		if (!this.instance) {
			this.instance = new ElementsService();
		}
		return this.instance;
	}

	/**
	 * Load all elements from Firestore with caching
	 */
	async getElements(forceRefresh = false): Promise<ElementDefinition[]> {
		if (!browser) return this.getFallbackElements();

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

			const elements: ElementDefinition[] = [];
			snapshot.docs.forEach(doc => {
				const element = { ...doc.data(), id: doc.id } as ElementDefinition;
				this.elementsCache.set(element.id, element);
				elements.push(element);
			});

			this.cacheExpiry = now + this.CACHE_DURATION;
			console.log(`✅ Loaded ${elements.length} elements from Firestore`);
			return elements;

		} catch (error) {
			console.error('❌ Error loading elements from Firestore:', error);
			return this.getFallbackElements();
		}
	}

	/**
	 * Get elements grouped by category with tier filtering and access control
	 */
	async getElementsByCategory(
		userTier: 'free' | 'trial' | 'pro',
		theme: ElementTheme = 'light'
	): Promise<Record<string, ElementWithAccess[]>> {
		const elements = await this.getElements();

		return elements.reduce((grouped, element) => {
			const elementTier = element.metadata?.tier || 'free';
			const isLocked = !this.checkTierAccess(userTier, elementTier);

			// Create element with access info and SVG paths
			const elementWithAccess: ElementWithAccess = {
				...element,
				isLocked,
				svgPath: this.getSvgPath(element.id, theme),
				svgPathDark: element.metadata?.supports?.darkMode
					? this.getSvgPath(element.id, 'dark')
					: undefined
			};

			if (!grouped[element.category]) {
				grouped[element.category] = [];
			}
			grouped[element.category].push(elementWithAccess);

			return grouped;
		}, {} as Record<string, ElementWithAccess[]>);
	}

	/**
	 * Get single element by ID with access control
	 */
	async getElementById(
		elementId: string,
		userTier: 'free' | 'trial' | 'pro' = 'free'
	): Promise<ElementWithAccess | null> {
		const elements = await this.getElements();
		const element = elements.find(el => el.id === elementId);

		if (!element) return null;

		const elementTier = element.metadata?.tier || 'free';
		const isLocked = !this.checkTierAccess(userTier, elementTier);

		return {
			...element,
			isLocked,
			svgPath: this.getSvgPath(element.id, 'light'),
			svgPathDark: element.metadata?.supports?.darkMode
				? this.getSvgPath(element.id, 'dark')
				: undefined
		};
	}

	/**
	 * Set up real-time listener for elements
	 */
	setupRealTimeListener(callback?: (elements: ElementDefinition[]) => void) {
		if (!browser) return;

		try {
			const { db } = getFirebaseService();
			const elementsRef = collection(db, 'elements');
			const q = query(
				elementsRef,
				where('active', '==', true),
				orderBy('category'),
				orderBy('id')
			);

			this.unsubscribe = onSnapshot(q, (snapshot) => {
				this.elementsCache.clear();
				const elements: ElementDefinition[] = [];

				snapshot.docs.forEach(doc => {
					const element = { ...doc.data(), id: doc.id } as ElementDefinition;
					this.elementsCache.set(element.id, element);
					elements.push(element);
				});

				console.log(`🔄 Real-time update: ${elements.length} elements`);
				callback?.(elements);
			}, (error) => {
				console.error('❌ Real-time listener error:', error);
			});

		} catch (error) {
			console.error('❌ Error setting up real-time listener:', error);
		}
	}

	/**
	 * Check if user tier has access to element tier
	 */
	private checkTierAccess(userTier: string, elementTier: string): boolean {
		if (userTier === 'pro') return true;
		if (userTier === 'trial') return elementTier !== 'pro';
		return elementTier === 'free';
	}

	/**
	 * Get SVG path for element with theme handling
	 */
	private getSvgPath(elementId: string, theme: ElementTheme): string {
		const baseId = elementId.endsWith('-dark') ? elementId.replace(/-dark$/, '') : elementId;

		if (theme === 'dark') {
			return `/elements/${baseId}-dark.svg`;
		}
		return `/elements/${baseId}.svg`;
	}

	/**
	 * Get contextual element theme based on app theme
	 */
	getContextualElementId(elementId: string, appTheme: ElementTheme): string {
		const baseId = elementId.endsWith('-dark') ? elementId.replace(/-dark$/, '') : elementId;
		const isDarkVariant = elementId.endsWith('-dark');

		// If element is explicitly dark, keep it dark
		if (isDarkVariant) return elementId;

		// If app is in dark mode and element is light, make it dark
		if (appTheme === 'dark' && !isDarkVariant) {
			return `${baseId}-dark`;
		}

		return elementId;
	}

	/**
	 * Fallback to hardcoded elements (for development/offline)
	 */
	private getFallbackElements(): ElementDefinition[] {
		console.log('📦 Using fallback hardcoded elements');
		// Import the hardcoded elements as fallback
		try {
			const { elementsDb } = require('$lib/data/addon/elements');
			return Object.values(elementsDb);
		} catch {
			return [];
		}
	}

	/**
	 * Cleanup listeners
	 */
	cleanup() {
		if (this.unsubscribe) {
			this.unsubscribe();
			this.unsubscribe = null;
		}
	}
}

// Export singleton instance
export const elementsService = ElementsService.getInstance();