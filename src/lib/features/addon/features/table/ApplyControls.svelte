<!-- src/lib/features/addon/features/table/ApplyControls.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Save, RotateCcw, Loader2 } from "@lucide/svelte";

  const props = $props<{
    isProcessing: boolean;
    onApply: () => void;
    onReset: () => void;
    changesSummary: string;
  }>();
</script>

<div class="flex items-center gap-2">
  <!-- Reset button - square icon only -->
  <Button 
    variant="outline" 
    size="icon"
    class="h-8 w-8 flex-shrink-0"
    onclick={props.onReset}
    disabled={props.isProcessing}
    title="Reset all settings to defaults"
  >
    <RotateCcw class="h-3 w-3" />
  </Button>

  <!-- Apply button -->
  <Button 
    variant="default" 
    class="h-8 px-3 text-xs flex items-center gap-2 flex-shrink-0"
    onclick={props.onApply}
    disabled={props.isProcessing}
  >
    {#if props.isProcessing}
      <Loader2 class="h-3 w-3 animate-spin" />
      <span>Applying...</span>
    {:else}
      <Save class="h-3 w-3" />
      <span>Apply</span>
    {/if}
  </Button>

  <!-- Changes summary - aligned to the right -->
  {#if props.changesSummary && !props.isProcessing}
    <span class="text-[0.6rem] text-muted-foreground ml-auto text-right leading-tight">
      {props.changesSummary}
    </span>
  {/if}
</div>