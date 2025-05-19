<!-- src/lib/features/pricing/UpgradeCard.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Check, X } from "lucide-svelte";
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  
  // Props
  const props = $props<{
    onUpgrade?: () => void;
    onDowngrade?: () => void;
  }>();
  
  // Get trial status
  const trialFeatures = useTrialFeatures();
  const trialStatus = trialFeatures.getTrialStatus();
  
  // Feature comparison
  const features = [
    {
      name: "Basic Elements",
      free: true,
      premium: true
    },
    {
      name: "Premium Elements",
      free: false,
      premium: true
    },
    {
      name: "AI Features",
      free: false,
      premium: true
    },
  ];
  
  function handleUpgrade() {
    if (props.onUpgrade) {
      props.onUpgrade();
    }
  }
  
  function handleDowngrade() {
    if (props.onDowngrade) {
      props.onDowngrade();
    }
  }
</script>

<div class="grid gap-4 md:grid-cols-2 lg:gap-8">
  <!-- Free Tier -->
  <div class="flex _flex-col rounded-lg border bg-card p-6 shadow-sm">
    
		<div class="flex-1">
      <h3 class="text-md font-semibold">Free</h3>
      <div class="mt-2 text-2xl font-bold">$0</div>

      <ul class="mt-6 space-y-2.5 text-sm">
        {#each features as feature}
          <li class="flex items-center">
            {#if feature.free}
              <Check class="mr-2 size-4 text-primary" />
              <span>{feature.name}</span>
            {:else}
              <X class="mr-2 size-4 text-muted-foreground" />
              <span class="text-muted-foreground">{feature.name}</span>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
    
    {#if trialStatus.isPremium}
      <Button variant="outline" class="mt-6" onclick={handleDowngrade}>
        Downgrade to Free
      </Button>
    {:else}
      <div class="mt-6 text-center text-sm text-muted-foreground">
        Your current plan
      </div>
    {/if}
  </div>
  
  <!-- Premium Tier -->
  <div class="flex flex-col rounded-lg border bg-card p-6 shadow-sm relative">
    <!-- Premium badge -->
    <div class="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
      Popular
    </div>
    
    <div class="flex-1">
      <h3 class="text-xl font-semibold">Premium</h3>
      <div class="mt-2 flex items-baseline gap-1">
        <span class="text-3xl font-bold">$9</span>
        <span class="text-sm font-medium text-muted-foreground">/month</span>
      </div>
      <p class="mt-4 text-sm text-muted-foreground">
        Unlock all features and premium elements.
      </p>
      
      <ul class="mt-6 space-y-2.5 text-sm">
        {#each features as feature}
          <li class="flex items-center">
            <Check class="mr-2 size-4 text-primary" />
            <span>{feature.name}</span>
          </li>
        {/each}
      </ul>
    </div>
    
    {#if trialStatus.isPremium}
      <div class="mt-6 text-center text-sm">
        <span class="font-medium">Your current plan</span>
      </div>
    {:else if trialStatus.active}
      <Button class="mt-6" onclick={handleUpgrade}>
        Upgrade Now <span class="ml-1.5 text-xs">{trialStatus.daysLeft} days left in trial</span>
      </Button>
    {:else}
      <Button class="mt-6" onclick={handleUpgrade}>
        Upgrade Now
      </Button>
    {/if}
  </div>
</div>