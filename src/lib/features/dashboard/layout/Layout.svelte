<!-- src/lib/features/dashboard/layout/Layout.svelte -->
<script lang="ts">
  import { getUser } from '$lib/services/firebase/auth.svelte';
  import * as Resizable from "$lib/components/ui/resizable";
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  
  // Props for children
  const { children } = $props();
  
  // State
  let isCollapsed = $state(false);
  let defaultSidebarSize = $state(18); // 18% of screen width by default
  let collapseThreshold = $state(10); // Threshold at which sidebar collapses (in %)
  
  // Handler for sidebar resize
  function handleSidebarResize(sizes) {
    const sidebarSize = sizes[0];
    isCollapsed = sidebarSize < collapseThreshold;
  }
</script>

<div class="flex h-screen flex-col overflow-hidden bg-background text-foreground">
  <Header />

  <Resizable.PaneGroup 
    direction="horizontal"
    class="flex-1"
    onLayout={handleSidebarResize}
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