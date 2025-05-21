<!-- src/lib/components/dev/DevPanel.svelte -->
<script lang="ts">
  import { dev } from '$app/environment';
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  
  // Get trial context
  const trialFeatures = useTrialFeatures();
  
  // Local state
  let isOpen = $state(false);
  let isProcessing = $state(false);
  let message = $state('');
  let trialDays = $state(14);
  
  // Quick actions for dev
  async function setFreeTier() {
    isProcessing = true;
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
  
  // Toggle panel visibility
  function toggle() {
    isOpen = !isOpen;
  }
</script>

<!-- Simple fixed position button in the corner -->
<div class="fixed bottom-16 right-4 z-50">
  <Button variant="outline" size="sm" onclick={toggle} class="text-xs">
    {isOpen ? 'Hide DevTools' : 'DevTools'}
  </Button>
  
  {#if isOpen}
    <Card.Root class="w-64">
      <Card.Header>
        <Card.Title class="text-sm">Developer Tools</Card.Title>
      </Card.Header>
      <Card.Content class="space-y-4">
        <!-- Status -->
        <div class="text-xs">
          <p>Status: {trialFeatures.trialInfo.isPro ? 'Pro' : (trialFeatures.trialInfo.active ? 'Trial' : 'Free')}</p>
          {#if trialFeatures.trialInfo.active}
            <p>Trial days: {trialFeatures.trialInfo.daysLeft}</p>
          {/if}
        </div>
        
        <!-- Quick actions -->
        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onclick={setFreeTier} disabled={isProcessing}>
            Set Free
          </Button>
          <Button variant="outline" size="sm" onclick={setProTier} disabled={isProcessing}>
            Set Pro
          </Button>
        </div>
        
        <!-- Trial period setter -->
        <div class="space-y-2">
          <label class="text-xs block">Set Trial Period</label>
          <div class="flex gap-2">
            <input 
              type="number" 
              bind:value={trialDays} 
              class="w-full px-2 py-1 text-sm border rounded" 
              min="0" 
              max="30"
            />
            <Button size="sm" variant="outline" onclick={setTrialPeriod} disabled={isProcessing}>
              Set
            </Button>
          </div>
        </div>
        
        <!-- Message area -->
        {#if message}
          <div class="text-xs p-2 bg-primary/10 rounded">
            {message}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  {/if}
</div>