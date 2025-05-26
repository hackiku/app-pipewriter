<!-- src/lib/features/addon/features/table/SizeControls.svelte -->

<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Loader2, Save } from "@lucide/svelte";

  // Props - updated for points instead of inches
  const props = $props<{
    cellPadding: number; // Now in points
    isProcessing: boolean;
    onCellPaddingChange: (inches: number) => void; // Still takes inches, converts internally
    onApply: () => void;
  }>();

  // Input and label styles using shadcn colors
  const inputClass = "w-15 h-8 px-1 text-center text-xs border border-input rounded-md bg-background";
  const labelClass = "text-[0.6em] font-medium text-muted-foreground";

  // Convert points back to inches for display
  function pointsToInches(points: number): number {
    return Math.round((points / 72) * 100) / 100; // Round to 2 decimal places
  }

  // Current padding in inches for display
  let paddingInches = $derived(pointsToInches(props.cellPadding));

  // Quick preset buttons (in inches, converted to points)
  const presets = [
    { label: "None", inches: 0 },
    { label: "Small", inches: 0.07 }, // ~5pt
    { label: "Medium", inches: 0.14 }, // ~10pt  
    { label: "Large", inches: 0.28 }   // ~20pt
  ];
</script>

<!-- Follow same 2-column layout as above -->
<div class="grid grid-cols-2 gap-4">
  <!-- Left: Cell Padding Control -->
  <div class="space-y-1.5">
    <h3 class={labelClass}>
      Cell Padding
    </h3>
    <div class="space-y-2">
      <!-- Input field -->
      <div class="flex items-center gap-2">
        <input 
          type="number" 
          step="0.01" 
          min="0" 
          max="1"
          value={paddingInches}
          onchange={(e) => props.onCellPaddingChange(parseFloat(e.target.value) || 0)}
          class={inputClass}
          disabled={props.isProcessing}
        />
        <span class="text-xs text-muted-foreground">in</span>
      </div>
      
      <!-- Preset buttons -->
      <div class="grid grid-cols-2 gap-1">
        {#each presets as preset}
          <button
            class="px-2 py-1 text-[0.6rem] border border-border rounded hover:bg-accent transition-colors disabled:opacity-50"
            onclick={() => props.onCellPaddingChange(preset.inches)}
            disabled={props.isProcessing}
            title={`${preset.inches}" (${Math.round(preset.inches * 72)}pt)`}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Right: Apply Button -->
  <div class="space-y-1.5">
    <h3 class={labelClass}>
      Apply to table at cursor
    </h3>
    <Button 
      variant="default" 
      class="w-full h-8 text-xs flex items-center justify-center gap-2"
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
    
    <!-- Current values display -->
    <div class="text-[0.6rem] text-muted-foreground text-center space-y-0.5">
      <div>Padding: {paddingInches}" ({props.cellPadding}pt)</div>
    </div>
  </div>
</div>