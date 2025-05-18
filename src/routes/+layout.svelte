<script lang="ts">
	import "../app.css";
	import { page } from '$app/state';

	import { ModeWatcher } from "mode-watcher";
	
  // import { setContext } from 'svelte';
  // import AuthModal from '$lib/components/auth/AuthModal.svelte';
  // import { createFeaturesContext } from '$lib/context/features.svelte';
  
	let { children, data } = $props();
  // Create and set up the features context
  // const featuresContext = createFeaturesContext();
  // setContext('features', featuresContext);
  
  // Initialize features when data changes
  // $effect(() => {
  //   if (data?.features) {
  //     featuresContext.initFeatures(data.features);
  //   }
  // });
  
  // Show auth modal when auth is required
  // let showAuthModal = $derived(
  //   page.url.searchParams.get('auth') === 'required' && !data?.user
  // );
</script>
 
<ModeWatcher />
{@render children?.()}