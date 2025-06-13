<!-- src/lib/components/user/UserDrawer.svelte - FINAL WITH HIDDEN SCROLLBAR -->
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

  // HACK: Simplify state management - let drawer handle open/close naturally
  let currentView: 'profile' | 'upgrade' = $state('profile');
  let internalOpen = $state(props.isOpen);
  
  // HACK: Track when user intentionally navigates vs when drawer auto-closes
  let userNavigating = $state(false);
  
  // Sync internal open state with props
  $effect(() => {
    if (props.isOpen !== internalOpen && !userNavigating) {
      internalOpen = props.isOpen;
      // Always reset to profile when drawer opens
      if (props.isOpen) {
        currentView = 'profile';
      }
    }
  });

  // HACK: Simple navigation without blocking drawer lifecycle
  function navigateToUpgrade() {
    console.log('🚀 Navigating to upgrade');
    userNavigating = true;
    currentView = 'upgrade';
    
    // Release navigation lock after a brief moment
    setTimeout(() => {
      userNavigating = false;
    }, 100);
  }

  function navigateToProfile() {
    console.log('🔙 Navigating to profile');
    userNavigating = true;
    currentView = 'profile';
    
    setTimeout(() => {
      userNavigating = false;
    }, 100);
  }

  // Handle upgrade button from ProfileCard
  function handleUpgradeClick() {
    console.log('💎 Upgrade clicked from ProfileCard');
    navigateToUpgrade();
  }

  // Handle back button from UpgradeCard
  function handleBackToProfile() {
    console.log('⬅️ Back clicked from UpgradeCard');
    navigateToProfile();
  }

  // HACK: Let drawer close naturally, just sync the state
  function handleOpenChange(open: boolean) {
    console.log('📱 Drawer open change:', open, 'userNavigating:', userNavigating);
    
    internalOpen = open;
    
    // Always propagate to parent unless we're in the middle of navigation
    if (!userNavigating) {
      props.onOpenChange(open);
      
      // Reset to profile when drawer closes
      if (!open) {
        currentView = 'profile';
      }
    }
  }

  // Handle navigation dots
  function handleNavDot(view: 'profile' | 'upgrade') {
    if (view === 'upgrade') {
      navigateToUpgrade();
    } else {
      navigateToProfile();
    }
  }
</script>

<!-- FINAL: Keep your max-h-[90%] and mx-4 -->
<Drawer.Root open={internalOpen} onOpenChange={handleOpenChange}>
  <Drawer.Content class="max-h-[90%] mx-4">
    <div class="mx-auto w-full max-w-md">
      
      <!-- FINAL: Add hidden scrollbar to the sliding container -->
      <div class="relative overflow-hidden">
        
        <!-- Profile View with individual scrolling -->
        <div
          class={cn(
            "scrollable-content transition-transform duration-300 ease-out",
            currentView === 'profile' ? 'translate-x-0' : '-translate-x-full'
          )}
          style="min-height: 200px;"
        >
          <ProfileCard
            user={props.user}
            isPro={props.isPro}
            trialActive={props.trialActive}
            trialDaysLeft={props.trialDaysLeft}
            onSignOut={props.onSignOut}
            onUpgrade={handleUpgradeClick}
          />
        </div>

        <!-- Upgrade View with individual scrolling - Always render but position absolutely -->
        <div
          class={cn(
            "scrollable-content absolute top-0 left-0 w-full transition-transform duration-300 ease-out",
            currentView === 'upgrade' ? 'translate-x-0' : 'translate-x-full'
          )}
          style="min-height: 400px;"
        >
          <UpgradeCard
            isPro={props.isPro}
            trialActive={props.trialActive}
            trialDaysLeft={props.trialDaysLeft}
            onBack={handleBackToProfile}
          />
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
            onclick={() => handleNavDot('profile')}
            aria-label="Profile"
          ></button>
          
          <button
            class={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              currentView === 'upgrade' 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
            )}
            onclick={() => handleNavDot('upgrade')}
            aria-label="Upgrade"
          ></button>
        </div>
      </Drawer.Footer>

    </div>
  </Drawer.Content>
</Drawer.Root>

<style>
  /* FINAL: Hidden scrollbar for smooth overflow */
  .scrollable-content {
    max-height: calc(90vh - 120px); /* Account for footer and drawer chrome */
    overflow-y: auto;
    overflow-x: hidden;
    
    /* Hide scrollbar for WebKit browsers */
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  .scrollable-content::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  /* Smooth scrolling */
  .scrollable-content {
    scroll-behavior: smooth;
  }
</style>