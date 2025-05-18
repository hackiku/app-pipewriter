<!-- src/lib/features/addon/features/table/ButtonRow.svelte -->
<script lang="ts">
  import { Pipette, Save, Loader2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  
  // Props using Svelte 5 runes
  const props = $props<{
    onGet: () => void;
    onApply: () => void;
    isProcessing?: boolean;
  }>();
  
  // Default isProcessing to false if not provided
  let isProcessing = $derived(props.isProcessing || false);
</script>

<div class="flex justify-between items-center w-full">
  <Button 
    variant="secondary" 
    onclick={props.onGet}
    class="flex items-center gap-2"
    disabled={isProcessing}
  >
    {#if isProcessing}
      <Loader2 class="h-4 w-4 animate-spin" />
      <span>Getting...</span>
    {:else}
      <Pipette class="h-4 w-4" />
      <span>Get</span>
    {/if}
  </Button>
  
  <Button 
    variant="default" 
    onclick={props.onApply}
    class="flex items-center gap-2"
    disabled={isProcessing}
  >
    {#if isProcessing}
      <Loader2 class="h-4 w-4 animate-spin" />
      <span>Applying...</span>
    {:else}
      <Save class="h-4 w-4" />
      <span>Apply</span>
    {/if}
  </Button>
</div>