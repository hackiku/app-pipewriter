// src/lib/context/trial.svelte.ts
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
		isPro: false
	});

	// ENHANCED: Initialize from server data with better reactivity
	function initFeatures(serverData: any) {
		if (!browser) return;

		console.log('Initializing trial features with server data:', serverData);

		// Update features object properties individually to maintain reactivity
		if (serverData.features) {
			features.allowedElements = serverData.features.allowedElements || ['basic'];
			features.allowAiFeatures = serverData.features.allowAiFeatures || false;
			features.allowColorCustomization = serverData.features.allowColorCustomization || false;
			features.allowStyleGuide = serverData.features.allowStyleGuide || false;
			features.maxProjects = serverData.features.maxProjects || 3;
			features.canExport = serverData.features.canExport || false;
		}

		// Update trial info individually to maintain reactivity
		trialInfo.active = serverData.trialActive || false;
		trialInfo.daysLeft = serverData.trialDaysLeft || 0;
		trialInfo.startDate = serverData.trialStartDate || null;
		trialInfo.isPro = serverData.isPro || false;

		console.log('Trial context initialized:', {
			isPro: trialInfo.isPro,
			active: trialInfo.active,
			daysLeft: trialInfo.daysLeft,
			features: features
		});
	}

	// ENHANCED: Feature check functions with better logic
	function canUseFeature(featureName: keyof FeatureFlags): boolean {
		// Pro users can use everything
		if (trialInfo.isPro) return true;

		// Active trial users can use trial features
		if (trialInfo.active) {
			return Boolean(features[featureName]);
		}

		// Free users get basic features only
		const freeFeatures: (keyof FeatureFlags)[] = ['maxProjects'];
		return freeFeatures.includes(featureName) ? Boolean(features[featureName]) : false;
	}

	function canUseElement(elementTier: string): boolean {
		// Pro users can use all elements
		if (trialInfo.isPro) return true;

		// Trial users can use free and trial elements
		if (trialInfo.active) return elementTier === 'free' || elementTier === 'trial';

		// Free users can only use free elements
		return elementTier === 'free';
	}

	// ENHANCED: Get user tier for element filtering
	function getUserTier(): 'free' | 'trial' | 'pro' {
		if (trialInfo.isPro) return 'pro';
		if (trialInfo.active) return 'trial';
		return 'free';
	}

	function getTrialStatus() {
		return {
			active: trialInfo.active,
			daysLeft: trialInfo.daysLeft,
			isPro: trialInfo.isPro,
			isPremium: trialInfo.isPro, // Legacy compatibility
			trialExpired: !trialInfo.active && trialInfo.daysLeft === 0 && !trialInfo.isPro,
			userTier: getUserTier()
		};
	}

	// ENHANCED: Debug function for development
	function debugTrialState() {
		console.log('=== TRIAL DEBUG STATE ===');
		console.log('trialInfo:', trialInfo);
		console.log('features:', features);
		console.log('canUseAI:', canUseFeature('allowAiFeatures'));
		console.log('canUseColors:', canUseFeature('allowColorCustomization'));
		console.log('canExport:', canUseFeature('canExport'));
		console.log('userTier:', getUserTier());
		console.log('========================');
	}

	return {
		// Reactive state
		features,
		trialInfo,

		// Methods
		initFeatures,
		canUseFeature,
		canUseElement,
		getUserTier,
		getTrialStatus,
		debugTrialState
	};
}

// Helper to get trial context with better error handling
export function useTrialFeatures() {
	const context = getContext<ReturnType<typeof createTrialContext>>('trialFeatures');

	if (!context) {
		console.error('useTrialFeatures must be used within a component with TrialContext');
		throw new Error('useTrialFeatures must be used within a component with TrialContext');
	}

	return context;
}