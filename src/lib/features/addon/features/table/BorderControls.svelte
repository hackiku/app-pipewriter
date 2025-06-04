<!-- src/lib/features/addon/features/table/BorderControls.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";

  // Props
  const props = $props<{
    borderWidth: number;
    borderColor: string;
    isProcessing: boolean;
    onBorderChange: (width: number, color?: string) => void;
  }>();

  // Border presets
  const borderPresets = [
    { width: 0, label: "None" },
    { width: 1, label: "1pt" },
    { width: 2, label: "2pt" },
    { width: 3, label: "3pt" }
  ];

  // Get button class for border presets
  function getBorderClass(width: number) {
    const isSelected = props.borderWidth === width;
    return cn(
      "px-3 py-1.5 text-xs border rounded-md transition-colors",
      isSelected 
        ? "bg-primary/10 border-primary text-primary" 
        : "border-border hover:bg-accent",
      props.isProcessing && "opacity-50 cursor-not-allowed"
    );
  }

  // Handle preset click
  function handlePresetClick(width: number) {
    if (!props.isProcessing) {
      props.onBorderChange(width, props.borderColor);
    }
  }
</script>

<!-- Full width row layout -->
<div class="flex items-center gap-3">
  <!-- Left: Label -->
  <div class="flex items-center gap-2 min-w-0 flex-shrink">
    <h3 class="text-[0.6em] font-medium text-muted-foreground whitespace-nowrap">
      Border
    </h3>
  </div>

  <!-- Right: Border Presets -->
  <div class="flex gap-1 flex-1">
    {#each borderPresets as preset}
      <button
        class={getBorderClass(preset.width)}
        onclick={() => handlePresetClick(preset.width)}
        disabled={props.isProcessing}
        title={`Set border to ${preset.label}`}
      >
        {preset.label}
      </button>
    {/each}
  </div>
</div>