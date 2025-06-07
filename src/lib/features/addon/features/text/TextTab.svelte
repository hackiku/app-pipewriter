<!-- Updated src/lib/features/addon/features/text/TextTab.svelte -->
<script lang="ts">
  import TextDropdown from "./TextDropdown.svelte";
  import TextActions from "./TextActions.svelte";
  import { Button } from "$lib/components/ui/button";
  import { RefreshCcw, Heading, Save } from "@lucide/svelte";
  import { insertElement } from "$lib/services/google/docs";
  import { applyTextStyle, updateAllMatchingHeadings, getStyleInfo, getAllDocumentStyles } from "$lib/services/google/text";
  import type { ElementTheme } from '$lib/types/elements';
  import type { HeadingType } from '$lib/services/google/text';
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
    headingType: HeadingType;
    tag: string;
    label: string;
    fontSize?: number;
    extracted?: boolean; // Flag to indicate if this was extracted from docs
    attributes?: any; // Store extracted attributes
  } | null>(null);
  let savedStyles = $state<any[]>([]); // Reactive state for saved styles
  let elementsTheme = $state<ElementTheme>('light');
  let appTheme = $state<ElementTheme>('light');
  let observer: MutationObserver | null = null;
  
  // Get reference to dropdown functions
  let dropdownRef = $state<any>(null);

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
  function selectStyle(style: any) {
    selectedStyle = style;
  }

  // Extract style from current cursor position in Google Docs
  async function extractStyle() {
    if (isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    props.onStatusUpdate({
      type: 'processing',
      message: 'Getting style info...'
    });

    try {
      // Use a shorter timeout and better error handling
      const response = await Promise.race([
        getStyleInfo((statusUpdate) => {
          props.onStatusUpdate(statusUpdate);
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Style extraction timed out after 10 seconds')), 10000)
        )
      ]) as any;
      
      if (response.success && response.data) {
        // Use dropdown's createExtractedStyle function
        if (dropdownRef?.createExtractedStyle) {
          const extractedStyle = dropdownRef.createExtractedStyle(response.data);
          selectedStyle = extractedStyle;
          
          props.onStatusUpdate({
            type: 'success',
            message: `Extracted ${extractedStyle.label} style`,
            executionTime: response.executionTime
          });
        } else {
          throw new Error("Style mapping functions not available");
        }
      } else {
        throw new Error(response.error || "Failed to extract style");
      }
    } catch (error) {
      console.error("Failed to extract style:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to extract style";
      
      props.onStatusUpdate({
        type: 'error',
        message: errorMessage,
        details: 'Make sure your cursor is positioned in text and try again'
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  // Extract all styles from document (placeholder for future implementation)
  async function extractAllStyles() {
    if (isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    props.onStatusUpdate({
      type: 'processing',
      message: 'Getting all document styles...'
    });

    try {
      const response = await Promise.race([
        getAllDocumentStyles((statusUpdate) => {
          props.onStatusUpdate(statusUpdate);
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Style extraction timed out after 15 seconds')), 15000)
        )
      ]) as any;
      
      if (response.success && response.data) {
        // Process all styles and update saved styles
        if (dropdownRef?.createExtractedStyle) {
          const extractedStyles = response.data.styles?.map((styleData: any) => 
            dropdownRef.createExtractedStyle(styleData)
          ) || [];
          
          savedStyles = extractedStyles;
          
          props.onStatusUpdate({
            type: 'success',
            message: `Extracted ${extractedStyles.length} styles from document`,
            executionTime: response.executionTime
          });
        } else {
          throw new Error("Style mapping functions not available");
        }
      } else {
        throw new Error(response.error || "Failed to extract all styles");
      }
    } catch (error) {
      console.error("Failed to extract all styles:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to extract all styles";
      
      props.onStatusUpdate({
        type: 'error',
        message: errorMessage,
        details: 'Make sure the document contains text content and try again'
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  // Update all matching styles in document
  async function updateAllStyles() {
    if (isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    props.onStatusUpdate({
      type: 'processing',
      message: 'Updating all matching styles...'
    });

    try {
      const response = await updateAllMatchingHeadings((statusUpdate) => {
        props.onStatusUpdate(statusUpdate);
      });
      
      if (response.success) {
        props.onStatusUpdate({
          type: 'success',
          message: response.data?.message || 'All matching styles updated',
          executionTime: response.executionTime
        });
      } else {
        throw new Error(response.error || "Failed to update all styles");
      }
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
      const response = await applyTextStyle(selectedStyle.headingType, (statusUpdate) => {
        props.onStatusUpdate(statusUpdate);
      });
      
      if (response.success) {
        props.onStatusUpdate({
          type: 'success',
          message: `${selectedStyle.label} style applied`,
          executionTime: response.executionTime
        });
      } else {
        throw new Error(response.error || "Failed to apply style");
      }
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

  // Save current style to reactive state
  function saveStyle() {
    if (!selectedStyle) return;
    
    // Add to saved styles if not already present
    const existingIndex = savedStyles.findIndex(style => 
      style.headingType === selectedStyle.headingType && 
      style.extracted === selectedStyle.extracted
    );
    
    if (existingIndex >= 0) {
      // Update existing style
      savedStyles[existingIndex] = { ...selectedStyle };
    } else {
      // Add new style
      savedStyles = [...savedStyles, { ...selectedStyle }];
    }
    
    props.onStatusUpdate({
      type: 'success',
      message: `${selectedStyle.label} style saved`
    });
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
    bind:this={dropdownRef}
    selectedStyle={selectedStyle}
    disabled={isProcessing}
    onSelect={selectStyle}
  />

  <!-- Actions - Updated with all functions -->
  <TextActions
    isProcessing={isProcessing}
    selectedStyle={selectedStyle}
    theme={elementsTheme}
    svgUrl={getSvgUrl()}
    onStyleGuideInsert={handleStyleGuideInsert}
    onExtractStyle={extractStyle}
    onExtractAllStyles={extractAllStyles}
    onUpdateAllStyles={updateAllStyles}
    onToggleTheme={toggleTheme}
  />

  <!-- Action Buttons Row - Full Width -->
  <div class="flex gap-2 w-full">
    <!-- Save Button -->
    <Button
      variant="outline"
      class="flex-1 h-8 flex items-center justify-center text-xs"
      disabled={isProcessing || !selectedStyle}
      onclick={saveStyle}
      title="Save current style to collection"
    >
      <Save class="h-3 w-3 mr-2" />
      <span>Save</span>
    </Button>

    <!-- Reset Button -->
    <Button
      variant="outline"
      class="h-8 w-8 aspect-square flex items-center justify-center text-xs"
      disabled={isProcessing || !selectedStyle}
      onclick={resetStyle}
      title="Reset style selection"
    >
      <RefreshCcw class="h-3 w-3" />
    </Button>

    <!-- Apply Style Button -->
    <Button
      variant={selectedStyle ? "default" : "outline"}
      class="flex-1 h-8 flex items-center justify-center text-xs"
      disabled={isProcessing || !selectedStyle}
      onclick={applyStyle}
      title="Apply style to text at cursor"
    >
      <Heading class="h-3 w-3 mr-2" />
      <span>Apply</span>
    </Button>
  </div>
</div>