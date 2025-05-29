// src/lib/services/firestore/elements.ts - Fixed version

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

	// Define category order for consistent display
	private readonly CATEGORY_ORDER = [
		'containers',
		'content',
		'buttons',
		'cards',
		'blurbs',
		'lists',
		'special'
	];

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

			// Fixed query with proper ordering
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

			// Sort elements by our custom category order
			elements.sort((a, b) => {
				const aOrder = this.CATEGORY_ORDER.indexOf(a.category);
				const bOrder = this.CATEGORY_ORDER.indexOf(b.category);

				// If category not in our order, put it at the end
				const aIndex = aOrder === -1 ? 999 : aOrder;
				const bIndex = bOrder === -1 ? 999 : bOrder;

				if (aIndex !== bIndex) {
					return aIndex - bIndex;
				}

				// Within same category, sort by ID
				return a.id.localeCompare(b.id);
			});

			this.cacheExpiry = now + this.CACHE_DURATION;
			console.log(`✅ Loaded ${elements.length} elements from Firestore (ordered)`);
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

		const grouped = elements.reduce((grouped, element) => {
			const elementTier = element.metadata?.tier || 'free';
			const isLocked = !this.checkTierAccess(userTier, elementTier);

			// Create element with access info and SVG paths
			const elementWithAccess: ElementWithAccess = {
				...element,
				isLocked,
				svgPath: this.getSvgPath(element.id, 'light'), // Always provide light path
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

		// Ensure categories are in our preferred order
		const orderedGrouped: Record<string, ElementWithAccess[]> = {};

		// First add categories in our preferred order
		this.CATEGORY_ORDER.forEach(category => {
			if (grouped[category]) {
				orderedGrouped[category] = grouped[category];
			}
		});

		// Then add any remaining categories
		Object.entries(grouped).forEach(([category, elements]) => {
			if (!orderedGrouped[category]) {
				orderedGrouped[category] = elements;
			}
		});

		return orderedGrouped;
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
	 * Get SVG path for element - FIXED VERSION
	 */
	private getSvgPath(elementId: string, theme: ElementTheme): string {
		// Don't modify the element ID - it should already be correct
		const baseId = elementId.endsWith('-dark') ? elementId.replace(/-dark$/, '') : elementId;

		if (theme === 'dark') {
			return `/elements/${baseId}-dark.svg`;
		}
		return `/elements/${baseId}.svg`;
	}

	/**
	 * Get the correct SVG URL based on app theme and element theme
	 * This is the main function components should use
	 */
	getSvgUrl(elementId: string, elementTheme: ElementTheme, appTheme: ElementTheme): string {
		const baseId = elementId.endsWith('-dark') ? elementId.replace(/-dark$/, '') : elementId;

		// Logic: Show dark variant when:
		// 1. Element theme is dark, OR
		// 2. App is in dark mode AND element theme is light (invert for contrast)
		const shouldUseDarkVariant =
			elementTheme === 'dark' ||
			(appTheme === 'dark' && elementTheme === 'light');

		const svgPath = shouldUseDarkVariant ? `${baseId}-dark.svg` : `${baseId}.svg`;
		return `/elements/${svgPath}`;
	}

	/**
	 * Fallback to hardcoded elements (for development/offline)
	 */
	private getFallbackElements(): ElementDefinition[] {
		console.log('📦 Using fallback hardcoded elements');
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