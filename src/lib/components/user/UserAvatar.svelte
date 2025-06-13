<!-- src/lib/components/user/UserAvatar.svelte - NEW TASTEFUL DESIGN -->
<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Crown, Clock } from '@lucide/svelte';
  import { cn } from '$lib/utils';
  import UserDrawer from './UserDrawer.svelte';

  // Props
  const props = $props<{
    user: {
      uid: string;
      email: string;
      displayName?: string;
      photoURL?: string;
    };
    isPro: boolean;
    trialActive: boolean;
    trialDaysLeft: number;
    onSignOut: () => Promise<void>;
  }>();

  // Local state
  let showDrawer = $state(false);

  // QUICK TESTING: Switch between badge styles here
  const BADGE_STYLE: 'dot' | 'ring' | 'corner' | 'minimal' | 'none' = 'dot';

  // Get subscription status
  function getSubscriptionStatus() {
    if (props.isPro) return "pro";
    if (props.trialActive) return "trial";
    return "free";
  }

  // Generate initials for fallback
  function getInitials() {
    if (props.user.displayName) {
      return props.user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    if (props.user.email) {
      return props.user.email[0].toUpperCase();
    }

    return 'U';
  }

  function toggleDrawer() {
    showDrawer = !showDrawer;
  }

  // Badge Style Options
  function getDotBadge() {
    const status = getSubscriptionStatus();
    const dotColors = {
      pro: 'bg-emerald-500',
      trial: 'bg-amber-500', 
      free: 'bg-neutral-400'
    };
    
    return `absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${dotColors[status]}`;
  }

  function getRingClass() {
    const status = getSubscriptionStatus();
    const ringColors = {
      pro: 'ring-emerald-500',
      trial: 'ring-amber-500',
      free: 'ring-neutral-300'
    };
    
    return `ring-2 ring-offset-1 ${ringColors[status]}`;
  }

  function getCornerBadge() {
    const status = getSubscriptionStatus();
    const cornerColors = {
      pro: 'border-t-emerald-500',
      trial: 'border-t-amber-500',
      free: 'border-t-neutral-400'
    };
    
    return `absolute top-0 right-0 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] ${cornerColors[status]}`;
  }

  function getMinimalBadge() {
    const status = getSubscriptionStatus();
    const icons = {
      pro: Crown,
      trial: Clock,
      free: null
    };
    const colors = {
      pro: 'bg-emerald-500/90 text-white',
      trial: 'bg-amber-500/90 text-white',
      free: 'bg-neutral-400/90 text-white'
    };

    return { icon: icons[status], colorClass: colors[status] };
  }
</script>

<div class="relative">
  <button
    class="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-all duration-200 hover:scale-105"
    onclick={toggleDrawer}
    aria-label="Open profile"
  >
    <Avatar.Root class={cn(
      "h-8 w-8 transition-all duration-200",
      BADGE_STYLE === 'ring' && getRingClass()
    )}>
      {#if props.user.photoURL}
        <Avatar.Image 
          src={props.user.photoURL} 
          alt="User avatar" 
        />
      {/if}
      <Avatar.Fallback class="bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium text-sm">
        {getInitials()}
      </Avatar.Fallback>
    </Avatar.Root>
    
    <!-- Badge Style A: Dot Indicator -->
    {#if BADGE_STYLE === 'dot'}
      <div class={getDotBadge()}></div>
    {/if}

    <!-- Badge Style C: Corner Notch -->
    {#if BADGE_STYLE === 'corner'}
      <div class={getCornerBadge()}></div>
    {/if}

    <!-- Badge Style D: Minimal Icon -->
    {#if BADGE_STYLE === 'minimal'}
      {@const minimal = getMinimalBadge()}
      {#if minimal.icon}
        <div class={cn(
          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center",
          minimal.colorClass
        )}>
          <svelte:component this={minimal.icon} class="w-2 h-2" />
        </div>
      {/if}
    {/if}
  </button>
  
  <!-- User Drawer -->
  <UserDrawer 
    isOpen={showDrawer}
    onOpenChange={(open) => showDrawer = open}
    user={props.user}
    isPro={props.isPro}
    trialActive={props.trialActive}
    trialDaysLeft={props.trialDaysLeft}
    onSignOut={props.onSignOut}
  />
</div>