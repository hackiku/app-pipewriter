<!-- src/lib/features/addon/features/table/ColorControls.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { X } from "@lucide/svelte";

  // Props
  const props = $props<{
    backgroundColor: string;
    isProcessing: boolean;
    onColorChange: (color: string) => void;
  }>();

  // Quick color presets
  const colorPresets = [
    { color: '#ffffff', label: 'White' },
    { color: '#f3f3f3', label: 'Light Gray' },
    { color: '#e0e0e0', label: 'Gray' },
    { color: '#e3f2fd', label: 'Light Blue' },
    { color: '#e8f5e8', label: 'Light Green' },
    { color: '#fff9c4', label: 'Light Yellow' }
  ];

  // Get button class for color swatches
  function getColorClass(color: string) {
    const isSelected = props.backgroundColor === color;
    return cn(
      "w-6 h-6 rounded border-2 transition-all",
      isSelected 
        ? "border-primary shadow-md scale-110" 
        : "border-gray-300 dark:border-gray-600 hover:border-primary hover:scale-105",
      props.isProcessing && "opacity-50 cursor-not-allowed"
    );
  }

  // Handle color click
  function handleColorClick(color: string) {
    if (!props.isProcessing) {
      props.onColorChange(color);
    }
  }

  // Handle clear background
  function handleClear() {
    if (!props.isProcessing) {
      props.onColorChange('');
    }
  }
</script>

<!-- Full width row layout -->
<div class="flex items-center gap-3">
  <!-- Left: Label -->
  <div class="flex items-center gap-2 min-w-0 flex-shrink">
    <h3 class="text-[0.6em] font-medium text-muted-foreground whitespace-nowrap">
      Background
    </h3>
  </div>

  <!-- Right: Color Swatches and Clear -->
  <div class="flex items-center gap-1.5 flex-1">
    {#each colorPresets as preset}
      <button
        class={getColorClass(preset.color)}
        style="background-color: {preset.color};"
        onclick={() => handleColorClick(preset.color)}
        disabled={props.isProcessing}
        title={preset.label}
      >
        <span class="sr-only">{preset.label}</span>
      </button>
    {/each}
    
    <!-- Clear button -->
    <button
      class={cn(
        "w-6 h-6 rounded border-2 border-dashed border-gray-400 dark:border-gray-500 hover:border-red-400 transition-all flex items-center justify-center",
        !props.backgroundColor && "border-red-400 bg-red-50 dark:bg-red-950/20",
        props.isProcessing && "opacity-50 cursor-not-allowed"
      )}
      onclick={handleClear}
      disabled={props.isProcessing}
      title="Clear background"
    >
      <X class="w-3 h-3 text-gray-500 dark:text-gray-400" />
    </button>
  </div>
</div>