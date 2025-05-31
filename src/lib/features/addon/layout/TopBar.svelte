<!-- $lib/features/addon/layout/TopBar.svelte -->
<script lang="ts">
  import { Info, Minimize2 } from '@lucide/svelte';
  import { Button } from "$lib/components/ui/button";
  import ModeToggle from "$lib/components/ui/mode-toggle.svelte";

  // Props instead of context - same UI state
  const props = $props<{
    zenMode: boolean;
    showInfo: boolean;
    onToggleZenMode: () => void;
    onToggleShowInfo: () => void;
  }>();
</script>

<div class="flex items-center justify-between py-2">
  <!-- Zen Mode Button -->
  <Button 
    variant="ghost"
    size="icon"
    class="rounded-full h-7 w-7 p-1.5 {props.zenMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}" 
    onclick={props.onToggleZenMode}
  >
    <Minimize2 class="h-4 w-4" />
  </Button>
  
  <div class="flex items-center justify-middle gap-2">
    <!-- Info Button -->
    <Button
      variant="ghost"
      size="icon"
      class="rounded-full h-7 w-7 p-1.5 {props.showInfo ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}"
      onclick={props.onToggleShowInfo}
    >
      <Info class="h-4 w-4" />
    </Button>
    
    <!-- Mode Toggle -->
    <ModeToggle />
  </div>
</div>