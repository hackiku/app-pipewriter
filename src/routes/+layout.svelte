<script lang="ts">
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  import { setContext } from 'svelte';
  import { page } from '$app/state';
  import AuthModal from '$lib/components/auth/AuthModal.svelte';
  import { createFeaturesContext } from '$lib/context/features.svelte';

  // Props for getting data from the server
  const { data, children } = $props();
  
  // Create and set up the features context
  const featuresContext = createFeaturesContext();
  setContext('features', featuresContext);
  
  // Initialize features whenever data changes
  $effect(() => {
    if (data?.features) {
      featuresContext.initFeatures(data.features);
    }
  });
  
  // Show auth modal when auth parameter is present and user is not authenticated
  let showAuthModal = $derived(
    page.url.searchParams.get('auth') === 'required' && !data?.user
  );

  // Log authentication status changes
  $effect(() => {
    if (data?.user) {
      console.log('User authenticated:', data.user.displayName);
    } else {
      console.log('User not authenticated');
    }
  });
</script>

<ModeWatcher />

{#if showAuthModal}
  <AuthModal />
{/if}

{@render children?.()}