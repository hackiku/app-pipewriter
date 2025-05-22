// src/lib/services/firestore/elements.svelte.ts
import { getFirebaseService } from '$lib/services/firebase/client';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import type { ElementDefinition, ElementTheme } from '$lib/data/addon/types';
import { browser } from '$app/environment';
import { elementsDb } from '$lib/data/addon/elements';

// Reactive state
let elements = $state<ElementDefinition[]>([]);
let loading = $state(true);
let error = $state<string | null>(null);
let lastUpdated = $state<Date | null>(null);

// Cache for performance
let elementsCache = new Map<string, ElementDefinition>();
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Real-time listener cleanup
let unsubscribe: (() => void) | null = null;

// Load elements from Firestore
async function loadElements(forceRefresh = false): Promise<ElementDefinition[]> {
	if (!browser) return getFallbackElements();

	const now = Date.now();

	// Use cache if still valid
	if (!forceRefresh && cacheExpiry > now && elementsCache.size > 0) {
		elements = Array.from(elementsCache.values());
		loading = false;
		return elements;
	}

	loading = true;
	error = null;

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
		elementsCache.clear();

		const loadedElements: ElementDefinition[] = [];
		snapshot.docs.forEach(doc => {
			const element = {
				...doc.data(),
				id: doc.id
			} as ElementDefinition;
			elementsCache.set(element.id, element);
			loadedElements.push(element);
		});

		elements = loadedElements;
		cacheExpiry = now + CACHE_DURATION;
		lastUpdated = new Date();
		loading = false;

		console.log(`✅ Loaded ${elements.length} elements from Firestore`);
		return elements;

	} catch (err) {
		console.error('Error loading elements from Firestore:', err);
		error = err.message;
		loading = false;

		// Fallback to static elements
		elements = getFallbackElements();
		return elements;
	}
}

// Set up real-time listener
function setupRealTimeListener() {
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

		unsubscribe = onSnapshot(q, (snapshot) => {
			elementsCache.clear();
			const updatedElements: ElementDefinition[] = [];

			snapshot.docs.forEach(doc => {
				const element = {
					...doc.data(),
					id: doc.id
				} as ElementDefinition;
				elementsCache.set(element.id, element);
				updatedElements.push(element);
			});

			elements = updatedElements;
			lastUpdated = new Date();
			loading = false;

			console.log(`🔄 Real-time update: ${elements.length} elements`);
		}, (err) => {
			console.error('Real-time listener error:', err);
			error = err.message;
		});

	} catch (err) {
		console.error('Error setting up real-time listener:', err);
	}
}

// Get elements grouped by category with tier filtering
function getElementsByCategory(userTier: 'free' | 'trial' | 'pro'): Record<string, (ElementDefinition & { isLocked?: boolean })[]> {
	const currentElements = elements;

	return currentElements.reduce((grouped, element) => {
		const elementTier = element.metadata?.tier || 'free';
		const hasAccess = checkTierAccess(userTier, elementTier);

		if (!grouped[element.category]) {
			grouped[element.category] = [];
		}

		grouped[element.category].push({
			...element,
			isLocked: !hasAccess
		});

		return grouped;
	}, {} as Record<string, (ElementDefinition & { isLocked?: boolean })[]>);
}

// Check if user tier has access to element tier
function checkTierAccess(userTier: string, elementTier: string): boolean {
	if (userTier === 'pro') return true;
	if (userTier === 'trial') return elementTier !== 'pro';
	return elementTier === 'free';
}

// Get fallback elements (static data)
function getFallbackElements(): ElementDefinition[] {
	console.log('📦 Using fallback static elements');
	return Object.values(elementsDb);
}

// Get element by ID
function getElementById(elementId: string): ElementDefinition | null {
	return elementsCache.get(elementId) || elements.find(el => el.id === elementId) || null;
}

// Get elements by tier
function getElementsByTier(tier: 'free' | 'trial' | 'pro'): ElementDefinition[] {
	return elements.filter(element => (element.metadata?.tier || 'free') === tier);
}

// Initialize on module load
if (browser) {
	loadElements().then(() => {
		// Set up real-time listener after initial load
		setupRealTimeListener();
	});
}

// Cleanup function
function cleanup() {
	if (unsubscribe) {
		unsubscribe();
		unsubscribe = null;
	}
}

// Export reactive getters and functions
export function getElements() {
	return elements;
}

export function isLoading() {
	return loading;
}

export function getError() {
	return error;
}

export function getLastUpdated() {
	return lastUpdated;
}

export {
	loadElements,
	getElementsByCategory,
	getElementById,
	getElementsByTier,
	setupRealTimeListener,
	cleanup,
	checkTierAccess
};