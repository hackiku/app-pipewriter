<!-- src/lib/components/trial/TrialBanner.svelte -->
<script lang="ts">
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  import { Button } from '$lib/components/ui/button';
  import UpgradeDrawer from '$lib/features/pricing/UpgradeDrawer.svelte';
  import SimpleUpgradeModal from '$lib/features/pricing/SimpleUpgradeModal.svelte';
  // Get trial features
  const trialFeatures = useTrialFeatures();
  
  // Get simple, non-derived status values
  const isPremium = trialFeatures.trialInfo.isPro;
  const isActive = trialFeatures.trialInfo.active;
  const daysLeft = trialFeatures.trialInfo.daysLeft;
  
  // Compute expired status
  const isExpired = !isActive && daysLeft === 0 && !isPremium;
  
  // Format days text
  function getDaysText() {
    return daysLeft === 1 ? '1 day' : `${daysLeft} days`;
  }
  
  // Drawer state
  let isDrawerOpen = $state(false);
  
  function openDrawer() {
    isDrawerOpen = true;
  }
  
  function handleOpenChange(open: boolean) {
    isDrawerOpen = open;
  }
</script>

<!-- Upgrade Drawer -->
<!-- <UpgradeDrawer isOpen={isDrawerOpen} onOpenChange={handleOpenChange} /> -->
<SimpleUpgradeModal isOpen={isDrawerOpen} onOpenChange={handleOpenChange} />
<!-- Banner UI -->
{#if isPremium}
  <!-- Premium user - show subtle thank you message -->
  <div class="bg-primary/5 text-primary p-2 text-center text-xs">
    <span>🌟 Pro activated - Thxx!</span>
  </div>
{:else if isActive}
  <div class="bg-primary/10 text-primary p-2 rounded-none">
    <div class="flex justify-between items-center">
      <div>
        <p class="text-xs font-medium">Trial Active: {getDaysText()} remaining</p>
      </div>
      <Button variant="outline" size="sm" class="h-7 text-xs" onclick={openDrawer}>
        Upgrade
      </Button>
    </div>
  </div>
{:else if isExpired}
  <div class="bg-destructive/10 text-destructive p-2 rounded-none">
    <div class="flex justify-between items-center">
      <div>
        <p class="text-xs font-medium">Trial Expired</p>
      </div>
      <Button variant="outline" size="sm" class="h-7 text-xs border-destructive" onclick={openDrawer}>
        Upgrade Now
      </Button>
    </div>
  </div>
{:else}
  <!-- User is not signed in or has no trial yet -->
{/if}