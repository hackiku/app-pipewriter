<!-- src/lib/features/addon/features/colors/ColorTab.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Check, Loader2, Copy, Palette, ChevronDown } from "@lucide/svelte";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import ColorPicker from "./ColorPicker.svelte";
  import ColorButton from "./ColorButton.svelte";
  // import StatusManager from "../../components/StatusManager.svelte";
  import { changeBackground, getCurrentColor } from "$lib/services/google/colors";
  import { colorCategories, quickColors, type ColorScheme } from './color-data';
  
  // Props using SvelteKit 5 syntax
  const props = $props<{
    context: any;
    onStatusUpdate: (status: {
      type: 'processing' | 'success' | 'error';
      message: string;
      details?: string;
      executionTime?: number;
      error?: any;
    }) => void;
    onProcessingStart: () => void;
    onProcessingEnd: () => void;
  }>();
  
  // State
  let currentColor = $state("#FFFFFF");
  let showColorPicker = $state(false);
  let isProcessing = $state(false);
  let status = $state<{
    type: 'processing' | 'success' | 'error';
    message: string;
    details?: string;
    executionTime?: number;
    error?: any;
  } | null>(null);

  // Initialize by getting the current color
  $effect(() => {
    if (props.context?.googleService) {
      loadCurrentColor();
    }
  });

  // Status management
  function updateStatus(newStatus: typeof status) {
    status = newStatus;
    props.onStatusUpdate?.(newStatus);
  }

  function clearStatus() {
    status = null;
  }

  async function loadCurrentColor() {
    if (isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    try {
      const response = await getCurrentColor((statusUpdate) => {
        updateStatus(statusUpdate);
      });
      
      if (response.success && response.data?.color) {
        currentColor = response.data.color;
      }
    } catch (error) {
      console.error("Failed to get current color:", error);
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  function stripAlpha(color: string): string {
    if (color.toUpperCase() === "#FFFFFF" || color.toUpperCase() === "FFFFFF") {
      return "#FFFFFF";
    }
    return color.replace(/FF$/, "").slice(0, 7).toUpperCase();
  }

  async function handleColorChange(color: string) {
    if (isProcessing) return;

    isProcessing = true;
    props.onProcessingStart();
    updateStatus({
      type: 'processing',
      message: 'Applying color...',
      details: `Changing background to ${color}`
    });

    try {
      const cleanColor = stripAlpha(color);
      
      const response = await changeBackground(cleanColor, (statusUpdate) => {
        updateStatus(statusUpdate);
      });

      if (response.success) {
        currentColor = cleanColor;
        updateStatus({
          type: 'success',
          message: 'Color applied',
          executionTime: response.executionTime
        });
      } else {
        throw new Error(response.error || "Failed to change color");
      }
    } catch (error) {
      console.error("Failed to change background:", error);
      updateStatus({
        type: 'error',
        message: error instanceof Error ? error.message : "Failed to change color",
        error
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  function handleColorUpdate(color: string) {
    currentColor = stripAlpha(color);
  }

  function handleSubmit() {
    handleColorChange(currentColor);
  }
  
  function handlePresetColorClick(preset: ColorScheme) {
    if (preset.isGradient) {
      showColorPicker = !showColorPicker;
    } else {
      handleColorChange(preset.color);
    }
  }

  // Copy color to clipboard
  async function copyColorToClipboard() {
    try {
      await navigator.clipboard.writeText(currentColor);
      updateStatus({
        type: 'success',
        message: 'Color copied to clipboard',
        details: `Copied ${currentColor}`
      });
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }
</script>

<div class="relative">
  <!-- StatusManager -->
  <!-- <StatusManager {status} onStatusClose={clearStatus} variant="bar" /> -->

  <div class="flex flex-col items-stretch w-full gap-4">
    {#if showColorPicker}
      <div
        class="relative rounded-xl z-10 w-full p-3 bg-card border border-border shadow-sm"
        transition:slide={{ duration: 150, axis: "y" }}
      >
        <ColorPicker 
          initialColor={currentColor} 
          onColorUpdate={handleColorUpdate} 
        />
      </div>
    {/if}

    <!-- ENHANCED: Better color input with copy functionality -->
    <div class="flex gap-2 h-8">
      <button
        class="flex flex-1 items-center rounded-lg overflow-hidden border border-input bg-card text-sm shadow-sm transition-all duration-200 hover:bg-accent disabled:opacity-50 group"
        onclick={() => showColorPicker = !showColorPicker}
        disabled={isProcessing}
      >
        <!-- Color preview with subtle border -->
        <div 
          class="h-full aspect-square border-r border-border relative"
          style="background-color: {currentColor};"
        >
          <!-- Subtle inner border for white colors -->
          <div class="absolute inset-0.5 border border-black/5 rounded-sm"></div>
        </div>
        
        <!-- Color value -->
        <div class="flex-1 px-3 flex items-center justify-between">
          <span class="font-mono text-xs tracking-wider uppercase">{currentColor}</span>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronDown class="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </button>

      <!-- Copy button -->
      <Button 
        variant="outline" 
        size="icon"
        class="h-full aspect-square"
        onclick={copyColorToClipboard}
        disabled={isProcessing}
        title="Copy color code"
      >
        <Copy class="h-3 w-3" />
      </Button>

      <!-- Apply button -->
      <Button 
        variant="default" 
        class="px-4 h-full _min-w-[80px]"
        disabled={isProcessing}
        onclick={handleSubmit}
      >
        {#if isProcessing}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          <Check class="h-4 w-4 mr-1"/> Apply
        {/if}
      </Button>
    </div>
    
    <!-- Quick Colors - Most used colors in 2 rows -->
    <div class="space-y-2">
      <div class="flex items-center gap-2 px-1">
        <Palette class="h-3 w-3 text-muted-foreground" />
        <span class="text-xs font-medium text-muted-foreground">Quick Colors</span>
      </div>
      
      <div class="grid grid-cols-5 gap-2">
        {#each quickColors as preset}
          <ColorButton
            color={preset.color}
            title={preset.title}
            isGradient={preset.isGradient || false}
            isSelected={preset.isGradient ? showColorPicker : currentColor === preset.color}
            isProcessing={isProcessing}
            onClick={() => handlePresetColorClick(preset)}
          />
        {/each}
      </div>
    </div>

    <!-- ENHANCED: Accordion for organized color categories -->
    <Accordion.Root type="single" class="w-full">
      {#each colorCategories as category}
        <Accordion.Item value={category.id} class="border-b border-border">
          <Accordion.Trigger class="flex items-center justify-between w-full py-3 px-1 text-left hover:no-underline">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{category.name}</span>
              <span class="text-xs text-muted-foreground">({category.colors.length})</span>
            </div>
          </Accordion.Trigger>
          
          <Accordion.Content class="pb-4">
            <p class="text-xs text-muted-foreground mb-3 px-1">{category.description}</p>
            
            <div class="grid grid-cols-5 gap-2">
              {#each category.colors as preset}
                <div class="relative">
                  <ColorButton
                    color={preset.color}
                    title={preset.title}
                    isSelected={currentColor === preset.color}
                    isProcessing={isProcessing}
                    onClick={() => handlePresetColorClick(preset)}
                  />
                  
                  <!-- Pro badge for premium colors -->
                  {#if preset.tier === 'pro'}
                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  </div>
</div>