<!-- Updated src/lib/features/addon/features/text/TextTab.svelte -->
<script lang="ts">
  import TextDropdown from "./TextDropdown.svelte";
  import TextActions from "./TextActions.svelte";
  import { insertElement } from "$lib/services/google/docs";
  import { applyTextStyle, updateAllMatchingHeadings, getStyleInfo } from "$lib/services/google/text";
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
      message: 'Extracting style from cursor position...'
    });

    try {
      const response = await getStyleInfo((statusUpdate) => {
        props.onStatusUpdate(statusUpdate);
      });
      
      if (response.success && response.data) {
        // Map the response to our selectedStyle format
        const { textAttributes, paragraphAttributes } = response.data;
        
        // Determine heading type (this comes from the Apps Script response)
        const headingType = determineHeadingType(response.data.heading);
        
        // Create extracted style object
        const extractedStyle = {
          headingType: headingType,
          tag: getTagForHeading(headingType),
          label: getLabelForHeading(headingType),
          fontSize: textAttributes?.FONT_SIZE || undefined,
          extracted: true,
          attributes: {
            text: textAttributes,
            paragraph: paragraphAttributes
          }
        };
        
        selectedStyle = extractedStyle;
        
        props.onStatusUpdate({
          type: 'success',
          message: `Extracted ${extractedStyle.label} style`,
          executionTime: response.executionTime
        });
      } else {
        throw new Error(response.error || "Failed to extract style");
      }
    } catch (error) {
      console.error("Failed to extract style:", error);
      props.onStatusUpdate({
        type: 'error',
        message: error instanceof Error ? error.message : "Failed to extract style"
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  // Helper functions to map Google Docs headings to our format
  function determineHeadingType(docHeading: any): HeadingType {
    // Map from DocumentApp.ParagraphHeading values to our HeadingType
    const headingMap: Record<string, HeadingType> = {
      'NORMAL': 'NORMAL',
      'HEADING1': 'HEADING1', 
      'HEADING2': 'HEADING2',
      'HEADING3': 'HEADING3',
      'HEADING4': 'HEADING4',
      'HEADING5': 'HEADING5',
      'HEADING6': 'HEADING6'
    };
    
    return headingMap[docHeading] || 'NORMAL';
  }

  function getTagForHeading(headingType: HeadingType): string {
    const tagMap: Record<HeadingType, string> = {
      'NORMAL': 'p',
      'HEADING1': 'h1',
      'HEADING2': 'h2', 
      'HEADING3': 'h3',
      'HEADING4': 'h4',
      'HEADING5': 'h5',
      'HEADING6': 'h6'
    };
    return tagMap[headingType];
  }

  function getLabelForHeading(headingType: HeadingType): string {
    const labelMap: Record<HeadingType, string> = {
      'NORMAL': 'Normal text',
      'HEADING1': 'Heading 1',
      'HEADING2': 'Heading 2',
      'HEADING3': 'Heading 3', 
      'HEADING4': 'Heading 4',
      'HEADING5': 'Heading 5',
      'HEADING6': 'Heading 6'
    };
    return labelMap[headingType];
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

  // Apply style to all matching text in document
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

  <!-- Actions - Updated with Get button and proper layout -->
  <TextActions
    isProcessing={isProcessing}
    selectedStyle={selectedStyle}
    theme={elementsTheme}
    svgUrl={getSvgUrl()}
    onStyleGuideInsert={handleStyleGuideInsert}
    onExtractStyle={extractStyle}
    onApplyStyle={applyStyle}
    onUpdateAll={updateAllStyles}
    onResetStyle={resetStyle}
    onToggleTheme={toggleTheme}
  />
</div>