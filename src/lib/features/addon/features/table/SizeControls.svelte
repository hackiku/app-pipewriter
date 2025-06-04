<!-- src/lib/features/addon/features/table/SizeControls.svelte -->
<script lang="ts">
  // Props - focused on padding with full row layout
  const props = $props<{
    cellPadding: number; // in points
    isProcessing: boolean;
    onCellPaddingChange: (inches: number) => void;
  }>();

  // Convert points back to inches for display
  function pointsToInches(points: number): number {
    return Math.round((points / 72) * 100) / 100;
  }

  // Current padding in inches for display
  let paddingInches = $derived(pointsToInches(props.cellPadding));

  // Quick preset buttons (in inches, will be converted to points)
  const presets = [
    { label: "0pt", inches: 0, points: 0 },
    { label: "5pt", inches: 0.07, points: 5 },
    { label: "10pt", inches: 0.14, points: 10 },
    { label: "20pt", inches: 0.28, points: 20 }
  ];

  // Check if current padding matches a preset
  function isPresetSelected(presetPoints: number) {
    return Math.abs(props.cellPadding - presetPoints) < 1; // Allow 1pt tolerance
  }
</script>

<!-- Full row layout - efficient use of 300px width -->
<div class="flex items-center gap-3">
  <!-- Label -->
  <h3 class="text-[0.6em] font-medium text-muted-foreground whitespace-nowrap flex-shrink-0">
    Padding
  </h3>
  
  <!-- Input field with unit -->
  <div class="flex items-center gap-1 flex-shrink-0">
    <input 
      type="number" 
      step="0.01" 
      min="0" 
      max="1"
      value={paddingInches}
      onchange={(e) => props.onCellPaddingChange(parseFloat(e.target.value) || 0)}
      class="w-12 h-6 px-1 text-center text-xs border border-input rounded bg-background disabled:opacity-50"
      disabled={props.isProcessing}
    />
    <span class="text-[0.6rem] text-muted-foreground">in</span>
  </div>
  
  <!-- Preset buttons - 4 options that should fit -->
  <div class="flex gap-1 ml-auto">
    {#each presets as preset}
      <button
        class="px-1.5 py-1 text-[0.6rem] border rounded transition-colors disabled:opacity-50 min-w-[28px] text-center
               {isPresetSelected(preset.points) 
                 ? 'border-primary bg-primary/10 text-primary' 
                 : 'border-border hover:bg-accent'}"
        onclick={() => props.onCellPaddingChange(preset.inches)}
        disabled={props.isProcessing}
        title={`${preset.inches}" (${preset.points}pt)`}
      >
        {preset.label}
      </button>
    {/each}
  </div>
</div>