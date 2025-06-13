<!-- src/lib/features/addon/layout/BottomBar.svelte - CLEANED WITH INFO BUTTON -->
<script lang="ts">
  import { Info } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import AppAbout from './AppAbout.svelte';
  import UserAvatar from '$lib/components/user/UserAvatar.svelte';
  
  // Props
  const props = $props<{
    onToggleAboutModal: () => void;
    user: any;
    isPro: boolean;
    trialActive: boolean;
    trialDaysLeft: number;
    onSignOut: () => Promise<void>;
  }>();
  
  // State variables
  let showAboutModal = $state(false);
  
  function toggleAboutModal() {
    showAboutModal = !showAboutModal;
    if (typeof props.onToggleAboutModal === 'function') {
      props.onToggleAboutModal();
    }
  }
</script>

<div class="w-full pr-3.5 h-12 flex items-center justify-between">
  <!-- Empty left side for future features -->
  <div></div>

  <!-- Right side: Info button + User Avatar -->
  <div class="flex items-center gap-2 mr-2">
    <!-- Small Info Button -->
    <Button
      variant="ghost"
      size="icon"
      class="rounded-full h-7 w-7 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      onclick={toggleAboutModal}
      title="About Pipewriter"
    >
      <Info class="h-3.5 w-3.5" />
    </Button>

    <!-- User Avatar -->
    <UserAvatar 
      user={props.user}
      isPro={props.isPro}
      trialActive={props.trialActive}
      trialDaysLeft={props.trialDaysLeft}
      onSignOut={props.onSignOut}
    />
  </div>
  
  <!-- AppAbout Modal -->
  <AppAbout 
    showAboutModal={showAboutModal}
    onToggleAboutModal={toggleAboutModal}
  />
</div>