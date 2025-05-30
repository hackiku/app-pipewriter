<!-- src/lib/components/user/ProfileCard.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { X, Mail, CheckCircle, Clock, Sparkles, LogOut, Crown } from "@lucide/svelte";
  import { getUser, signOut } from '$lib/services/firebase/auth.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  import SimpleUpgradeModal from '$lib/components/pricing/SimpleUpgradeModal.svelte';
  import UpgradeDrawer from '$lib/components/pricing/UpgradeDrawer.svelte';
  
  // Props
  const props = $props<{
    showProfileCard: boolean;
    onToggleProfileCard: () => void;
    upgradeComponent?: 'modal' | 'drawer';
  }>();
  
  // State
  let showUpgradeModal = $state(false);
  let showUpgradeDrawer = $state(false);
  let isLoggingOut = $state(false);
  
  // Get trial features context
  const trialFeatures = useTrialFeatures();
  
  function isPro() {
    return trialFeatures.trialInfo.isPro;
  }
  
  function isActive() {
    return trialFeatures.trialInfo.active;
  }
  
  function getDaysLeft() {
    return trialFeatures.trialInfo.daysLeft;
  }
  
  // Generate initials for avatar
  function getInitials() {
    const user = getUser();
    if (!user) return '';
    
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return '';
  }
  
  function closeCard() {
    props.onToggleProfileCard();
  }
  
  // FIXED: Smooth transition from profile to upgrade
  function openUpgradeFlow() {
    closeCard(); // Close profile first
    
    // Wait for profile card to close, then open upgrade
    setTimeout(() => {
      if (props.upgradeComponent === 'drawer') {
        showUpgradeDrawer = true;
      } else {
        showUpgradeModal = true;
      }
    }, 200); // Match the fade transition duration
  }
  
  function handleUpgradeModalChange(open: boolean) {
    showUpgradeModal = open;
  }
  
  function handleUpgradeDrawerChange(open: boolean) {
    showUpgradeDrawer = open;
  }
  
  async function handleLogout() {
    try {
      isLoggingOut = true;
      await signOut();
      closeCard(); // Close profile card after logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Could add toast notification here
    } finally {
      isLoggingOut = false;
    }
  }
</script>

<!-- Upgrade Components -->
<SimpleUpgradeModal isOpen={showUpgradeModal} onOpenChange={handleUpgradeModalChange} />
<UpgradeDrawer isOpen={showUpgradeDrawer} onOpenChange={handleUpgradeDrawerChange} />

{#if props.showProfileCard}
  <!-- Backdrop with proper ESC handling -->
  <div 
    class="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={closeCard}
    role="dialog"
    aria-modal="true"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 200 }}
  >
    <!-- Modal Content -->
    <div 
      class="bg-background rounded-lg shadow-lg w-full max-w-sm relative border"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && closeCard()}
      tabindex="-1"
    >
      <!-- Close button -->
      <button
        class="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
        onclick={closeCard}
        aria-label="Close profile"
      >
        <X class="h-4 w-4" />
      </button>

      <!-- Content -->
      <div class="p-6 pt-8 space-y-6">
        
        {#if getUser()}
          <!-- User Info -->
          <div class="text-center space-y-4">
            <!-- Avatar -->
            <div class="flex justify-center">
              <Avatar.Root class="h-16 w-16">
                {#if getUser().photoURL}
                  <Avatar.Image 
                    src={getUser().photoURL} 
                    alt={getUser().displayName || 'User'} 
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
                {getUser().displayName || 'User'}
              </h2>
              {#if getUser().email}
                <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail class="h-4 w-4" />
                  <span class="truncate">{getUser().email}</span>
                </div>
              {/if}
            </div>

            <!-- Subscription Status Badge -->
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

          <!-- Action Buttons -->
          <div class="space-y-3">
            <!-- Primary Action Button -->
            <Button 
              class="w-full h-11 font-medium"
              onclick={openUpgradeFlow}
            >
              {#if isPro()}
                <Sparkles class="h-4 w-4 mr-2" />
                Manage Subscription
              {:else}
                <Sparkles class="h-4 w-4 mr-2" />
                Upgrade to Pro
              {/if}
            </Button>

            <!-- Logout Button -->
            <Button 
              variant="outline"
              class="w-full h-11"
              onclick={handleLogout}
              disabled={isLoggingOut}
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

      <!-- Footer -->
      <div class="px-6 pb-4 text-center border-t pt-4">
        <p class="text-xs text-muted-foreground">
          Pipewriter v1.0 • Made with ❤️ for writers
        </p>
      </div>
    </div>
  </div>
{/if}