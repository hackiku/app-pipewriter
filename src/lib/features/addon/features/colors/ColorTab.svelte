<!-- src/lib/features/addon/features/colors/ColorTab.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Check, Loader2, Copy, ChevronDown, Crown } from "@lucide/svelte";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import ColorPicker from "./ColorPicker.svelte";
  import ColorButton from "./ColorButton.svelte";
  import { changeBackground, getCurrentColor } from "$lib/services/google/colors";
  import { colorCategories, type ColorScheme } from './color-data';
  
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
  let activeTab = $state(colorCategories[0]?.id || "base"); // Always start with first tab
  let copySuccess = $state(false);
  let isEditingHex = $state(false);
  let hexInputValue = $state("#FFFFFF");

  // Initialize by getting the current color
  $effect(() => {
    if (props.context?.googleService) {
      loadCurrentColor();
    }
  });

  // Sync hex input with current color
  $effect(() => {
    hexInputValue = currentColor;
  });

  // Status management
  function updateStatus(newStatus: typeof props.onStatusUpdate extends (arg: infer T) => any ? T : never) {
    props.onStatusUpdate?.(newStatus);
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
        const cleanColor = stripAlpha(response.data.color);
        currentColor = cleanColor;
        hexInputValue = cleanColor;
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
    const cleanColor = stripAlpha(color);
    currentColor = cleanColor;
    hexInputValue = cleanColor;
  }

  function handleSubmit() {
    handleColorChange(currentColor);
  }
  
  // Changed: swatches only update picker, don't apply
  function handlePresetColorClick(preset: ColorScheme) {
    handleColorUpdate(preset.color);
  }

  // Handle hex input editing
  function handleHexEdit() {
    isEditingHex = true;
  }

  function handleHexSubmit(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const cleanHex = hexInputValue.startsWith('#') ? hexInputValue : `#${hexInputValue}`;
      if (/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        handleColorUpdate(cleanHex);
      }
      isEditingHex = false;
    } else if (event.key === 'Escape') {
      hexInputValue = currentColor;
      isEditingHex = false;
    }
  }

  function handleHexBlur() {
    const cleanHex = hexInputValue.startsWith('#') ? hexInputValue : `#${hexInputValue}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      handleColorUpdate(cleanHex);
    } else {
      hexInputValue = currentColor;
    }
    isEditingHex = false;
  }

  // Toggle color picker
  function toggleColorPicker() {
    showColorPicker = !showColorPicker;
  }

  // Copy color to clipboard with visual feedback
  async function copyColorToClipboard() {
    try {
      await navigator.clipboard.writeText(currentColor);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 1500);
      
      updateStatus({
        type: 'success',
        message: 'Color copied to clipboard',
        details: `Copied ${currentColor}`
      });
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }

  // Get colors for active tab, split into 2 rows (no reverse - light/dark already organized)
  function getTabColors(tabId: string) {
    const category = colorCategories.find(cat => cat.id === tabId);
    if (!category) return { row1: [], row2: [] };
    
    const colors = category.colors;
    const mid = Math.ceil(colors.length / 2);
    
    return {
      row1: colors.slice(0, mid),      // First half (light)
      row2: colors.slice(mid)          // Second half (dark)
    };
  }

  // Check if category has pro colors
  function hasPro(category: typeof colorCategories[0]): boolean {
    return category.tier === 'pro' || category.colors.some(color => color.tier === 'pro');
  }
</script>

<div class="relative flex flex-col h-full">
  <!-- Color Picker Overlay - positioned above bottom controls -->
  {#if showColorPicker}
    <div
      class="absolute bottom-12 left-0 right-0 z-20 bg-card border border-border rounded-xl shadow-lg p-4"
      transition:slide={{ duration: 200, axis: "y" }}
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
        initialColor={currentColor} 
        onColorUpdate={handleColorUpdate} 
      />
    </div>
  {/if}

  <!-- Main Content -->
  <div class="flex flex-col h-full space-y-4">
    <!-- Scrollable Tabs -->
    <Tabs.Root value={activeTab} onValueChange={(value) => activeTab = value || colorCategories[0]?.id || "base"}>
      <div class="relative">
        <Tabs.List class="flex w-full gap-1 bg-muted/50 p-1 rounded-lg overflow-x-auto scrollbar-none justify-start">
          {#each colorCategories as category}
            <Tabs.Trigger 
              value={category.id}
              class="flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex-shrink-0"
            >
              <span>{category.name}</span>
              {#if hasPro(category)}
                <Crown class="h-3 w-3 text-amber-500" />
              {/if}
            </Tabs.Trigger>
          {/each}
        </Tabs.List>
      </div>

      <!-- Tab Content: Color Swatches in 2 Rows -->
      <div class="flex-1 overflow-hidden">
        {#each colorCategories as category}
          <Tabs.Content value={category.id} class="h-full">
            {@const { row1, row2 } = getTabColors(category.id)}
            
            <div class="gap-4 h-full flex flex-col">
              <!-- Row 1 -->
              <div class="grid grid-cols-5 gap-2">
                {#each row1 as preset}
                  <div class="relative p-0.5">
                    <ColorButton
                      color={preset.color}
                      title={preset.title}
                      isSelected={currentColor === preset.color}
                      isProcessing={isProcessing}
                      onClick={() => handlePresetColorClick(preset)}
                    />
                    
                    <!-- Pro badge for premium colors -->
                    {#if preset.tier === 'pro'}
                      <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                        <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
              
              <!-- Row 2 -->
              {#if row2.length > 0}
                <div class="grid grid-cols-5 gap-2">
                  {#each row2 as preset}
                    <div class="relative p-0.5">
                      <ColorButton
                        color={preset.color}
                        title={preset.title}
                        isSelected={currentColor === preset.color}
                        isProcessing={isProcessing}
                        onClick={() => handlePresetColorClick(preset)}
                      />
                      
                      <!-- Pro badge for premium colors -->
                      {#if preset.tier === 'pro'}
                        <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </Tabs.Content>
        {/each}
      </div>
    </Tabs.Root>

    <!-- Bottom Controls: Hex Button + Apply -->
    <div class="flex gap-2 mt-auto h-9">
      <!-- Hex Color Button with Integrated Copy -->
      <button
        class="flex flex-1 items-center rounded-lg overflow-hidden border border-input bg-card text-sm shadow-sm transition-all duration-200 hover:bg-accent disabled:opacity-50 group"
        onclick={(e) => {
          // Only open picker if clicking outside hex text and copy button
          if (!e.target.closest('.hex-input') && !e.target.closest('.copy-button')) {
            toggleColorPicker();
          }
        }}
        disabled={isProcessing}
      >
        <!-- Color preview -->
        <div 
          class="h-9 aspect-square border-r border-border relative"
          style="background-color: {currentColor};"
        >
          <div class="absolute inset-0.5 border border-black/5 rounded-sm"></div>
        </div>
        
        <!-- Color value and copy button -->
        <div class="relative flex-1 px-3 flex items-center justify-between min-w-0">
          <!-- Editable hex input -->
          {#if isEditingHex}
            <input
              class="hex-input font-mono text-xs tracking-wider uppercase bg-transparent border-none outline-none flex-1"
              bind:value={hexInputValue}
              onkeydown={handleHexSubmit}
              onblur={handleHexBlur}
              autofocus
            />
          {:else}
            <span 
              class="hex-input font-mono text-xs tracking-wider uppercase truncate cursor-text"
              onclick={handleHexEdit}
            >
              {currentColor}
            </span>
          {/if}
          
          <!-- Copy button -->
          <Button
            variant="ghost"
            size="icon"
            class="copy-button h-6 w-6 ml-2 hover:bg-background/80"
            onclick={(e) => {
              e.stopPropagation();
              copyColorToClipboard();
            }}
            title="Copy color code"
            disabled={isProcessing}
          >
            {#if copySuccess}
              <Check class="h-3 w-3 text-green-500" />
            {:else}
              <Copy class="h-3 w-3 text-muted-foreground" />
            {/if}
          </Button>
        </div>
      </button>

      <!-- Apply button -->
      <Button 
        variant="default" 
        class="px-3 h-9 text-xs"
        disabled={isProcessing}
        onclick={handleSubmit}
      >
        {#if isProcessing}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          <Check class="h-3 w-3 mr-1" />
          Set
        {/if}
      </Button>
    </div>
  </div>
</div>

<style>
  /* Hide scrollbar for tabs */
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>