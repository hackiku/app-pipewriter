<!-- src/routes/(dash)/+layout.svelte -->
<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable";
  import { getUser } from '$lib/services/firebase/auth.svelte';
  import Header from '$lib/features/dashboard/layout/Header.svelte';
  import Sidebar from '$lib/features/dashboard/layout/Sidebar.svelte';
  import { ModeWatcher } from "mode-watcher";
  import { setContext } from 'svelte';
  import { page } from '$app/state';
  import AuthModal from '$lib/components/auth/AuthModal.svelte';
  // import { createFeaturesContext } from '$lib/context/features.svelte';
  import { createTrialContext } from '$lib/context/trial.svelte';

  // Props for getting data and children
  const { data, children } = $props();
  
  // Create and set up the features context
  const trialContext = createTrialContext();
  setContext('trial', trialContext);
  
  // Sidebar state
  let isCollapsed = $state(false);
  let defaultSidebarSize = $state(18); // 18% of screen width by default
  let collapseThreshold = $state(10); // Threshold at which sidebar collapses (in %)
  
  // Handler for sidebar resize
  function handleSidebarResize(sizes) {
    const sidebarSize = sizes[0];
    isCollapsed = sidebarSize < collapseThreshold;
  }
  
  // Initialize features whenever data changes
  $effect(() => {
    if (data?.features) {
      trialContext.initFeatures(data.features);
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

<div class="flex h-screen flex-col overflow-hidden bg-background text-foreground">
  <Header />

  <Resizable.PaneGroup 
    direction="horizontal"
    class="flex-1"
    onlayout={handleSidebarResize}
  >
    <Resizable.Pane 
      defaultSize={defaultSidebarSize} 
      minSize={4} 
      maxSize={25}
      class="border-r"
    >
      <Sidebar isCollapsed={isCollapsed} />
    </Resizable.Pane>
    
    <Resizable.Handle withHandle class="w-[0.2px] bg-muted" />
    
    <Resizable.Pane defaultSize={100 - defaultSidebarSize}>
      <main class="h-full overflow-auto p-6">
        <div class="container mx-auto max-w-7xl">
          {@render children?.()}
        </div>
      </main>
    </Resizable.Pane>
  </Resizable.PaneGroup>
</div>