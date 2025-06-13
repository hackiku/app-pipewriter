<!-- src/lib/components/user/UserDrawer.svelte -->
<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { cn } from '$lib/utils';
  import ProfileCard from './ProfileCard.svelte';
  import UpgradeCard from '../pricing/UpgradeCard.svelte';

  // Props
  const props = $props<{
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
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
  let currentView: 'profile' | 'upgrade' = $state('profile');
  let isSliding = $state(false);

  // Reset to profile view when drawer opens
  $effect(() => {
    if (props.isOpen) {
      currentView = 'profile';
      isSliding = false;
    }
  });

  // Navigate between views
  function navigateToUpgrade() {
    if (isSliding) return;
    isSliding = true;
    currentView = 'upgrade';
    setTimeout(() => isSliding = false, 300);
  }

  function navigateToProfile() {
    if (isSliding) return;
    isSliding = true;
    currentView = 'profile';
    setTimeout(() => isSliding = false, 300);
  }

  // Handle upgrade button click from profile
  function handleUpgradeClick() {
    navigateToUpgrade();
  }

  // Handle back from upgrade
  function handleBackToProfile() {
    navigateToProfile();
  }

  // Handle drawer close
  function handleOpenChange(open: boolean) {
    if (!isSliding) {
      props.onOpenChange(open);
    }
  }
</script>

<Drawer.Root open={props.isOpen} onOpenChange={handleOpenChange}>
  <Drawer.Content class="max-h-[85vh]">
    <div class="mx-auto w-full max-w-md">
      
      <!-- Sliding Content Container -->
      <div class="relative overflow-hidden">
        <!-- Profile Card -->
        <div
          class={cn(
            "transition-transform duration-300 ease-out",
            currentView === 'profile' ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {#if currentView === 'profile' || isSliding}
            <ProfileCard
              user={props.user}
              isPro={props.isPro}
              trialActive={props.trialActive}
              trialDaysLeft={props.trialDaysLeft}
              onSignOut={props.onSignOut}
              onUpgrade={handleUpgradeClick}
            />
          {/if}
        </div>

        <!-- Upgrade Card -->
        <div
          class={cn(
            "absolute top-0 left-0 w-full transition-transform duration-300 ease-out",
            currentView === 'upgrade' ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {#if currentView === 'upgrade' || isSliding}
            <UpgradeCard
              isPro={props.isPro}
              trialActive={props.trialActive}
              trialDaysLeft={props.trialDaysLeft}
              onBack={handleBackToProfile}
            />
          {/if}
        </div>
      </div>

      <!-- Navigation Dots Footer -->
      <Drawer.Footer class="pt-2 pb-4">
        <div class="flex justify-center items-center gap-2">
          <button
            class={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              currentView === 'profile' 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
            )}
            onclick={navigateToProfile}
            disabled={isSliding}
            aria-label="Profile"
          ></button>
          
          <button
            class={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              currentView === 'upgrade' 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
            )}
            onclick={navigateToUpgrade}
            disabled={isSliding}
            aria-label="Upgrade"
          ></button>
        </div>
      </Drawer.Footer>

    </div>
  </Drawer.Content>
</Drawer.Root>