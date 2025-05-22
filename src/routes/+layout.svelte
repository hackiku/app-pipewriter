<script lang="ts">
  import "../app.css";
  import { ModeWatcher } from 'mode-watcher';
  import { setContext } from 'svelte';
  import { createTrialContext } from '$lib/context/trial.svelte';

  // Props for getting data from the server
  const { data, children } = $props();
  
  const trialContext = createTrialContext();
  
  // Set the contexts
  setContext('trialFeatures', trialContext);
  
  // Initialize contexts with server data
  $effect(() => {
    if (data?.features) {
      trialContext.initFeatures({
        features: data.features,
        trialActive: data.trialActive,
        trialDaysLeft: data.trialDaysLeft,
        trialStartDate: data.trialStartDate,
        isPro: data.isPro
      });
    }
  });
</script>

<ModeWatcher />

{@render children?.()}