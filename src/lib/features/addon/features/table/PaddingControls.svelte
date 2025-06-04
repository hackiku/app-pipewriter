<!-- src/lib/features/addon/features/table/PaddingControls.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";

  // Props - simplified for padding only
  const props = $props<{
    cellPadding: number; // in points
    isProcessing: boolean;
    onPaddingChange: (points: number) => void;
  }>();

  // Quick preset buttons (in points)
  const presets = [
    { label: "0", points: 0 },
    { label: "5", points: 5 },
    { label: "10", points: 10 },
    { label: "20", points: 20 }
  ];

  // Get button class for presets
  function getPresetClass(points: number) {
    const isSelected = props.cellPadding === points;
    return cn(
      "px-2 py-1 text-[0.5em] border rounded-md transition-colors",
      isSelected 
        ? "bg-primary/10 border-primary text-primary" 
        : "border-border hover:bg-accent",
      props.isProcessing && "opacity-50 cursor-not-allowed"
    );
  }

  // Handle preset click
  function handlePresetClick(points: number) {
    if (!props.isProcessing) {
      props.onPaddingChange(points);
    }
  }

  // Handle input change
  function handleInputChange(event: Event) {
    if (props.isProcessing) return;
    
    const target = event.target as HTMLInputElement;
    const points = parseInt(target.value) || 0;
    props.onPaddingChange(Math.max(0, Math.min(50, points))); // Clamp between 0-50pt
  }
</script>

<!-- Full width row layout -->
<div class="flex flex-col items-start gap-1">
  <!-- Left: Label and Input -->
  <div class="flex items-center gap-1 min-w-0 flex-shrink">
    <h3 class="text-[0.6em] font-medium text-muted-foreground whitespace-nowrap">
      Padding
    </h3>
    <div class="flex items-center gap-1">
      <input 
        type="number" 
        min="0" 
        max="50"
        value={props.cellPadding}
        onchange={handleInputChange}
        class="w-12 h-8 px-1 text-center text-xs border border-input rounded-lg bg-background"
        disabled={props.isProcessing}
      />
      <span class="text-xs text-muted-foreground">pt</span>
    </div>
  </div>

  <!-- Right: Preset Buttons -->
  <div class="flex gap-0.5">
    {#each presets as preset}
      <button
        class={getPresetClass(preset.points)}
        onclick={() => handlePresetClick(preset.points)}
        disabled={props.isProcessing}
        title={`Set padding to ${preset.points} points`}
      >
        {preset.label}
      </button>
    {/each}
  </div>
</div>