<!-- src/lib/features/addon/features/table/ColorControls.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import XIcon from "@lucide/svelte/icons/x";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import CopyIcon from "@lucide/svelte/icons/copy";
  import CheckIcon from "@lucide/svelte/icons/check";
  import Crown from "@lucide/svelte/icons/crown";
  import { Button } from "$lib/components/ui/button";
  import { fade, slide } from "svelte/transition";
  import ColorPicker from "../colors/ColorPicker.svelte";

  // Props - ENHANCED with features and upgrade support
  const props = $props<{
    backgroundColor: string;
    isProcessing: boolean;
    features?: any; // Added features prop
    onColorChange: (color: string) => void;
    onOpenUpgrade?: () => void; // Added upgrade callback
  }>();

  // User tier access control
  const userTier = props.features?.tier || 'free';
  
  function canUseFeature(): boolean {
    return userTier === 'pro' || userTier === 'trial';
  }

  // State for accordion and color picker
  let isOpen = $state(false);
  let showColorPicker = $state(false);
  let copySuccess = $state(false);

  // Quick color presets - 7 colors + clear button = 8 total
  const colorPresets = [
    { color: '#ffffff', label: 'White' },
    { color: '#f3f3f3', label: 'Light Gray' },
    { color: '#e0e0e0', label: 'Gray' },
    { color: '#e3f2fd', label: 'Light Blue' },
    { color: '#e8f5e8', label: 'Light Green' },
    { color: '#fff9c4', label: 'Light Yellow' },
    { color: '#333333', label: 'Dark Gray' }
  ];

  // Toggle accordion - ALWAYS allow opening to show what they're missing
  function toggleAccordion() {
    isOpen = !isOpen;
  }

  // Get button class for color swatches
  function getColorClass(color: string) {
    const isSelected = props.backgroundColor === color;
    return cn(
      "w-6 h-6 rounded border-2 transition-all",
      isSelected 
        ? "border-primary shadow-md scale-110" 
        : "border-border hover:border-primary hover:scale-105",
      (props.isProcessing || !canUseFeature()) && "opacity-50 cursor-not-allowed"
    );
  }

  // Handle color click - either use feature or prompt upgrade
  function handleColorClick(color: string) {
    if (!props.isProcessing && canUseFeature()) {
      props.onColorChange(color);
    }
  }

  // Handle clear background - either use feature or prompt upgrade  
  function handleClear() {
    if (!props.isProcessing && canUseFeature()) {
      props.onColorChange('');
    }
  }

  // Toggle color picker - only works if user has access
  function toggleColorPicker() {
    if (canUseFeature()) {
      showColorPicker = !showColorPicker;
    }
  }

  // Handle color update from picker
  function handleColorUpdate(color: string) {
    if (canUseFeature()) {
      props.onColorChange(color);
    }
  }

  // Copy color to clipboard
  async function copyColorToClipboard() {
    if (!props.backgroundColor || !canUseFeature()) return;
    
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

<div class="relative">
  <!-- Color Picker Overlay - positioned above entire control -->
  {#if showColorPicker && isOpen && canUseFeature()}
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
          <ChevronDownIcon class="h-3 w-3" />
        </Button>
      </div>
      
      <ColorPicker 
        initialColor={getDisplayColor()} 
        onColorUpdate={handleColorUpdate} 
      />
    </div>
  {/if}

  <!-- Accordion Header - ALWAYS allow opening -->
  <button 
    class="flex items-center justify-between w-full py-2 text-left group hover:bg-accent/50 rounded-md px-1 transition-colors"
    onclick={toggleAccordion}
    disabled={props.isProcessing}
  >
    <h3 class="text-[0.6em] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
      Background color
    </h3>
    
    <div class="flex items-center gap-1">
      {#if isOpen}
        <ChevronDownIcon class="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-all" />
      {:else}
        <ChevronRightIcon class="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-all" />
      {/if}
    </div>
  </button>

  <!-- Accordion Content -->
  {#if isOpen && canUseFeature()}
    <div transition:slide={{ duration: 200 }}>
      <!-- 2 Column Layout (original design) -->
      <div class="grid grid-cols-2 gap-3 h-full mt-2">
        
        <!-- LEFT: Color Picker -->
        <div class="flex flex-col justify-between gap-2 h-full">
          <!-- Color picker button -->
          <button
            class="flex items-center rounded-lg overflow-hidden border border-border bg-card text-sm shadow-sm transition-all duration-200 hover:bg-accent disabled:opacity-50 group h-8"
            onclick={(e) => {
              // Only open picker if clicking outside copy button
              if (!e.target.closest('.copy-button')) {
                toggleColorPicker();
              }
            }}
            disabled={props.isProcessing}
          >
            <!-- Color preview -->
            <div class="h-6 ml-[1px] aspect-square relative">
              <div
                class="absolute inset-0.5 border border-black/5 rounded-sm"
                style="background-color: {getDisplayColor()};"
              ></div>
            </div>
            
            <!-- Color value and copy button -->
            <div class="relative px-2 flex items-center justify-between min-w-0 flex-1">
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
                    <CheckIcon class="h-2 w-2 text-green-500" />
                  {:else}
                    <CopyIcon class="h-2 w-2 text-muted-foreground" />
                  {/if}
                </Button>
              {/if}
            </div>
          </button>
        </div>

        <!-- RIGHT: Color Swatches Grid (2 rows x 4 columns) -->
        <div class="flex flex-col gap-2 h-full justify-between">
          <!-- Row 1: Clear + 3 colors -->
          <div class="grid grid-cols-4 gap-1.5">
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
              <XIcon class="w-3 h-3 text-muted-foreground" />
            </button>
            
            <!-- First 3 color swatches -->
            {#each colorPresets.slice(0, 3) as preset}
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
          
          <!-- Row 2: Last 4 colors -->
          <div class="grid grid-cols-4 gap-1.5">
            {#each colorPresets.slice(3) as preset}
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
      </div>
    </div>
  {/if}

  <!-- Upgrade Bar (below accordion content when needed) -->
  {#if isOpen && !canUseFeature()}
    <div 
      class="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 
             border border-amber-200 dark:border-amber-800 rounded-md backdrop-blur-sm
             flex items-center justify-between px-3 py-2"
      transition:slide={{ duration: 200 }}
    >
      <div class="flex items-center gap-2">
        <Crown class="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span class="text-xs font-medium text-amber-800 dark:text-amber-200">
          Upgrade for background colors
        </span>
      </div>
      <Button
        variant="default"
        size="sm"
        class="h-6 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
        onclick={() => props.onOpenUpgrade?.()}
      >
        Upgrade
      </Button>
    </div>
  {/if}
</div>