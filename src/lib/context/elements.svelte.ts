// src/lib/context/elements.svelte.ts

import { elementsService, type ElementWithAccess } from '$lib/services/firestore/elements';
import type { ElementTheme } from '$lib/types/elements';
import { browser } from '$app/environment';

interface DropperElementsState {
	elements: Record<string, ElementWithAccess[]>;
	loading: boolean;
	error: string | null;
	theme: ElementTheme;
	userTier: 'free' | 'trial' | 'pro';
}

/**
 * Reactive store for dropper elements
 * Handles loading, theme switching, and tier filtering
 */
export function createDropperElements(initialUserTier: 'free' | 'trial' | 'pro' = 'free') {
	// Reactive state
	let state = $state<DropperElementsState>({
		elements: {},
		loading: true,
		error: null,
		theme: 'light',
		userTier: initialUserTier
	});

	// Track if we've set up the real-time listener
	let listenerSetup = false;

	/**
	 * Load elements for current theme and user tier
	 */
	async function loadElements() {
		state.loading = true;
		state.error = null;

		try {
			const elements = await elementsService.getElementsByCategory(state.userTier, state.theme);
			state.elements = elements;
			state.loading = false;

			console.log(`✅ Loaded ${Object.keys(elements).length} categories for ${state.userTier}/${state.theme}`);
		} catch (error) {
			console.error('❌ Failed to load elements:', error);
			state.error = error instanceof Error ? error.message : 'Failed to load elements';
			state.loading = false;
		}
	}

	/**
	 * Set up real-time listener (only once)
	 */
	function setupRealTimeUpdates() {
		if (!browser || listenerSetup) return;

		elementsService.setupRealTimeListener(() => {
			// Reload elements when Firestore updates
			loadElements();
		});

		listenerSetup = true;
	}

	/**
	 * Switch theme and reload elements
	 */
	async function setTheme(newTheme: ElementTheme) {
		if (state.theme === newTheme) return;

		console.log(`🎨 Switching theme from ${state.theme} to ${newTheme}`);
		state.theme = newTheme;
		await loadElements();
	}

	/**
	 * Update user tier and reload elements
	 */
	async function setUserTier(newTier: 'free' | 'trial' | 'pro') {
		if (state.userTier === newTier) return;

		console.log(`👤 Switching tier from ${state.userTier} to ${newTier}`);
		state.userTier = newTier;
		await loadElements();
	}

	/**
	 * Get element by ID with current user access
	 */
	async function getElementById(elementId: string): Promise<ElementWithAccess | null> {
		return elementsService.getElementById(elementId, state.userTier);
	}

	/**
	 * Check if element is locked for current user
	 */
	function isElementLocked(elementTier: 'free' | 'trial' | 'pro'): boolean {
		if (state.userTier === 'pro') return false;
		if (state.userTier === 'trial') return elementTier === 'pro';
		return elementTier !== 'free';
	}

	/**
	 * Get SVG URL for element with proper theme handling
	 */
	function getElementSvgUrl(elementId: string, appTheme: ElementTheme): string {
		const baseId = elementId.endsWith('-dark') ? elementId.replace(/-dark$/, '') : elementId;

		// Use current element theme or app theme logic
		const shouldUseDarkVariant =
			appTheme === 'dark'
				? state.theme === 'light' // In dark app, light elements should be dark
				: state.theme === 'dark'; // In light app, dark elements stay dark

		const svgPath = shouldUseDarkVariant ? `${baseId}-dark.svg` : `${baseId}.svg`;
		return `/elements/${svgPath}`;
	}

	/**
	 * Initialize - load elements and set up listeners
	 */
	async function initialize() {
		await loadElements();
		setupRealTimeUpdates();
	}

	/**
	 * Cleanup
	 */
	function cleanup() {
		elementsService.cleanup();
	}

	// Auto-initialize if in browser
	if (browser) {
		initialize();
	}

	// Return reactive interface
	return {
		// Reactive getters (these will update components automatically)
		get elements() { return state.elements; },
		get loading() { return state.loading; },
		get error() { return state.error; },
		get theme() { return state.theme; },
		get userTier() { return state.userTier; },

		// Methods
		setTheme,
		setUserTier,
		getElementById,
		isElementLocked,
		getElementSvgUrl,
		loadElements,
		cleanup,

		// Debug helper
		debugState: () => ({
			categoriesCount: Object.keys(state.elements).length,
			totalElements: Object.values(state.elements).flat().length,
			loading: state.loading,
			error: state.error,
			theme: state.theme,
			userTier: state.userTier
		})
	};
}

// Export type for components to use
export type DropperElementsStore = ReturnType<typeof createDropperElements>;