// src/lib/context/prompts.svelte.ts

import { promptsService, type PromptWithAccess } from '$lib/services/firestore/prompts';
import { browser } from '$app/environment';

interface PromptsState {
	prompts: Record<string, PromptWithAccess[]>;
	loading: boolean;
	error: string | null;
	userTier: 'free' | 'trial' | 'pro';
}

/**
 * Reactive store for prompts
 * Handles loading, tier filtering, and real-time updates
 */
export function createPromptsStore(initialUserTier: 'free' | 'trial' | 'pro' = 'free') {
	// Reactive state
	let state = $state<PromptsState>({
		prompts: {},
		loading: true,
		error: null,
		userTier: initialUserTier
	});

	// Track if we've set up the real-time listener
	let listenerSetup = false;

	/**
	 * Load prompts for current user tier
	 */
	async function loadPrompts() {
		state.loading = true;
		state.error = null;

		try {
			const prompts = await promptsService.getPromptsByCategory(state.userTier);
			state.prompts = prompts;
			state.loading = false;

			console.log(`✅ Loaded ${Object.keys(prompts).length} prompt categories for ${state.userTier}`);
		} catch (error) {
			console.error('❌ Failed to load prompts:', error);
			state.error = error instanceof Error ? error.message : 'Failed to load prompts';
			state.loading = false;
		}
	}

	/**
	 * Set up real-time listener (only once)
	 */
	function setupRealTimeUpdates() {
		if (!browser || listenerSetup) return;

		promptsService.setupRealTimeListener(() => {
			// Reload prompts when Firestore updates
			loadPrompts();
		});

		listenerSetup = true;
	}

	/**
	 * Update user tier and reload prompts
	 */
	async function setUserTier(newTier: 'free' | 'trial' | 'pro') {
		if (state.userTier === newTier) return;

		console.log(`👤 Switching prompts tier from ${state.userTier} to ${newTier}`);
		state.userTier = newTier;
		await loadPrompts();
	}

	/**
	 * Get prompt by ID with current user access
	 */
	async function getPromptById(promptId: string): Promise<PromptWithAccess | null> {
		return promptsService.getPromptById(promptId, state.userTier);
	}

	/**
	 * Check if prompt is locked for current user
	 */
	function isPromptLocked(promptTier: 'free' | 'trial' | 'pro'): boolean {
		if (state.userTier === 'pro') return false;
		if (state.userTier === 'trial') return promptTier === 'pro';
		return promptTier !== 'free';
	}

	/**
	 * Get all prompts as flat array (useful for filtering)
	 */
	function getAllPrompts(): PromptWithAccess[] {
		return Object.values(state.prompts).flat();
	}

	/**
	 * Filter prompts by category
	 */
	function getPromptsByCategory(category: string): PromptWithAccess[] {
		return state.prompts[category] || [];
	}

	/**
	 * Get category counts
	 */
	function getCategoryCounts(): Record<string, number> {
		const counts: Record<string, number> = {};
		Object.entries(state.prompts).forEach(([category, prompts]) => {
			counts[category] = prompts.length;
		});
		return counts;
	}

	/**
	 * Initialize - load prompts and set up listeners
	 */
	async function initialize() {
		await loadPrompts();
		setupRealTimeUpdates();
	}

	/**
	 * Cleanup
	 */
	function cleanup() {
		promptsService.cleanup();
	}

	// Auto-initialize if in browser
	if (browser) {
		initialize();
	}

	// Return reactive interface
	return {
		// Reactive getters (these will update components automatically)
		get prompts() { return state.prompts; },
		get loading() { return state.loading; },
		get error() { return state.error; },
		get userTier() { return state.userTier; },

		// Methods
		setUserTier,
		getPromptById,
		isPromptLocked,
		getAllPrompts,
		getPromptsByCategory,
		getCategoryCounts,
		loadPrompts,
		cleanup,

		// Debug helper
		debugState: () => ({
			categoriesCount: Object.keys(state.prompts).length,
			totalPrompts: Object.values(state.prompts).flat().length,
			loading: state.loading,
			error: state.error,
			userTier: state.userTier
		})
	};
}

// Export type for components to use
export type PromptsStore = ReturnType<typeof createPromptsStore>;