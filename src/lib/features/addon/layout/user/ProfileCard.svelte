<!-- $lib/features/addon/layout/user/ProfileCard.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { X, Mail, CheckCircle, Clock, Sparkles } from "@lucide/svelte";
  import { getUser } from '$lib/services/firebase/auth.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  import SimpleUpgradeModal from '$lib/components/pricing/SimpleUpgradeModal.svelte';
  
  // Props
  const props = $props<{
    showProfileCard: boolean;
    onToggleProfileCard: () => void;
  }>();
  
  // State
  let showUpgradeModal = $state(false);
  
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
  
  function openUpgradeModal() {
    closeCard(); // Close profile first
    showUpgradeModal = true; // Then open upgrade modal
  }
  
  function handleUpgradeModalChange(open: boolean) {
    showUpgradeModal = open;
  }
</script>

<!-- Upgrade Modal -->
<SimpleUpgradeModal isOpen={showUpgradeModal} onOpenChange={handleUpgradeModalChange} />

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
      class="bg-background rounded-lg shadow-lg w-full max-w-sm relative"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && closeCard()}
      tabindex="-1"
    >
      <!-- Big X button top right -->
      <button
        class="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition-colors"
        onclick={closeCard}
        aria-label="Close profile"
      >
        <X class="h-5 w-5" />
      </button>

      <!-- Content -->
      <div class="p-6 pt-8 space-y-6">
        
        {#if getUser()}
          <!-- User Info -->
          <div class="text-center space-y-3">
            <!-- Avatar -->
            <div class="flex justify-center">
              <Avatar.Root class="h-16 w-16">
                {#if getUser().photoURL}
                  <Avatar.Image 
                    src={getUser().photoURL} 
                    alt={getUser().displayName || 'User'} 
                  />
                {/if}
                <Avatar.Fallback class="bg-primary/10 text-primary text-lg">
                  {getInitials()}
                </Avatar.Fallback>
              </Avatar.Root>
            </div>

            <!-- Name and Email -->
            <div class="space-y-1">
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

            <!-- Subscription Badge -->
            <div class="flex justify-center">
              {#if isPro()}
                <div class="text-sm font-medium bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-2">
                  <Sparkles class="h-4 w-4" />
                  Pro Plan
                </div>
              {:else if isActive()}
                <div class="text-sm font-medium bg-amber-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <Clock class="h-4 w-4" />
                  Trial - {getDaysLeft()} {getDaysLeft() === 1 ? 'day' : 'days'} left
                </div>
              {:else}
                <div class="text-sm font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full">
                  Free Plan
                </div>
              {/if}
            </div>
          </div>

          <!-- Single Action Button -->
          <Button 
            class="w-full"
            onclick={openUpgradeModal}
          >
            {isPro() ? 'Manage Subscription' : 'Upgrade to Pro'}
          </Button>
        {/if}
      </div>

      <!-- Footer -->
      <div class="px-6 pb-4 text-center">
        <p class="text-xs text-muted-foreground">
          Pipewriter v1.0.0
        </p>
      </div>
    </div>
  </div>
{/if}