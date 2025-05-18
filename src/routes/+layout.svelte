<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import { page } from '$app/stores';
  import AuthModal from '$lib/components/auth/AuthModal.svelte';
  import { initFeatures } from '$lib/context/features.svelte';

  // Get the layout data 
  const { data } = $props();
  
  // Initialize features when data changes
  $effect(() => {
    if (data?.features) {
      initFeatures(data.features);
    }
  });
  
  // Show auth modal when auth is required
  let showAuthModal = $derived(
    page.url.searchParams.get('auth') === 'required' && !data?.user
  );
</script>

<ModeWatcher />

{#if showAuthModal}
  <AuthModal />
{/if}

{@render children()}