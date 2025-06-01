<!-- src/lib/components/user/ProfileCard.svelte - Updated with StatusDropdown -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { X, Mail, Clock, Crown, LogOut, RefreshCw } from "@lucide/svelte";
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { signOut, switchAccount } from '$lib/services/auth';
  import StatusDropdown from './StatusDropdown.svelte';
  
  // Props
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
  
  function closeCard() {
    props.onToggleProfileCard();
  }
  
  // Navigation-based logout (no reload issues)
  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      isLoggingOut = true;
      closeCard(); // Close immediately
      await signOut(); // Auth service handles navigation
    } catch (error) {
      console.error('[PROFILE] Logout failed:', error);
    } finally {
      isLoggingOut = false;
    }
  }
  
  // Navigation-based account switch
  async function handleAccountSwitch() {
    if (isSwitching) return;
    
    try {
      isSwitching = true;
      closeCard(); // Close immediately
      await switchAccount(); // Auth service handles navigation
    } catch (error) {
      console.error('[PROFILE] Account switch failed:', error);
    } finally {
      isSwitching = false;
    }
  }
</script>

{#if props.showProfileCard}
  <div 
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={closeCard}
    role="dialog"
    aria-modal="true"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 200 }}
  >
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
        {#if props.user}
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
          <div class="space-y-3">
            <!-- Status Dropdown (Dev) / Upgrade Button (Prod) -->
            <StatusDropdown 
              currentStatus={currentStatus}
              isPro={props.isPro}
              trialActive={props.trialActive}
              trialDaysLeft={props.trialDaysLeft}
              disabled={isLoggingOut || isSwitching}
            />

            <!-- Account Switch Button -->
            <Button 
              variant="outline"
              class="w-full h-9 text-sm"
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
              class="w-full h-11"
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