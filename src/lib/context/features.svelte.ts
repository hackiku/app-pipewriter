// src/lib/context/features.svelte/ts
import { browser } from '$app/environment';
import { getContext } from 'svelte';

// Feature flags
export const featureFlags = $state({
	allowedElements: ['basic'],
	allowAiFeatures: false,
	allowColorCustomization: false,
	allowStyleGuide: false,
	isPremium: false,
	trialActive: false,
	trialDaysLeft: 0
});

// Initialize features from server data
export function initFeatures(serverFeatures) {
	if (!browser) return;

	// Update all feature flags
	for (const [key, value] of Object.entries(serverFeatures)) {
		featureFlags[key] = value;
	}
}

// Utility functions
export function canUseElement(category: string): boolean {
	return featureFlags.allowedElements.includes(category);
}

export function canUseAiFeatures(): boolean {
	return featureFlags.allowAiFeatures;
}

export function canUseColorCustomization(): boolean {
	return featureFlags.allowColorCustomization;
}

export function canUseStyleGuide(): boolean {
	return featureFlags.allowStyleGuide;
}

export function isTrialActive(): boolean {
	return featureFlags.trialActive;
}

export function isPremium(): boolean {
	return featureFlags.isPremium;
}

export function getTrialDaysLeft(): number {
	return featureFlags.trialDaysLeft;
}