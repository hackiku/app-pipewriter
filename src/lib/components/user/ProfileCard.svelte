<!-- src/lib/components/user/ProfileCard.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { X, Mail, CheckCircle, Clock, Sparkles, LogOut, Crown } from "@lucide/svelte";
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import UpgradeDrawer from '$lib/components/pricing/UpgradeDrawer.svelte';
  
  // Props instead of contexts - same functionality
  const props = $props<{
    showProfileCard: boolean;
    onToggleProfileCard: () => void;
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
  
  // State - SAME AS BEFORE
  let showUpgradeDrawer = $state(false);
  let isLoggingOut = $state(false);
  let isTransitioning = $state(false); // ADDED: Prevent double-opens
  
  // Functions using props instead of contexts - SAME LOGIC
  function isPro() {
    return props.isPro;
  }
  
  function isActive() {
    return props.trialActive;
  }
  
  function getDaysLeft() {
    return props.trialDaysLeft;
  }
  
  // Generate initials for avatar - SAME LOGIC
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
  
  function closeCard() {
    props.onToggleProfileCard();
  }
  
  // SAME MODAL TRANSITION LOGIC
  function openUpgradeFlow() {
    if (isTransitioning) return; // Prevent double-opens
    
    isTransitioning = true;
    
    // Close profile card immediately
    closeCard();
    
    // Wait for ProfileCard fade out + a bit extra for safety
    setTimeout(() => {
      showUpgradeDrawer = true;
      isTransitioning = false;
    }, 250); // Slightly longer than fade duration
  }
  
  // SAME DRAWER STATE MANAGEMENT
  function handleUpgradeDrawerChange(open: boolean) {
    showUpgradeDrawer = open;
    
    // Reset transitioning state when drawer closes
    if (!open) {
      isTransitioning = false;
    }
  }
  
  async function handleLogout() {
    try {
      isLoggingOut = true;
      await props.onSignOut();
      closeCard(); // Close profile card after logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Could add toast notification here
    } finally {
      isLoggingOut = false;
    }
  }
  
  // SAME RENDER LOGIC
  let shouldRenderDrawer = $derived(!props.showProfileCard && showUpgradeDrawer);
</script>

<!-- SAME AS BEFORE: Only render drawer when profile is fully closed -->
{#if shouldRenderDrawer}
  <UpgradeDrawer isOpen={showUpgradeDrawer} onOpenChange={handleUpgradeDrawerChange} />
{/if}

{#if props.showProfileCard}
  <!-- Profile Modal with SAME styling -->
  <a 
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={closeCard}
		href="/"
		type="button"
    role="dialog"
		tabindex=0
    aria-modal="true"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 200 }}
  >
    <!-- Modal Content - SAME AS BEFORE -->
    <div 
      class="bg-background rounded-lg shadow-lg w-full max-w-sm relative border"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && closeCard()}
      tabindex="-1"
    >
      <!-- Close button - SAME AS BEFORE -->
      <button
        class="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
        onclick={closeCard}
        aria-label="Close profile"
      >
        <X class="h-4 w-4" />
      </button>

      <!-- Content - SAME AS BEFORE -->
      <div class="p-6 pt-8 space-y-6">
        
        {#if props.user}
          <!-- User Info - SAME AS BEFORE -->
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

            <!-- Name and Email - SAME AS BEFORE -->
            <div class="space-y-2">
              <h2 class="text-lg font-semibold">
                {props.user.displayName || 'User'}
              </h2>
              {#if props.user.email}
                <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail class="h-4 w-4" />
                  <span class="truncate">{props.user.email}</span>
                </div>
              {/if}
            </div>

            <!-- Subscription Status Badge - SAME AS BEFORE -->
            <div class="flex justify-center">
              {#if isPro()}
                <div class="inline-flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full">
                  <Crown class="h-4 w-4" />
                  Pro Plan
                </div>
              {:else if isActive()}
                <div class="inline-flex items-center gap-2 text-sm font-medium bg-amber-500 text-white px-4 py-2 rounded-full">
                  <Clock class="h-4 w-4" />
                  Trial • {getDaysLeft()} {getDaysLeft() === 1 ? 'day' : 'days'} left
                </div>
              {:else}
                <div class="inline-flex items-center text-sm font-medium bg-muted text-muted-foreground px-4 py-2 rounded-full">
                  Free Plan
                </div>
              {/if}
            </div>
          </div>

          <!-- Action Buttons - SAME AS BEFORE -->
          <div class="space-y-3">
            <!-- Upgrade Button with proper disabled state - SAME AS BEFORE -->
            <Button 
              class="w-full h-11 font-medium"
              onclick={openUpgradeFlow}
              disabled={isTransitioning}
            >
              {#if isTransitioning}
                <div class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Opening...
              {:else if isPro()}
                <Sparkles class="h-4 w-4 mr-2" />
                Manage Subscription
              {:else}
                <Sparkles class="h-4 w-4 mr-2" />
                Upgrade to Pro
              {/if}
            </Button>

            <!-- Logout Button - SAME AS BEFORE -->
            <Button 
              variant="outline"
              class="w-full h-11"
              onclick={handleLogout}
              disabled={isLoggingOut || isTransitioning}
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
        {/if}
      </div>

      <!-- Footer - SAME AS BEFORE -->
      <div class="px-6 pb-4 text-center border-t pt-4">
        <p class="text-xs text-muted-foreground">
          Pipewriter v1.0 • Made with ❤️ for writers
        </p>
      </div>
    </div>
  </a>
{/if}