<!-- src/lib/components/user/ProfileCard.svelte - Updated with shadcn Dialog -->
<script lang="ts">
  import { Mail, Clock, Crown, LogOut, RefreshCw } from "@lucide/svelte";
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { signOut, switchAccount } from '$lib/services/auth';
  import StatusDropdown from './StatusDropdown.svelte';
  import { dev } from '$app/environment';
  
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
  
  function handleOpenChange(open: boolean) {
    if (!open) {
      props.onToggleProfileCard();
    }
  }
  
  // Navigation-based logout (no reload issues)
  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      isLoggingOut = true;
      props.onToggleProfileCard(); // Close dialog immediately
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
      props.onToggleProfileCard(); // Close dialog immediately
      await switchAccount(); // Auth service handles navigation
    } catch (error) {
      console.error('[PROFILE] Account switch failed:', error);
    } finally {
      isSwitching = false;
    }
  }
</script>

<Dialog.Root open={props.showProfileCard} onOpenChange={handleOpenChange}>
  <Dialog.Content class="__max-w-[90%] mx-4">
    <Dialog.Header>
      <Dialog.Title class="text-center">Profile</Dialog.Title>
      <Dialog.Description class="sr-only">
        User profile and account management
      </Dialog.Description>
    </Dialog.Header>
    
    {#if props.user}
      <!-- User Info -->
      <div class="text-center space-y-4 py-4">
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
				<!-- {#if dev} -->
					<StatusDropdown 
						currentStatus={currentStatus}
						isPro={props.isPro}
						trialActive={props.trialActive}
						trialDaysLeft={props.trialDaysLeft}
						disabled={isLoggingOut || isSwitching}
					/>
				<!-- {/if} -->

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

    <Dialog.Footer class="flex flex-col items-center gap-2 pt-4">
      <p class="text-xs text-muted-foreground text-center">
        Pipewriter v1.0 • Made with ❤️ for writers
      </p>
      
      <!-- Dev StatusDropdown in bottom left (dev only) -->

    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>