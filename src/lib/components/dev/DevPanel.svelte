<!-- src/lib/components/dev/DevPanel.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Slider from "$lib/components/ui/slider";
  import * as Tabs from "$lib/components/ui/tabs";
  import { Terminal, Sparkles, Clock, AlertTriangle, RefreshCw } from 'lucide-svelte';
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  
  // Get trial context
  const trialFeatures = useTrialFeatures();
  
  // Reactive derived values
  const isPro = $derived(trialFeatures.trialInfo.isPro);
  const isActive = $derived(trialFeatures.trialInfo.active);
  const daysLeft = $derived(trialFeatures.trialInfo.daysLeft);
  
  // Local state
  let isProcessing = $state(false);
  let message = $state('');
  let trialDays = $state(14);
  let currentTab = $state('status');
  
  // REACTIVE: Update trialDays when actual days change
  $effect(() => {
    trialDays = daysLeft;
  });
  
  // Quick actions for dev
  async function setFreeTier() {
    isProcessing = true;
    message = 'Resetting to free tier...';
    try {
      const response = await fetch('/api/user/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetTrial: true })
      });
      
      if (!response.ok) throw new Error('Failed to reset to free tier');
      
      message = 'Reset to Free tier - reloading...';
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      message = error instanceof Error ? error.message : 'Failed to reset';
    } finally {
      isProcessing = false;
    }
  }
  
  async function setProTier() {
    isProcessing = true;
    message = 'Upgrading to Pro...';
    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to set pro tier');
      
      message = 'Set to Pro tier - reloading...';
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      message = error instanceof Error ? error.message : 'Failed to upgrade';
    } finally {
      isProcessing = false;
    }
  }
  
  async function setTrialPeriod() {
    isProcessing = true;
    message = `Setting trial to ${trialDays} days...`;
    try {
      const response = await fetch('/api/user/set-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: trialDays })
      });
      
      if (!response.ok) throw new Error('Failed to set trial period');
      
      message = `Set trial to ${trialDays} days - reloading...`;
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      message = error instanceof Error ? error.message : 'Failed to set trial';
    } finally {
      isProcessing = false;
    }
  }
  
  // Set trial days with quick buttons - REACTIVE
  function setQuickTrialDays(days: number) {
    trialDays = days;
  }
  
  // Get status icon
  function getStatusIcon() {
    if (isPro) return Sparkles;
    if (isActive) return Clock;
    return AlertTriangle;
  }
  
  // Handle tab change
  function handleTabChange(tab: string) {
    currentTab = tab;
  }
  
  // Handle slider change - REACTIVE
  function handleSliderChange(value: number[]) {
    trialDays = value[0];
  }
  
  // Format status text
  function getStatusText() {
    if (isPro) return 'Pro';
    if (isActive) return `Trial (${daysLeft} days)`;
    return 'Free';
  }
</script>

<!-- Pure DevPanel Content - No Wrapper -->
<div class="w-full">
  <!-- Current Status Display -->
  <div class="p-2 text-xs bg-neutral-50 dark:bg-neutral-900 rounded-sm mb-3">
    <div class="flex items-center justify-between">
      <span class="flex items-center gap-1">
        <svelte:component this={getStatusIcon()} class="h-3 w-3" />
        Status:
      </span>
      <span class="font-mono font-medium">
        {getStatusText()}
      </span>
    </div>
  </div>

  <!-- Tabs for Dev Controls -->
  <Tabs.Root value={currentTab} class="w-full">
    <Tabs.List class="w-full border-b mb-3">
      <Tabs.Trigger 
        value="status" 
        onclick={() => handleTabChange('status')} 
        class="text-xs flex-1"
      >
        Status
      </Tabs.Trigger>
      <Tabs.Trigger 
        value="trial" 
        onclick={() => handleTabChange('trial')} 
        class="text-xs flex-1"
      >
        Trial
      </Tabs.Trigger>
    </Tabs.List>
    
    <Tabs.Content value="status" class="space-y-3">
      <div class="space-y-2">
        <div class="text-xs font-medium">Quick Actions</div>
        <div class="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            class="h-8 text-xs" 
            onclick={setProTier} 
            disabled={isProcessing}
          >
            <Sparkles class="h-3 w-3 mr-1" />
            Set Pro
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            class="h-8 text-xs" 
            onclick={setFreeTier} 
            disabled={isProcessing}
          >
            <AlertTriangle class="h-3 w-3 mr-1" />
            Set Free
          </Button>
        </div>
      </div>
    </Tabs.Content>
    
    <Tabs.Content value="trial" class="space-y-3">
      <div class="space-y-3">
        <!-- Trial Days Display -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium">Trial Days: {trialDays}</span>
          <span class="text-xs text-muted-foreground">
            {trialDays === 0 ? 'Expired' : (trialDays === 1 ? '1 day' : `${trialDays} days`)}
          </span>
        </div>
        
        <!-- REACTIVE Slider -->
        <div class="px-2">
          <Slider.Root 
            value={[trialDays]} 
            onvalueChange={handleSliderChange}
            max={30}
            step={1}
            class="w-full"
          />
        </div>
        
        <!-- Apply Button -->
        <Button 
          size="sm" 
          class="w-full h-8 text-xs"
          onclick={setTrialPeriod}
          disabled={isProcessing}
        >
          {#if isProcessing && message.includes('trial')}
            <RefreshCw class="h-3 w-3 mr-1 animate-spin" />
          {/if}
          Apply {trialDays} Days
        </Button>
        
        <!-- Quick Day Buttons - REACTIVE -->
        <div class="grid grid-cols-4 gap-1">
          <Button 
            variant={trialDays === 0 ? "default" : "outline"} 
            size="sm" 
            class="text-xs h-7" 
            onclick={() => setQuickTrialDays(0)}
          >
            0d
          </Button>
          <Button 
            variant={trialDays === 3 ? "default" : "outline"} 
            size="sm" 
            class="text-xs h-7" 
            onclick={() => setQuickTrialDays(3)}
          >
            3d
          </Button>
          <Button 
            variant={trialDays === 7 ? "default" : "outline"} 
            size="sm" 
            class="text-xs h-7" 
            onclick={() => setQuickTrialDays(7)}
          >
            7d
          </Button>
          <Button 
            variant={trialDays === 14 ? "default" : "outline"} 
            size="sm" 
            class="text-xs h-7" 
            onclick={() => setQuickTrialDays(14)}
          >
            14d
          </Button>
        </div>
      </div>
    </Tabs.Content>
  </Tabs.Root>
  
  <!-- Status Message -->
  {#if message}
    <div class="mt-3">
      <div class="p-2 bg-primary/10 text-primary text-xs rounded-sm">
        {#if isProcessing}
          <div class="flex items-center gap-2">
            <RefreshCw class="h-3 w-3 animate-spin" />
            <span>{message}</span>
          </div>
        {:else}
          <span>{message}</span>
        {/if}
      </div>
    </div>
  {/if}
</div>