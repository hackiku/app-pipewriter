<!-- Updated src/lib/features/addon/features/text/TextTab.svelte -->
<script lang="ts">
  import TextDropdown from "./TextDropdown.svelte";
  import TextActions from "./TextActions.svelte";
  import { insertElement } from "$lib/services/google/docs";
  import type { ElementTheme } from '$lib/types/elements';
  import { onMount, onDestroy } from 'svelte';
  
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
  let selectedStyle = $state<{
    headingType: string;
    tag: string;
    label: string;
    fontSize?: number;
  } | null>(null);
  let elementsTheme = $state<ElementTheme>('light');
  let appTheme = $state<ElementTheme>('light');
  let observer: MutationObserver | null = null;

  // Setup mutation observer to detect app theme changes (same as ElementCard)
  onMount(() => {
    // Initial dark mode check
    appTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    // Watch for dark mode changes
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const newAppTheme = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light';
          if (appTheme !== newAppTheme) {
            appTheme = newAppTheme;
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  });

  // Clean up observer
  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  // Toggle theme function - creates contrast with app theme
  function toggleTheme() {
    elementsTheme = elementsTheme === 'light' ? 'dark' : 'light';
    
    props.onStatusUpdate({
      type: 'success',
      message: `Switched to ${elementsTheme} theme`
    });
  }

  // Handle style selection
  function selectStyle(style) {
    selectedStyle = style;
  }

  // Handle styleguide insertion with smart SVG contrast logic
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

  // Apply style to current selection (where cursor is)
  async function applyStyle() {
    if (!selectedStyle || isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    props.onStatusUpdate({
      type: 'processing',
      message: `Applying ${selectedStyle.label} style...`
    });

    try {
      // TODO: Connect to actual Google Docs API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      props.onStatusUpdate({
        type: 'success',
        message: `${selectedStyle.label} style applied`,
        executionTime: 300
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

  // Apply style to all matching text in document
  async function updateAllStyles() {
    if (!selectedStyle || isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    props.onStatusUpdate({
      type: 'processing',
      message: `Updating all ${selectedStyle.label} styles...`
    });

    try {
      // TODO: Connect to actual Google Docs API for "update all"
      await new Promise(resolve => setTimeout(resolve, 500));
      
      props.onStatusUpdate({
        type: 'success',
        message: `All ${selectedStyle.label} styles updated`,
        executionTime: 500
      });
    } catch (error) {
      console.error("Failed to update all styles:", error);
      props.onStatusUpdate({
        type: 'error',
        message: error instanceof Error ? error.message : "Failed to update all styles"
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  // Reset style selection
  function resetStyle() {
    selectedStyle = null;
    
    props.onStatusUpdate({
      type: 'success',
      message: 'Style selection cleared'
    });
  }

  // Get SVG URL with contrast logic (same as ElementCard)
  function getSvgUrl(): string {
    const baseId = 'styleguide';
    
    // CONTRAST LOGIC: If elementsTheme !== appTheme → use dark SVG
    // This makes the styleguide element contrast with the app background
    const shouldUseDarkVariant = elementsTheme !== appTheme;
    
    if (shouldUseDarkVariant) {
      return `/elements/${baseId}-dark.svg`;
    }
    return `/elements/${baseId}.svg`;
  }
</script>

<div class="flex flex-col items-stretch w-full gap-2">
  <!-- Style Selector Dropdown -->
  <TextDropdown
    selectedStyle={selectedStyle}
    disabled={isProcessing}
    onSelect={selectStyle}
  />

  <!-- Actions - Updated to remove Get button and add Update All -->
  <TextActions
    isProcessing={isProcessing}
    selectedStyle={selectedStyle}
    theme={elementsTheme}
    svgUrl={getSvgUrl()}
    onStyleGuideInsert={handleStyleGuideInsert}
    onApplyStyle={applyStyle}
    onUpdateAll={updateAllStyles}
    onResetStyle={resetStyle}
    onToggleTheme={toggleTheme}
  />
</div>