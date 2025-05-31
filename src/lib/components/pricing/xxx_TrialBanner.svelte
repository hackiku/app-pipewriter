<!-- src/lib/components/pricing/TrialBanner.svelte -->

<script lang="ts">
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  import { Button } from '$lib/components/ui/button';
  import { ChevronDown, Sparkles, Clock, AlertTriangle, Terminal } from '@lucide/svelte';
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { dev } from '$app/environment';
  import SimpleUpgradeModal from '$lib/components/pricing/SimpleUpgradeModal.svelte';
  import DevPanel from '$lib/components/dev/DevPanel.svelte';
  
  // Get trial features context
  const trialFeatures = useTrialFeatures();
  
  // FIXED: Use reactive derived values instead of direct property access
  const isPro = $derived(trialFeatures.trialInfo.isPro);
  const isActive = $derived(trialFeatures.trialInfo.active);
  const daysLeft = $derived(trialFeatures.trialInfo.daysLeft);
  
  // Computed status
  const isExpired = $derived(!isActive && daysLeft === 0 && !isPro);
  
  // Format days text
  function getDaysText() {
    return daysLeft === 1 ? '1 day' : `${daysLeft} days`;
  }
  
  // Upgrade modal state
  let isUpgradeOpen = $state(false);
  
  function openUpgradeModal() {
    isUpgradeOpen = true;
  }
  
  function handleUpgradeOpenChange(open: boolean) {
    isUpgradeOpen = open;
  }
  
  // Determine banner color class based on state
  function getBannerClasses() {
    if (isPro) return "bg-primary/5 text-primary border-b border-primary/20";
    if (isActive) return "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-b border-amber-500/20";
    if (isExpired) return "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-b border-neutral-300";
    return "bg-neutral-100 text-neutral-500 border-b border-neutral-200";
  }
</script>

<SimpleUpgradeModal isOpen={isUpgradeOpen} onOpenChange={handleUpgradeOpenChange} />

<!-- Banner with dev/production modes -->
<div class="w-full {getBannerClasses()} transition-colors duration-200">
  {#if dev}
    <!-- DEV MODE: Dropdown with dev tools -->
    <DropdownMenu.Root>
      <div class="flex items-center justify-between px-2 py-1.5">
        <div class="flex items-center gap-2">
          <DropdownMenu.Trigger class="flex items-center gap-1 text-xs hover:opacity-80 transition">
            {#if isPro}
              <Sparkles class="h-3.5 w-3.5" />
              <span class="font-medium">Pro</span>
            {:else if isActive}
              <Clock class="h-3.5 w-3.5" />
              <span class="font-medium">Trial: {getDaysText()}</span>
            {:else}
              <AlertTriangle class="h-3.5 w-3.5" />
              <span class="font-medium">Free</span>
            {/if}
            <ChevronDown class="h-3 w-3" />
          </DropdownMenu.Trigger>
        </div>
        
        {#if !isPro}
          <Button 
            variant="ghost" 
            size="sm" 
            class="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary"
            onclick={openUpgradeModal}
          >
            Upgrade
          </Button>
        {/if}
      </div>
      
      <DropdownMenu.Content align="start" class="w-72">
        <DropdownMenu.Label class="flex items-center gap-2">
          <Terminal class="h-4 w-4" /> 
          <span>Dev Tools</span>
        </DropdownMenu.Label>
        
        <DropdownMenu.Separator />
        
        <!-- DevPanel Component Integration -->
        <div class="p-3">
          <DevPanel />
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {:else}
    <!-- PRODUCTION MODE: Clean banner -->
    <div class="flex items-center justify-between px-2 py-1.5">
      <div class="flex items-center gap-2">
        {#if isPro}
          <Sparkles class="h-3.5 w-3.5" />
          <span class="text-xs font-medium">Pro activated</span>
        {:else if isActive}
          <Clock class="h-3.5 w-3.5" />
          <span class="text-xs font-medium">Trial: {getDaysText()} remaining</span>
        {:else}
          <AlertTriangle class="h-3.5 w-3.5" />
          <span class="text-xs font-medium">Free plan</span>
        {/if}
      </div>
      
      {#if !isPro}
        <Button 
          variant="ghost" 
          size="sm" 
          class="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary"
          onclick={openUpgradeModal}
        >
          Upgrade
        </Button>
      {/if}
    </div>
  {/if}
</div>