<!-- src/lib/components/dev/DevPanel.svelte (continued) -->
<script lang="ts">
  import { dev } from '$app/environment';
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Slider from "$lib/components/ui/slider";
  import * as Tabs from "$lib/components/ui/tabs";
  import { Terminal, Sparkles, Clock, AlertTriangle, RefreshCw } from 'lucide-svelte';
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  
  // Get trial context
  const trialFeatures = useTrialFeatures();
  
  // Local state
  let isOpen = $state(false);
  let isProcessing = $state(false);
  let message = $state('');
  let trialDays = $state(14);
  let currentTab = $state('status');
  
  // Quick actions for dev
  async function setFreeTier() {
    isProcessing = true;
    message = '';
    try {
      const response = await fetch('/api/user/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to set free tier');
      
      message = 'Set to Free tier - reloading...';
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      message = error.message;
    } finally {
      isProcessing = false;
    }
  }
  
  async function setProTier() {
    isProcessing = true;
    message = '';
    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to set pro tier');
      
      message = 'Set to Pro tier - reloading...';
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      message = error.message;
    } finally {
      isProcessing = false;
    }
  }
  
  async function setTrialPeriod() {
    isProcessing = true;
    message = '';
    try {
      // Make sure trialDays is a number
      const days = parseInt(trialDays.toString(), 10);
      
      const response = await fetch('/api/user/set-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
      });
      
      if (!response.ok) throw new Error('Failed to set trial period');
      
      message = `Set trial to ${days} days - reloading...`;
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      message = error.message;
    } finally {
      isProcessing = false;
    }
  }
  
  // Get status icon
  function getStatusIcon() {
    if (trialFeatures.trialInfo.isPro) return Sparkles;
    if (trialFeatures.trialInfo.active) return Clock;
    return AlertTriangle;
  }
  
  // Toggle panel visibility
  function toggle() {
    isOpen = !isOpen;
  }
  
  // Handle tab change
  function handleTabChange(tab) {
    currentTab = tab;
  }
  
  // Handle slider change
  function handleSliderChange(value) {
    trialDays = value[0];
  }
</script>

<!-- Simple fixed position panel -->
<div class="fixed bottom-16 right-2 z-50" data-devpanel>
  <Button variant="outline" size="sm" onclick={toggle} class="flex items-center gap-1 text-xs">
    <Terminal class="h-3.5 w-3.5" />
    {isOpen ? 'Hide DevTools' : 'dev'}
  </Button>
  
  {#if isOpen}
    <Card.Root class="w-64 mt-2 shadow-lg">
      <Card.Header class="p-3 pb-2">
        <Card.Title class="text-sm flex items-center gap-2">
          <Terminal class="h-4 w-4" />
          Developer Tools
        </Card.Title>
        <Card.Description class="text-xs">
          Current status: 
          <span class="inline-flex items-center gap-1">
            <svelte:component this={getStatusIcon()} class="h-3 w-3" />
            <strong>
              {trialFeatures.trialInfo.isPro 
                ? 'Pro' 
                : (trialFeatures.trialInfo.active 
                  ? `Trial (${trialFeatures.trialInfo.daysLeft} days)` 
                  : 'Free')
              }
            </strong>
          </span>
        </Card.Description>
      </Card.Header>
      
      <Tabs.Root value={currentTab}>
        <Tabs.List class="w-full border-b px-3">
          <Tabs.Trigger value="status" onclick={() => handleTabChange('status')} class="text-xs">
            Status
          </Tabs.Trigger>
          <Tabs.Trigger value="trial" onclick={() => handleTabChange('trial')} class="text-xs">
            Trial
          </Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="status" class="p-3 space-y-3">
          <div class="space-y-2">
            <div class="text-xs font-medium">Quick Actions</div>
            <div class="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" class="h-8 text-xs" onclick={setFreeTier} disabled={isProcessing}>
                <AlertTriangle class="h-3 w-3 mr-1" />
                Set Free
              </Button>
              <Button variant="outline" size="sm" class="h-8 text-xs" onclick={setProTier} disabled={isProcessing}>
                <Sparkles class="h-3 w-3 mr-1" />
                Set Pro
              </Button>
            </div>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="trial" class="p-3 space-y-3">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium">Trial Days: {trialDays}</span>
              <span class="text-xs text-muted-foreground">{trialDays === 0 ? 'Expired' : (trialDays === 1 ? '1 day' : `${trialDays} days`)}</span>
            </div>
            
            <Slider.Root 
              value={[trialDays]} 
              onvalueChange={handleSliderChange}
              max={30}
              step={1}
              class="my-4"
            />
            
            <Button 
              size="sm" 
              class="w-full h-8 text-xs"
              onclick={setTrialPeriod}
              disabled={isProcessing}
            >
              Apply Trial Period
            </Button>
            
            <div class="grid grid-cols-3 gap-1">
              <Button variant="outline" size="sm" class="text-xs" onclick={() => trialDays = 0}>0d</Button>
              <Button variant="outline" size="sm" class="text-xs" onclick={() => trialDays = 7}>7d</Button>
              <Button variant="outline" size="sm" class="text-xs" onclick={() => trialDays = 14}>14d</Button>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
      
      {#if message}
        <div class="p-3 pt-0">
          <div class="p-2 bg-primary/10 text-primary text-xs rounded">
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
    </Card.Root>
  {/if}
</div>