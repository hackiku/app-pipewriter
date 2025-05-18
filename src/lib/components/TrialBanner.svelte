// src/lib/components/TrialBanner.svelte
<script lang="ts">
  import { slide } from 'svelte/transition';
  import { Button } from '$lib/components/ui/button';
  import { X } from 'lucide-svelte';
  import { isTrialActive, isPremium, getTrialDaysLeft } from '$lib/stores/features';
  
  let dismissed = $state(false);
  
  function dismiss() {
    dismissed = true;
  }
  
  function upgrade() {
    window.open('https://pipewriter.io/pricing', '_blank');
  }
</script>

{#if !dismissed && isTrialActive() && !isPremium()}
  <div class="w-full bg-gradient-to-r from-primary/20 to-primary/10 rounded-md p-2 mb-2"
       in:slide={{ duration: 200 }}>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-medium">
          Trial Mode: {getTrialDaysLeft()} days remaining
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          class="h-6 px-2 py-0 text-xs"
          onclick={upgrade}
        >
          Upgrade
        </Button>
        <button
          class="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center"
          onclick={dismiss}
          title="Dismiss"
        >
          <X class="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
{/if}