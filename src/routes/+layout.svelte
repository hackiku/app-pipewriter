<script lang="ts">
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  import { setContext } from 'svelte';
  import { page } from '$app/state';
  import AuthModal from '$lib/components/auth/AuthModal.svelte';
  import { createFeaturesContext } from '$lib/context/features.svelte';
  import { createTrialContext } from '$lib/context/trial.svelte';

  // Props for getting data from the server
  const { data, children } = $props();
  
  // Create contexts first, without any immediate reactivity
  const featuresContext = createFeaturesContext();
  const trialContext = createTrialContext();
  
  // Set the contexts
  setContext('features', featuresContext);
  setContext('trialFeatures', trialContext);
  
  // Initialize contexts in a separate effect to avoid immediate reactivity loops
  $effect(() => {
    if (data?.features) {
      // First initialize the legacy context
      featuresContext.initFeatures(data);
      
      // Then initialize the new trial context
      trialContext.initFeatures({
        features: data.features,
        trialActive: data.trialActive,
        trialDaysLeft: data.trialDaysLeft,
        trialStartDate: data.trialStartDate,
        isPremium: data.isPremium
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