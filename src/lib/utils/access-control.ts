// src/lib/utils/access-control.ts
// Client-side utilities that mirror server-side business logic

export interface SerializedUserAccess {
	tier: 'free' | 'trial' | 'pro';
	isPro: boolean;
	trialActive: boolean;
	trialDaysLeft: number;
	features: {
		elements: {
			canUseBasicElements: boolean;
			canUseTrialElements: boolean;
			canUseProElements: boolean;
		};
		colors: {
			canUseBasicColors: boolean;
			canUsePremiumColorSchemes: boolean;
			canUseDocumentBackgrounds: boolean;
			canUseTableBackgrounds: boolean;
		};
		prompts: {
			canCreateCustom: boolean;
			canEditOwn: boolean;
			maxCustomPrompts: number;
		};
		ai: {
			canUseBasicPrompts: boolean;
			canUseAdvancedPrompts: boolean;
			canGenerateContent: boolean;
		};
		export: {
			canExportBasic: boolean;
			canExportAdvanced: boolean;
		};
	};
}

export interface AccessControlUtils {
	// Core access methods (recreated from server-side logic)
	canUseElement: (elementTier: string) => boolean;
	canUseColor: (colorTier: string) => boolean;
	canUsePrompt: (promptTier: string) => boolean;
	canUseFeature: (featurePath: string) => boolean;

	// UI helper methods
	shouldShowUpgrade: (requiredTier: string) => boolean;
	getRequiredTierForFeature: (featureTier: string) => 'trial' | 'pro' | null;
	getUpgradeMessage: (featureTier: string) => string;

	// Direct access to user data
	userAccess: SerializedUserAccess;
}

/**
 * Creates client-side access control utilities from serialized user access data
 * This recreates the server-side helper methods using client-side data
 */
export function createAccessControlUtils(userAccess: SerializedUserAccess): AccessControlUtils {

	// Recreate server-side canUseElement logic
	const canUseElement = (elementTier: string): boolean => {
		if (userAccess.tier === 'pro') return true;
		if (userAccess.tier === 'trial') return elementTier !== 'pro';
		return elementTier === 'free';
	};

	// Recreate server-side canUseColor logic
	const canUseColor = (colorTier: string): boolean => {
		if (userAccess.tier === 'pro') return true;
		if (userAccess.tier === 'trial') return colorTier !== 'pro';
		return colorTier === 'free';
	};

	// Recreate server-side canUsePrompt logic
	const canUsePrompt = (promptTier: string): boolean => {
		if (userAccess.tier === 'pro') return true;
		if (userAccess.tier === 'trial') return promptTier !== 'pro';
		return promptTier === 'free';
	};

	// Recreate server-side canUseFeature logic
	const canUseFeature = (featurePath: string): boolean => {
		const featureParts = featurePath.split('.');
		let current: any = userAccess.features;

		for (const part of featureParts) {
			current = current[part];
			if (current === undefined) return false;
		}

		return current;
	};

	// UI helper: determine if upgrade prompt should be shown
	const shouldShowUpgrade = (requiredTier: string): boolean => {
		if (requiredTier === 'free') return false;
		if (requiredTier === 'trial') return userAccess.tier === 'free';
		if (requiredTier === 'pro') return userAccess.tier !== 'pro';
		return false;
	};

	// UI helper: get the minimum tier required for a feature
	const getRequiredTierForFeature = (featureTier: string): 'trial' | 'pro' | null => {
		if (featureTier === 'free') return null;
		if (featureTier === 'trial') return 'trial';
		if (featureTier === 'pro') return 'pro';
		return null;
	};

	// UI helper: get appropriate upgrade message
	const getUpgradeMessage = (featureTier: string): string => {
		if (featureTier === 'trial' && userAccess.tier === 'free') {
			return 'Start free trial to access this feature';
		}
		if (featureTier === 'pro' && userAccess.tier !== 'pro') {
			return 'Upgrade to Pro to access this feature';
		}
		return 'Upgrade required to access this feature';
	};

	return {
		canUseElement,
		canUseColor,
		canUsePrompt,
		canUseFeature,
		shouldShowUpgrade,
		getRequiredTierForFeature,
		getUpgradeMessage,
		userAccess
	};
}

/**
 * Convenience hook for components that need access control
 * Usage: const access = useAccessControl(userAccess);
 */
export function useAccessControl(userAccess: SerializedUserAccess): AccessControlUtils {
	return createAccessControlUtils(userAccess);
}