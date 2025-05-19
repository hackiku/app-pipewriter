<script lang="ts">
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  import { Button } from '$lib/components/ui/button';
  
  const trialFeatures = useTrialFeatures();
  
  // Derived values
  let trialStatus = $derived(trialFeatures.getTrialStatus());
  let daysText = $derived(
    trialStatus.daysLeft === 1 
      ? '1 day' 
      : `${trialStatus.daysLeft} days`
  );
  
  function handleUpgrade() {
    alert('Taking you to upgrade page...');
    // Will implement later
  }
</script>

{#if trialStatus.isPremium}
  <!-- Premium user - show subtle thank you message -->
  <div class="bg-primary/5 text-primary p-2 text-center text-xs">
    <span>🌟 Premium activated - Thank you for supporting Pipewriter!</span>
  </div>
{:else if trialStatus.active}
  <div class="bg-primary/10 text-primary p-2 rounded-none">
    <div class="flex justify-between items-center">
      <div>
        <p class="text-xs font-medium">Trial Active: {daysText} remaining</p>
      </div>
      <Button variant="outline" size="sm" class="h-7 text-xs" onclick={handleUpgrade}>
        Upgrade
      </Button>
    </div>
  </div>
{:else if trialStatus.trialExpired}
  <div class="bg-destructive/10 text-destructive p-2 rounded-none">
    <div class="flex justify-between items-center">
      <div>
        <p class="text-xs font-medium">Trial Expired - Some features are limited</p>
      </div>
      <Button variant="outline" size="sm" class="h-7 text-xs border-destructive" onclick={handleUpgrade}>
        Upgrade Now
      </Button>
    </div>
  </div>
{:else}
  <!-- User is not signed in or has no trial yet -->
{/if}