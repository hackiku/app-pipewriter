<!-- src/lib/features/addon/features/table/SizeControls.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Loader2, Save } from "@lucide/svelte";

  // Props - remove deprecated column/row controls
  const props = $props<{
    cellPadding: number;
    isProcessing: boolean;
    onCellPaddingChange: (value: number) => void;
    onApply: () => void;
  }>();

  // Input and label styles using shadcn colors
  const inputClass = "w-15 h-8 px-1 text-center text-xs border border-input rounded-md bg-background";
  const labelClass = "text-[0.6em] font-medium text-muted-foreground";
</script>

<!-- Follow same 2-column layout as above -->
<div class="grid grid-cols-2 gap-4">
  <!-- Left: Cell Padding Control -->
  <div class="space-y-1.5">
    <h3 class={labelClass}>
      Cell Padding
    </h3>
    <div class="flex items-center gap-2">
      <input 
        type="number" 
        step="0.01" 
        min="0" 
        max="1"
        value={props.cellPadding}
        onchange={(e) => props.onCellPaddingChange(parseFloat(e.target.value) || 0)}
        class={inputClass}
        disabled={props.isProcessing}
      />
      <span class="text-xs text-muted-foreground">in</span>
    </div>
  </div>

  <!-- Right: Apply Button -->
  <div class="space-y-1.5">
    <h3 class={labelClass}>
      Apply to table at cursor
    </h3>
    <Button 
      variant="default" 
      class="w-full h-7.5 text-xs flex items-center justify-center gap-2"
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
  </div>
</div>
