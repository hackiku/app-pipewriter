<!-- src/routes/(dash)/+layout.svelte - FINAL CORRECTED VERSION -->
<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable";
  import Sidebar from '$lib/features/dashboard/layout/Sidebar.svelte';
  import Header from '$lib/features/dashboard/layout/Header.svelte';
  import { ModeWatcher } from "mode-watcher";
  import { setContext } from 'svelte';
  import { useAccessControl } from '$lib/utils/access-control';

  // Props for getting data and children 
  const { data, children } = $props();
  
  // FIXED: Create access control immediately and set context right away
  let access = $state(data?.userAccess ? useAccessControl(data.userAccess) : null);
  
  // FIXED: Set contexts immediately so Header has access on first render
  setContext('access', access);
  setContext('dashboardData', data);
  
  // Update access when data changes (but context is already set)
  $effect(() => {
    if (data?.userAccess) {
      access = useAccessControl(data.userAccess);
    } else {
      access = null;
    }
  });
  
  // Sidebar state
  let isCollapsed = $state(false);
  let defaultSidebarSize = $state(18);
  let collapseThreshold = $state(10);
  
  // Handler for sidebar resize
  function handleSidebarResize(sizes: number[]) {
    const sidebarSize = sizes[0];
    isCollapsed = sidebarSize < collapseThreshold;
  }
  
  // Debug logging
  $effect(() => {
    if (data?.user) {
      console.log('[DASH] User authenticated:', data.user.displayName, `(${access?.userAccess?.tier || 'unknown'})`);
    }
  });
</script>

<ModeWatcher />

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