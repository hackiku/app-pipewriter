// src/lib/context/features.svelte.ts
import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';

export function createFeaturesContext() {
	// Feature flags
	let features = $state({
		allowedElements: ['basic'],
		allowAiFeatures: false,
		allowColorCustomization: false,
		allowStyleGuide: false,
		isPremium: false,
		trialActive: false,
		trialDaysLeft: 0
	});

	// Initialize features from server data
	function initFeatures(serverFeatures) {
		if (!browser) return;

		// Update all feature flags
		for (const [key, value] of Object.entries(serverFeatures)) {
			features[key] = value;
		}
	}

	// Utility functions
	function canUseElement(category: string): boolean {
		return features.allowedElements.includes(category);
	}

	function canUseAiFeatures(): boolean {
		return features.allowAiFeatures;
	}

	function canUseColorCustomization(): boolean {
		return features.allowColorCustomization;
	}

	function canUseStyleGuide(): boolean {
		return features.allowStyleGuide;
	}

	function isTrialActive(): boolean {
		return features.trialActive;
	}

	function isPremium(): boolean {
		return features.isPremium;
	}

	function getTrialDaysLeft(): number {
		return features.trialDaysLeft;
	}

	return {
		features,
		initFeatures,
		canUseElement,
		canUseAiFeatures,
		canUseColorCustomization,
		canUseStyleGuide,
		isTrialActive,
		isPremium,
		getTrialDaysLeft
	};
}

// Helper to get the features context
export function useFeatures() {
	const context = getContext<ReturnType<typeof createFeaturesContext>>('features');

	if (!context) {
		throw new Error('useFeatures must be used within a component with FeaturesContext');
	}

	return context;
}

// For backward compatibility with your existing code
export const initFeatures = (serverFeatures) => {
	if (browser) {
		const featuresContext = getContext<ReturnType<typeof createFeaturesContext>>('features');
		if (featuresContext) {
			featuresContext.initFeatures(serverFeatures);
		}
	}
};