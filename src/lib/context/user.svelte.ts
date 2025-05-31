// src/lib/contexts/user.svelte.ts
import { getContext } from 'svelte';

interface UserSession {
	user: {
		uid: string;
		email: string;
		displayName?: string;
		photoURL?: string;
	} | null;
	isPro: boolean;
	trialActive: boolean;
	trialDaysLeft: number;
	features: {
		allowedElements: string[];
		allowAiFeatures: boolean;
		allowColorCustomization: boolean;
		allowStyleGuide: boolean;
		maxProjects: number;
		canExport: boolean;
	};
	// Add other properties that come from your server
	maxProjects: number;
	canExport: boolean;
}

export function createUserContext(serverData: UserSession) {
	// Server-calculated data, no complex reactivity needed
	let userData = $state(serverData);

	// Simple tier calculation (server already did the heavy lifting)
	function getUserTier(): 'free' | 'trial' | 'pro' {
		if (userData.isPro) return 'pro';
		if (userData.trialActive) return 'trial';
		return 'free';
	}

	// Simple feature checks (no complex derivations)
	function canUseElement(elementTier: 'free' | 'trial' | 'pro'): boolean {
		const userTier = getUserTier();
		if (userTier === 'pro') return true;
		if (userTier === 'trial') return elementTier !== 'pro';
		return elementTier === 'free';
	}

	function canUseFeature(featureName: keyof UserSession['features']): boolean {
		return Boolean(userData.features[featureName]);
	}

	// Update method for after server actions (like upgrading)
	function updateUserData(newData: Partial<UserSession>) {
		userData = { ...userData, ...newData };
	}

	return {
		// Reactive getters
		get user() { return userData.user; },
		get isPro() { return userData.isPro; },
		get trialActive() { return userData.trialActive; },
		get trialDaysLeft() { return userData.trialDaysLeft; },
		get features() { return userData.features; },

		// Methods
		getUserTier,
		canUseElement,
		canUseFeature,
		updateUserData,

		// Computed status for UI (matches your existing trial context API)
		get trialStatus() {
			return {
				active: userData.trialActive,
				daysLeft: userData.trialDaysLeft,
				isPro: userData.isPro,
				isPremium: userData.isPro, // Legacy compatibility
				userTier: getUserTier()
			};
		}
	};
}

// Helper to get user context
export function useUserContext() {
	const context = getContext<ReturnType<typeof createUserContext>>('userContext');

	if (!context) {
		throw new Error('useUserContext must be used within a component with UserContext');
	}

	return context;
}

// Type for components
export type UserContext = ReturnType<typeof createUserContext>;