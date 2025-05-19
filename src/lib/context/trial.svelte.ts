// lib/context/trial.svelte.ts
import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';

export interface FeatureFlags {
	allowedElements: string[];
	allowAiFeatures: boolean;
	allowColorCustomization: boolean;
	allowStyleGuide: boolean;
	maxProjects: number;
	canExport: boolean;
}

export function createTrialContext() {
	// Feature flags with reactive state
	let features = $state<FeatureFlags>({
		allowedElements: ['basic'],
		allowAiFeatures: false,
		allowColorCustomization: false,
		allowStyleGuide: false,
		maxProjects: 3,
		canExport: false
	});

	let trialInfo = $state({
		active: false,
		daysLeft: 0,
		startDate: null,
		isPremium: false
	});

	// Initialize from server data - FIXED to avoid circular reference
	function initFeatures(serverData) {
		if (!browser) return;

		// Update properties individually instead of reassigning the whole object
		if (serverData.features) {
			// Update features individually
			for (const [key, value] of Object.entries(serverData.features)) {
				// Using $effect.root to avoid reactivity loops
				features[key] = value;
			}
		}

		// Update trial info individually
		trialInfo.active = serverData.trialActive || false;
		trialInfo.daysLeft = serverData.trialDaysLeft || 0;
		trialInfo.startDate = serverData.trialStartDate || null;
		trialInfo.isPremium = serverData.isPremium || false;
	}

	// Feature check functions 
	function canUseFeature(featureName: keyof FeatureFlags): boolean {
		if (trialInfo.isPremium) return true;
		if (!trialInfo.active) return false;

		return Boolean(features[featureName]);
	}

	function canUseElement(category: string): boolean {
		return features.allowedElements.includes(category);
	}

	function getTrialStatus() {
		return {
			active: trialInfo.active,
			daysLeft: trialInfo.daysLeft,
			isPremium: trialInfo.isPremium,
			trialExpired: !trialInfo.active && trialInfo.daysLeft === 0 && !trialInfo.isPremium
		};
	}

	return {
		features,
		trialInfo,
		initFeatures,
		canUseFeature,
		canUseElement,
		getTrialStatus
	};
}

// Helper to get trial context
export function useTrialFeatures() {
	const context = getContext<ReturnType<typeof createTrialContext>>('trialFeatures');

	if (!context) {
		throw new Error('useTrialFeatures must be used within a component with TrialContext');
	}

	return context;
}