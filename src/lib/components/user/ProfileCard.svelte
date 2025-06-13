<!-- src/lib/components/user/ProfileCard.svelte - CLEAN CARD CONTENT -->
<script lang="ts">
  import { Mail, Clock, Crown, LogOut, RefreshCw, ArrowRight } from "@lucide/svelte";
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { signOut, switchAccount } from '$lib/services/auth';
  import StatusDropdown from './StatusDropdown.svelte';
  import { dev } from '$app/environment';
  
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
    onUpgrade: () => void; // NEW: callback to navigate to upgrade
  }>();
  
  // Simple state
  let isLoggingOut = $state(false);
  let isSwitching = $state(false);
  
  // Determine current status for dropdown
  const currentStatus = $derived<'free' | 'trial' | 'pro'>(() => {
    if (props.isPro) return 'pro';
    if (props.trialActive) return 'trial';
    return 'free';
  });
  
  // Generate initials
  function getInitials() {
    if (!props.user) return '';
    
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
    
    return '';
  }
  
  // Handle logout
  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      isLoggingOut = true;
      await signOut();
    } catch (error) {
      console.error('[PROFILE] Logout failed:', error);
    } finally {
      isLoggingOut = false;
    }
  }
  
  // Handle account switch
  async function handleAccountSwitch() {
    if (isSwitching) return;
    
    try {
      isSwitching = true;
      await switchAccount();
    } catch (error) {
      console.error('[PROFILE] Account switch failed:', error);
    } finally {
      isSwitching = false;
    }
  }
</script>

<div class="p-4">
  <!-- User Info -->
  <div class="text-center space-y-4">
    <!-- Avatar -->
    <div class="flex justify-center">
      <Avatar.Root class="h-16 w-16">
        {#if props.user.photoURL}
          <Avatar.Image 
            src={props.user.photoURL} 
            alt={props.user.displayName || 'User'} 
          />
        {/if}
        <Avatar.Fallback class="bg-primary/10 text-primary text-lg font-medium">
          {getInitials()}
        </Avatar.Fallback>
      </Avatar.Root>
    </div>

    <!-- Name and Email -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">
        {props.user.displayName || 'User'}
      </h2>
      <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Mail class="h-4 w-4" />
        <span class="truncate">{props.user.email}</span>
      </div>
    </div>

    <!-- Subscription Status Badge -->
    <div class="flex justify-center">
      {#if props.isPro}
        <div class="inline-flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full">
          <Crown class="h-4 w-4" />
          Pro Plan
        </div>
      {:else if props.trialActive}
        <div class="inline-flex items-center gap-2 text-sm font-medium bg-amber-500 text-white px-4 py-2 rounded-full">
          <Clock class="h-4 w-4" />
          Trial • {props.trialDaysLeft} {props.trialDaysLeft === 1 ? 'day' : 'days'} left
        </div>
      {:else}
        <div class="inline-flex items-center text-sm font-medium bg-muted text-muted-foreground px-4 py-2 rounded-full">
          Free Plan
        </div>
      {/if}
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="space-y-3 mt-6">
    <!-- Upgrade/Manage Button -->
    <Button
      class="w-full h-10 font-medium"
      onclick={props.onUpgrade}
      disabled={isLoggingOut || isSwitching}
    >
      {#if props.isPro}
        <Crown class="h-4 w-4 mr-2" />
        Manage Subscription
      {:else}
        <Crown class="h-4 w-4 mr-2" />
        Upgrade to Pro
      {/if}
      <ArrowRight class="h-4 w-4 ml-auto" />
    </Button>

    <!-- Dev Status Dropdown -->
    {#if dev}
      <StatusDropdown 
        currentStatus={currentStatus}
        isPro={props.isPro}
        trialActive={props.trialActive}
        trialDaysLeft={props.trialDaysLeft}
        disabled={isLoggingOut || isSwitching}
      />
    {/if}

    <!-- Account Switch Button -->
		<Button 
      variant="outline"
      class="w-full h-8 text-sm"
      onclick={handleAccountSwitch}
      disabled={isLoggingOut || isSwitching}
    >
      {#if isSwitching}
        <div class="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
        Switching...
      {:else}
        <RefreshCw class="h-3 w-3 mr-2" />
        Switch account
      {/if}
    </Button>

    <!-- Logout Button -->
    <Button 
      variant="outline"
      class="w-full h-8 text-sm"
      onclick={handleLogout}
      disabled={isLoggingOut || isSwitching}
    >
      {#if isLoggingOut}
        <div class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
        Signing out...
      {:else}
        <LogOut class="h-4 w-4 mr-2" />
        Sign out
      {/if}
    </Button>
  </div>

  <!-- Footer -->
  <div class="mt-6 pt-4 border-t border-border text-center">
    <p class="text-xs text-muted-foreground">
      Pipewriter v1.0 • Made with ❤️ for writers
    </p>
  </div>
</div>