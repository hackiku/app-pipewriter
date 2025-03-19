<!-- $lib/iframe/features/text/TextTab.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Check, Loader2, Pipette, RefreshCw, Heading } from "lucide-svelte";
  import ElementCard from "../dropper/ElementCard.svelte";
  import { insertElement } from "$lib/services/google/docs";
  import type { ElementTheme } from '$lib/data/addon/types';
  import { elementManager } from '$lib/data/addon/utils';
  
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
  let isProcessing = $state(false);
  let showStyleDropdown = $state(false);
  let selectedStyle = $state<{
    headingType: string;
    tag: string;
    label: string;
    fontSize?: number;
  } | null>(null);
  let elementsTheme = $state<ElementTheme>('light');
  
  // Default text styles that are always available
  const textStyles = [
    { headingType: 'NORMAL', tag: 'p', label: 'Normal text', fontSize: 11 },
    { headingType: 'HEADING1', tag: 'h1', label: 'Heading 1', fontSize: 24 },
    { headingType: 'HEADING2', tag: 'h2', label: 'Heading 2', fontSize: 20 },
    { headingType: 'HEADING3', tag: 'h3', label: 'Heading 3', fontSize: 16 },
    { headingType: 'HEADING4', tag: 'h4', label: 'Heading 4', fontSize: 14 },
    { headingType: 'HEADING5', tag: 'h5', label: 'Heading 5', fontSize: 12 },
    { headingType: 'HEADING6', tag: 'h6', label: 'Heading 6', fontSize: 11 }
  ];

  // Get the styleguide element
  const styleGuideElement = $state(elementManager.getElement("styleguide"));

  // Toggle theme function
  function toggleTheme() {
    elementsTheme = elementsTheme === 'light' ? 'dark' : 'light';
    
    // Notify about theme change
    props.onStatusUpdate({
      type: 'success',
      message: `Switched to ${elementsTheme} theme`
    });
  }

  // Handle styleguide insertion
  async function handleStyleGuideInsert() {
    if (isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    props.onStatusUpdate({
      type: 'processing',
      message: 'Inserting style guide...'
    });

    try {
      const response = await insertElement(
        "styleguide", 
        elementsTheme,
        (status) => {
          props.onStatusUpdate(status);
        }
      );
      
      if (response.success) {
        props.onStatusUpdate({
          type: 'success',
          message: 'Style guide inserted',
          executionTime: response.executionTime
        });
      } else {
        throw new Error(response.error || "Failed to insert style guide");
      }
    } catch (error) {
      console.error("Failed to insert style guide:", error);
      props.onStatusUpdate({
        type: 'error',
        message: error instanceof Error ? error.message : "Failed to insert style guide"
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  // Handle style selection
  function selectStyle(style) {
    selectedStyle = style;
    showStyleDropdown = false;
  }

  // Handle style application
  async function applySelectedStyle() {
    if (!selectedStyle || isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    props.onStatusUpdate({
      type: 'processing',
      message: `Applying ${selectedStyle.label} style...`
    });

    try {
      // We'll add proper implementation here with Google Docs API
      // For now, let's simulate a successful call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      props.onStatusUpdate({
        type: 'success',
        message: `${selectedStyle.label} style applied`,
        executionTime: 500
      });
    } catch (error) {
      console.error("Failed to apply style:", error);
      props.onStatusUpdate({
        type: 'error',
        message: error instanceof Error ? error.message : "Failed to apply style"
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  // Handle style reset
  function resetStyle() {
    selectedStyle = null;
    
    props.onStatusUpdate({
      type: 'success',
      message: 'Style selection cleared'
    });
  }
</script>

<div class="flex flex-col items-stretch w-full gap-2">
  <!-- Style Selector Dropdown -->
  <div class="relative">
    <button
      class="w-full h-10 px-3 flex items-center justify-between rounded-lg
             border border-input bg-white dark:bg-gray-800 text-sm shadow-sm 
             transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
      onclick={() => showStyleDropdown = !showStyleDropdown}
      disabled={isProcessing}
    >
      {#if selectedStyle}
        <div class="flex items-center gap-2">
          <span class="opacity-70">{selectedStyle.tag}</span>
          <span 
            class="text-muted-foreground"
            style={selectedStyle.fontSize ? `font-size: ${selectedStyle.fontSize}px` : ''}
          >
            {selectedStyle.label}
          </span>
        </div>
      {:else}
        <span class="text-muted-foreground">Select text style...</span>
      {/if}
      <span class="text-muted-foreground">
        {showStyleDropdown ? '▲' : '▼'}
      </span>
    </button>

    {#if showStyleDropdown}
      <div
        class="absolute top-full mt-1 w-full p-2 bg-white dark:bg-gray-800 
               rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-20"
        transition:slide={{ duration: 150, axis: "y" }}
      >
        <div class="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
          {#each textStyles as style}
            <button
              class="w-full text-left px-2 py-1.5 rounded-sm transition-colors
                    {selectedStyle?.headingType === style.headingType ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}"
              onclick={() => selectStyle(style)}
            >
              <div class="flex items-center gap-2">
                <span class="opacity-70 text-xs">{style.tag}</span>
                <span 
                  class="text-muted-foreground"
                  style={style.fontSize ? `font-size: ${style.fontSize}px` : ''}
                >
                  {style.label}
                </span>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Action Area: Two Columns -->
  <div class="flex gap-2">
    <!-- Left Column: Style Guide Element Card -->
    <div class="w-1/2">
      {#if styleGuideElement}
        <ElementCard
          element={styleGuideElement}
          onSelect={handleStyleGuideInsert}
          theme={elementsTheme}
          disabled={isProcessing}
          isSelected={false}
        />
      {:else}
        <div class="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <span class="text-muted-foreground">Style guide not found</span>
        </div>
      {/if}
    </div>
    
    <!-- Right Column: Action Buttons -->
    <div class="w-1/2 flex flex-col gap-2">
      <!-- Eyedropper/Apply Style Button -->
      <Button
        variant="outline"
        class="h-10 text-sm w-full flex items-center gap-2"
        disabled={isProcessing || !selectedStyle}
        onclick={applySelectedStyle}
      >
        <Pipette class="h-4 w-4" />
        {#if isProcessing}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          Apply Style
        {/if}
      </Button>
      
      <!-- Reset Button -->
      <Button
        variant="outline"
        class="h-10 text-sm w-full flex items-center gap-2"
        disabled={isProcessing || !selectedStyle}
        onclick={resetStyle}
      >
        <RefreshCw class="h-4 w-4" />
        Reset
      </Button>
    </div>
  </div>
</div>