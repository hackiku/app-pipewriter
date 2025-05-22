<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import "../app.css";
  import { ModeWatcher } from 'mode-watcher';
  import { setContext } from 'svelte';
  import { page } from '$app/state';
  import AuthModal from '$lib/components/auth/AuthModal.svelte';
  import { createTrialContext } from '$lib/context/trial.svelte';

  // Props for getting data from the server
  const { data, children } = $props();
  
  const trialContext = createTrialContext();
  
  // Set the contexts
  setContext('trialFeatures', trialContext);
  
  // Initialize contexts with server data only (much simpler!)
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
  
  // Show auth modal when needed
  let showAuthModal = $derived(
    page.url.searchParams.get('auth') === 'required' && !data?.user
  );
</script>

<ModeWatcher />

{#if showAuthModal}
  <AuthModal />
{/if}

{@render children?.()}