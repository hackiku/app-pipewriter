<!-- src/lib/features/addon/layout/BottomBar.svelte - CLEANED (AppAbout moved to TopBar) -->
<script lang="ts">
  import UserAvatar from '$lib/components/user/UserAvatar.svelte';
  
  // Props - simplified, no more about modal
  const props = $props<{
    user: any;
    isPro: boolean;
    trialActive: boolean;
    trialDaysLeft: number;
    onSignOut: () => Promise<void>;
  }>();
</script>

<div class="w-full pr-3.5 h-12 flex items-center justify-between">
  <!-- Empty left side for future features -->
  <div></div>

  <!-- Right side: Just User Avatar now -->
  <div class="flex items-center mr-2">
    <UserAvatar 
      user={props.user}
      isPro={props.isPro}
      trialActive={props.trialActive}
      trialDaysLeft={props.trialDaysLeft}
      onSignOut={props.onSignOut}
    />
  </div>
</div>