<!-- src/lib/components/pricing/TrialBanner.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { ChevronDown, Sparkles, Clock, AlertTriangle } from '@lucide/svelte';
  import { dev } from '$app/environment';

  // Simple props - no contexts
  const props = $props<{
    isPro: boolean;
    trialActive: boolean;
    trialDaysLeft: number;
  }>();

  // Simple upgrade action - just calls API and reloads
  async function handleUpgrade() {
    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        window.location.reload(); // Simple reload to get updated data
      } else {
        console.error('Upgrade failed');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  }

  // Format days text
  function getDaysText() {
    return props.trialDaysLeft === 1 ? '1 day' : `${props.trialDaysLeft} days`;
  }

  // Determine banner color based on state
  function getBannerClasses() {
    if (props.isPro) return "bg-primary/5 text-primary border-b border-primary/20";
    if (props.trialActive) return "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-b border-amber-500/20";
    return "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-b border-neutral-300";
  }
</script>

<div class="w-full {getBannerClasses()} transition-colors duration-200">
  <div class="flex items-center justify-between px-2 py-1.5">
    <div class="flex items-center gap-2">
      {#if props.isPro}
        <Sparkles class="h-3.5 w-3.5" />
        <span class="text-xs font-medium">Pro activated</span>
      {:else if props.trialActive}
        <Clock class="h-3.5 w-3.5" />
        <span class="text-xs font-medium">Trial: {getDaysText()} remaining</span>
      {:else}
        <AlertTriangle class="h-3.5 w-3.5" />
        <span class="text-xs font-medium">Free plan</span>
      {/if}
    </div>
    
    {#if !props.isPro}
      <Button 
        variant="ghost" 
        size="sm" 
        class="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary"
        onclick={handleUpgrade}
      >
        Upgrade
      </Button>
    {/if}
  </div>
</div>