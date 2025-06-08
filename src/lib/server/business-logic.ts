// src/lib/server/business-logic.ts - ALIGNED VERSION
import { adminFirestore } from '$lib/server/firebase-admin';

const TRIAL_PERIOD_DAYS = 14;

export interface UserAccess {
	tier: 'free' | 'trial' | 'pro';
	isPro: boolean;
	trialActive: boolean;
	trialDaysLeft: number;

	// Feature access flags
	features: {
		// Element access
		elements: {
			canUseBasicElements: boolean;
			canUseTrialElements: boolean;
			canUseProElements: boolean;
		};

		// Color features (aligned with client-side)
		colors: {
			canUseBasicColors: boolean;
			canUsePremiumColorSchemes: boolean;
			canUseDocumentBackgrounds: boolean;
			canUseTableBackgrounds: boolean;
		};

		// Prompts (your working UGC system)
		prompts: {
			canCreateCustom: boolean;
			canEditOwn: boolean;
			maxCustomPrompts: number;
		};

		// AI features (keep structure for future metering)
		ai: {
			canUseBasicPrompts: boolean;
			canUseAdvancedPrompts: boolean;
			canGenerateContent: boolean;
		};

		// Future features (easy to add)
		export: {
			canExportBasic: boolean;
			canExportAdvanced: boolean;
		};
	};

	// Helper methods
	canUseElement: (elementTier: string) => boolean;
	canUseColor: (colorTier: string) => boolean;
	canUsePrompt: (promptTier: string) => boolean;
	canUseFeature: (feature: string) => boolean;
}

/**
 * SINGLE SOURCE OF TRUTH for all user access logic
 */
export async function getUserAccess(uid: string): Promise<UserAccess> {
	try {
		const userDoc = await adminFirestore.collection('users').doc(uid).get();

		if (!userDoc.exists) {
			return getDefaultUserAccess();
		}

		const userData = userDoc.data()!;
		const now = new Date();

		// Calculate trial status
		let trialActive = false;
		let trialDaysLeft = 0;

		if (!userData.pro && userData.trialStartDate) {
			const trialStart = userData.trialStartDate.toDate();
			const trialEnd = new Date(trialStart);
			trialEnd.setDate(trialEnd.getDate() + TRIAL_PERIOD_DAYS);

			if (now < trialEnd) {
				trialActive = true;
				trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
			}
		}

		// Determine tier
		const tier: 'free' | 'trial' | 'pro' = userData.pro ? 'pro' : (trialActive ? 'trial' : 'free');
		const isPro = userData.pro || false;

		// Calculate feature access based on tier
		const features = calculateFeatureAccess(tier);

		// ALIGNED: Helper methods match client-side access-control.ts exactly
		const canUseElement = (elementTier: string) => {
			if (tier === 'pro' || tier === 'trial') return true; // 🔥 TRIAL GETS FULL ACCESS
			return elementTier === 'free';
		};

		const canUseColor = (colorTier: string) => {
			if (tier === 'pro' || tier === 'trial') return true; // 🔥 TRIAL GETS FULL ACCESS
			return colorTier === 'free';
		};

		const canUsePrompt = (promptTier: string) => {
			if (tier === 'pro' || tier === 'trial') return true; // 🔥 TRIAL GETS FULL ACCESS
			return promptTier === 'free';
		};

		const canUseFeature = (feature: string) => {
			const featureParts = feature.split('.');
			let current: any = features;
			for (const part of featureParts) {
				current = current[part];
				if (current === undefined) return false;
			}
			return current;
		};

		return {
			tier,
			isPro,
			trialActive,
			trialDaysLeft,
			features,
			canUseElement,
			canUseColor,
			canUsePrompt,
			canUseFeature
		};

	} catch (error) {
		console.error('Error getting user access:', error);
		return getDefaultUserAccess();
	}
}

/**
 * ALIGNED: Calculate feature access - trial users get FULL ACCESS
 */
function calculateFeatureAccess(tier: 'free' | 'trial' | 'pro') {
	switch (tier) {
		case 'pro':
			return {
				elements: {
					canUseBasicElements: true,
					canUseTrialElements: true,
					canUseProElements: true,
				},
				colors: {
					canUseBasicColors: true,
					canUsePremiumColorSchemes: true,
					canUseDocumentBackgrounds: true,
					canUseTableBackgrounds: true,
				},
				prompts: {
					canCreateCustom: true,
					canEditOwn: true,
					maxCustomPrompts: 999,
				},
				ai: {
					canUseBasicPrompts: true,
					canUseAdvancedPrompts: true,
					canGenerateContent: true,
				},
				export: {
					canExportBasic: true,
					canExportAdvanced: true,
				}
			};

		case 'trial':
			// 🔥 ALIGNED: Trial users get FULL ACCESS (matches devlog + client-side)
			return {
				elements: {
					canUseBasicElements: true,
					canUseTrialElements: true,
					canUseProElements: true, // 🔥 FULL ACCESS
				},
				colors: {
					canUseBasicColors: true,
					canUsePremiumColorSchemes: true, // 🔥 FULL ACCESS
					canUseDocumentBackgrounds: true,
					canUseTableBackgrounds: true, // 🔥 FULL ACCESS
				},
				prompts: {
					canCreateCustom: true,
					canEditOwn: true,
					maxCustomPrompts: 999, // 🔥 UNLIMITED (for now)
				},
				ai: {
					canUseBasicPrompts: true,
					canUseAdvancedPrompts: true, // 🔥 FULL ACCESS (can meter later)
					canGenerateContent: true,
				},
				export: {
					canExportBasic: true,
					canExportAdvanced: true, // 🔥 FULL ACCESS
				}
			};

		default: // free
			return {
				elements: {
					canUseBasicElements: true,
					canUseTrialElements: false,
					canUseProElements: false,
				},
				colors: {
					canUseBasicColors: true,
					canUsePremiumColorSchemes: false,
					canUseDocumentBackgrounds: false,
					canUseTableBackgrounds: false,
				},
				prompts: {
					canCreateCustom: false,
					canEditOwn: false,
					maxCustomPrompts: 0,
				},
				ai: {
					canUseBasicPrompts: false,
					canUseAdvancedPrompts: false,
					canGenerateContent: false,
				},
				export: {
					canExportBasic: false,
					canExportAdvanced: false,
				}
			};
	}
}

/**
 * Default access for new/error cases
 */
function getDefaultUserAccess(): UserAccess {
	return {
		tier: 'free',
		isPro: false,
		trialActive: false,
		trialDaysLeft: 0,
		features: calculateFeatureAccess('free'),
		canUseElement: (elementTier: string) => elementTier === 'free',
		canUseColor: (colorTier: string) => colorTier === 'free',
		canUsePrompt: (promptTier: string) => false,
		canUseFeature: () => false
	};
}

/**
 * Filter elements with access control and locking
 */
export function filterElementsWithAccess(
	allElements: any[],
	userAccess: UserAccess
): any[] {
	return allElements.map(element => ({
		...element,
		isLocked: !userAccess.canUseElement(element.metadata?.tier || 'free'),
		isAccessible: userAccess.canUseElement(element.metadata?.tier || 'free')
	}));
}

/**
 * Filter prompts with access control
 */
export function filterPromptsWithAccess(
	allPrompts: any[],
	userAccess: UserAccess
): any[] {
	return allPrompts.map(prompt => ({
		...prompt,
		isLocked: !userAccess.canUsePrompt(prompt.metadata?.tier || 'free'),
		isAccessible: userAccess.canUsePrompt(prompt.metadata?.tier || 'free')
	}));
}

/**
 * Backward compatibility - returns features in old format
 */
export function getLegacyUserFeatures(userAccess: UserAccess) {
	return {
		tier: userAccess.tier,
		isPro: userAccess.isPro,
		trialActive: userAccess.trialActive,
		trialDaysLeft: userAccess.trialDaysLeft,
		features: {
			// Map new structure to old component expectations
			canUseAI: userAccess.features.ai.canUseBasicPrompts,
			canExport: userAccess.features.export.canExportBasic,
			canCustomize: userAccess.features.colors.canUseDocumentBackgrounds,
			canUseTrialElements: userAccess.features.elements.canUseTrialElements,
			canUseProElements: userAccess.features.elements.canUseProElements,
			maxProjects: 999 // Legacy field you said you don't use
		}
	};
}