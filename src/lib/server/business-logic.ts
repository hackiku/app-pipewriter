// src/lib/server/business-logic.ts
export interface UserTierAccess {
  tier: 'free' | 'trial' | 'pro';
  isPro: boolean;
  trialActive: boolean;
  trialDaysLeft: number;
  canUseElement: (elementTier: string) => boolean;
  canUsePrompt: (promptTier: string) => boolean;
  canUseFeature: (feature: string) => boolean;
}

/**
 * SINGLE SOURCE OF TRUTH for all business logic
 * Called server-side only, passed as props to components
 */
export function calculateUserAccess(userData: any): UserTierAccess {
  const now = new Date();
  const trialStart = userData.trialStartDate?.toDate?.() || userData.trialStartDate;

  // Calculate trial status
  let trialActive = false;
  let trialDaysLeft = 0;

  if (trialStart && !userData.pro) {
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 14); // 14 day trial

    if (now < trialEnd) {
      trialActive = true;
      trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  // Determine tier
  const tier: 'free' | 'trial' | 'pro' = userData.pro ? 'pro' : trialActive ? 'trial' : 'free';

  return {
    tier,
    isPro: userData.pro || false,
    trialActive,
    trialDaysLeft,

    canUseElement: (elementTier: string) => {
      if (tier === 'pro') return true;
      if (tier === 'trial') return elementTier !== 'pro';
      return elementTier === 'free';
    },

    canUsePrompt: (promptTier: string) => {
      if (tier === 'pro') return true;
      if (tier === 'trial') return promptTier !== 'pro';
      return promptTier === 'free';
    },

    canUseFeature: (feature: string) => {
      const proFeatures = ['export', 'advanced-styling', 'ai-generation'];
      const trialFeatures = ['basic-styling', 'some-elements'];

      if (tier === 'pro') return true;
      if (tier === 'trial') return !proFeatures.includes(feature);
      return !proFeatures.includes(feature) && !trialFeatures.includes(feature);
    }
  };
}

/**
 * Filter elements based on user access + mark locked status
 */
export function filterElementsWithAccess(
  allElements: any[],
  userAccess: UserTierAccess
): any[] {
  return allElements.map(element => ({
    ...element,
    isLocked: !userAccess.canUseElement(element.metadata?.tier || 'free'),
    isAccessible: userAccess.canUseElement(element.metadata?.tier || 'free')
  }));
}

/**
 * Filter prompts based on user access + mark locked status
 */
export function filterPromptsWithAccess(
  allPrompts: any[],
  userAccess: UserTierAccess
): any[] {
  return allPrompts.map(prompt => ({
    ...prompt,
    isLocked: !userAccess.canUsePrompt(prompt.metadata?.tier || 'free'),
    isAccessible: userAccess.canUsePrompt(prompt.metadata?.tier || 'free')
  }));
}
