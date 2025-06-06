<!-- src/lib/features/addon/features/table/ColorControls.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { X, ChevronDown, Copy, Check } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { fade } from "svelte/transition";
  import ColorPicker from "../colors/ColorPicker.svelte";

  // Props
  const props = $props<{
    backgroundColor: string;
    isProcessing: boolean;
    onColorChange: (color: string) => void;
  }>();

  // State for color picker
  let showColorPicker = $state(false);
  let copySuccess = $state(false);

  // Quick color presets
  const colorPresets = [
    { color: '#f3f3f3', label: 'Light Gray' },
    { color: '#e0e0e0', label: 'Gray' },
    { color: '#e3f2fd', label: 'Light Blue' },
    { color: '#e8f5e8', label: 'Light Green' },
    { color: '#fff9c4', label: 'Light Yellow' },
    { color: '#ffffff', label: 'White' }
  ];

  // Get button class for color swatches
  function getColorClass(color: string) {
    const isSelected = props.backgroundColor === color;
    return cn(
      "w-6 h-6 rounded border-2 transition-all",
      isSelected 
        ? "border-primary shadow-md scale-110" 
        : "border-border hover:border-primary hover:scale-105",
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

  // Toggle color picker
  function toggleColorPicker() {
    showColorPicker = !showColorPicker;
  }

  // Handle color update from picker
  function handleColorUpdate(color: string) {
    props.onColorChange(color);
  }

  // Copy color to clipboard
  async function copyColorToClipboard() {
    if (!props.backgroundColor) return;
    
    try {
      await navigator.clipboard.writeText(props.backgroundColor);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 1500);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }

  // Strip alpha from color for display
  function stripAlpha(color: string): string {
    if (color.toUpperCase() === "#FFFFFF" || color.toUpperCase() === "FFFFFF") {
      return "#FFFFFF";
    }
    return color.replace(/FF$/, "").slice(0, 7).toUpperCase();
  }

  // Get display color (current background or default)
  function getDisplayColor(): string {
    return props.backgroundColor || '#FFFFFF';
  }
</script>

<div class="relative space-y-2">
  <!-- Color Picker Overlay - positioned above entire control -->
  {#if showColorPicker}
    <div
      class="absolute bottom-full left-0 right-0 z-20 mb-2 bg-card border border-border rounded-xl shadow-lg p-4"
      transition:fade={{ duration: 150 }}
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium">Custom Color</h3>
        <Button 
          variant="ghost" 
          size="icon"
          class="h-6 w-6"
          onclick={toggleColorPicker}
        >
          <ChevronDown class="h-3 w-3" />
        </Button>
      </div>
      
      <ColorPicker 
        initialColor={getDisplayColor()} 
        onColorUpdate={handleColorUpdate} 
      />
    </div>
  {/if}

  <!-- Row 1: Background label and color picker button -->
  <div class="flex items-center justify-between">
    <h3 class="text-[0.6em] font-medium text-muted-foreground whitespace-nowrap">
      Background
    </h3>
    
    <!-- Color picker button -->
    <button
      class="flex items-center rounded-lg overflow-hidden border border-border bg-card text-sm shadow-sm transition-all duration-200 hover:bg-accent disabled:opacity-50 group h-6"
      onclick={(e) => {
        // Only open picker if clicking outside copy button
        if (!e.target.closest('.copy-button')) {
          toggleColorPicker();
        }
      }}
      disabled={props.isProcessing}
    >
      <!-- Color preview -->
      <div class="h-5 ml-[1px] aspect-square relative">
        <div
          class="absolute inset-0.5 border border-black/5 rounded-sm"
          style="background-color: {getDisplayColor()};"
        ></div>
      </div>
      
      <!-- Color value and copy button -->
      <div class="relative px-2 flex items-center justify-between min-w-0">
        <span class="font-mono text-xs tracking-wider uppercase truncate">
          {stripAlpha(getDisplayColor())}
        </span>
        
        {#if props.backgroundColor}
          <!-- Copy button -->
          <Button
            variant="ghost"
            size="icon"
            class="copy-button h-4 w-4 -mr-1 p-0 hover:bg-background/80 ml-1"
            onclick={(e) => {
              e.stopPropagation();
              copyColorToClipboard();
            }}
            title="Copy color code"
            disabled={props.isProcessing}
          >
            {#if copySuccess}
              <Check class="h-2 w-2 text-green-500" />
            {:else}
              <Copy class="h-2 w-2 text-muted-foreground" />
            {/if}
          </Button>
        {/if}
      </div>
    </button>
  </div>

  <!-- Row 2: Clear button first, then color swatches -->
  <div class="flex items-center gap-1.5">
    <!-- Clear button first -->
    <button
      class={cn(
        "w-6 h-6 rounded border-2 border-dashed border-border hover:border-red-400 transition-all flex items-center justify-center",
        !props.backgroundColor && "border-red-400 bg-red-50 dark:bg-red-950/20",
        props.isProcessing && "opacity-50 cursor-not-allowed"
      )}
      onclick={handleClear}
      disabled={props.isProcessing}
      title="Clear background"
    >
      <X class="w-3 h-3 text-muted-foreground" />
    </button>
    
    <!-- Color swatches -->
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
  </div>
</div>