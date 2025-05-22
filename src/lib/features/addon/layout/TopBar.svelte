<!-- $lib/features/addon/layout/TopBar.svelte -->
<script lang="ts">
  import { getContext } from "svelte";
  import { Info, Minimize2 } from '@lucide/svelte';
  import { Button } from "$lib/components/ui/button";
  import ModeToggle from "$lib/components/ui/mode-toggle.svelte";

  // Get UI state from context
  const uiState = getContext('uiState');
</script>

<div class="flex items-center justify-between py-2">
  <!-- Zen Mode Button -->
  <Button 
    variant="ghost"
    size="icon"
    class="rounded-full h-7 w-7 p-1.5 {uiState.zenMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}" 
    onclick={uiState.toggleZenMode}
  >
    <Minimize2 class="h-4 w-4" />
  </Button>
  
  <div class="flex items-center justify-middle gap-2">
    <!-- Info Button -->
    <Button
      variant="ghost"
      size="icon"
      class="rounded-full h-7 w-7 p-1.5 {uiState.showInfo ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}"
      onclick={uiState.toggleShowInfo}
    >
      <Info class="h-4 w-4" />
    </Button>
    
    <!-- Mode Toggle -->
    <ModeToggle />
  </div>
</div>