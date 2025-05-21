<!-- src/lib/components/trial/TrialBanner.svelte -->
<script lang="ts">
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  import { Button } from '$lib/components/ui/button';
  import { ChevronDown, Sparkles, Clock, AlertTriangle, Terminal, Sliders } from 'lucide-svelte';
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { dev } from '$app/environment';
  import SimpleUpgradeModal from '$lib/components/pricing/SimpleUpgradeModal.svelte';
  
  // Get trial features
  const trialFeatures = useTrialFeatures();
  
  // Get simple, non-derived status values
  const isPro = trialFeatures.trialInfo.isPro;
  const isActive = trialFeatures.trialInfo.active;
  const daysLeft = trialFeatures.trialInfo.daysLeft;
  
  // Compute expired status
  const isExpired = !isActive && daysLeft === 0 && !isPro;
  
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
  
  // Dev tools state
  let showDevTools = $state(false);
  
  // Quick dev tools actions
  async function setTrialDays(days) {
    try {
      const response = await fetch('/api/user/set-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error setting trial days:', error);
    }
  }
  
  async function setProStatus(enabled) {
    try {
      const endpoint = enabled ? '/api/user/upgrade' : '/api/user/downgrade';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error setting pro status:', error);
    }
  }
  
  // Determine banner color class based on state
  function getBannerClasses() {
    if (isPro) return "bg-primary/5 text-primary";
    if (isActive) return "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
    if (isExpired) return "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
    return "bg-neutral-100 text-neutral-500";
  }
</script>

<SimpleUpgradeModal isOpen={isUpgradeOpen} onOpenChange={handleUpgradeOpenChange} />

<!-- Redesigned Banner with optional dropdown for dev tools -->
<div class="w-full {getBannerClasses()} transition-colors duration-200">
  {#if dev}
    <!-- Dev Mode With Dropdown -->
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
      
      <DropdownMenu.Content align="start" class="w-64">
        <DropdownMenu.Label class="flex items-center gap-2">
          <Terminal class="h-4 w-4" /> 
          <span>Development Tools</span>
        </DropdownMenu.Label>
        
        <DropdownMenu.Separator />
        
        <DropdownMenu.Group>
          <DropdownMenu.Label class="text-xs">Status</DropdownMenu.Label>
          <div class="p-2 text-xs bg-neutral-50 dark:bg-neutral-900 rounded-sm m-1">
            <div class="flex items-center justify-between">
              <span>Current:</span>
              <span class="font-mono">
                {isPro ? 'Pro' : (isActive ? `Trial (${daysLeft} days)` : 'Free')}
              </span>
            </div>
          </div>
        </DropdownMenu.Group>
        
        <DropdownMenu.Separator />
        
        <DropdownMenu.Group>
          <DropdownMenu.Label class="text-xs">Set Status</DropdownMenu.Label>
          <div class="grid grid-cols-2 gap-1 p-1">
            <Button 
              variant="outline" 
              size="sm" 
              class="h-7 text-xs"
              onclick={() => setProStatus(true)}
            >
              Enable Pro
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              class="h-7 text-xs"
              onclick={() => setProStatus(false)}
            >
              Disable Pro
            </Button>
          </div>
        </DropdownMenu.Group>
        
        <DropdownMenu.Separator />
        
        <DropdownMenu.Group>
          <DropdownMenu.Label class="text-xs">Set Trial</DropdownMenu.Label>
          <div class="grid grid-cols-3 gap-1 p-1">
            <Button 
              variant="outline" 
              size="sm" 
              class="h-7 text-xs"
              onclick={() => setTrialDays(0)}
            >
              0 days
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              class="h-7 text-xs"
              onclick={() => setTrialDays(7)}
            >
              7 days
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              class="h-7 text-xs"
              onclick={() => setTrialDays(14)}
            >
              14 days
            </Button>
          </div>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {:else}
    <!-- Regular Banner for Production -->
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