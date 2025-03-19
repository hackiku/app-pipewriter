<!-- $lib/iframe/features/text/TextTab.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Check, Loader2, Pipette, RefreshCw, Heading, Moon, Sun } from "lucide-svelte";
  import TextButtons from "./TextButtons.svelte";
  import TextStyleDropdown from "./TextStyleDropdown.svelte";
  import { insertElement } from "$lib/services/google/docs";
  import type { ElementTheme } from '$lib/data/addon/types';
  
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
  // let elementsTheme = $state<ElementTheme>('light');
  
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

  // State for theme
  let elementsTheme = $state<ElementTheme>('light');

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
      // Import the text service
      const { applyTextStyle } = await import('$lib/services/google/text');
      
      const response = await applyTextStyle(
        {
          headingType: selectedStyle.headingType,
          fontSize: selectedStyle.fontSize
        },
        (status) => {
          props.onStatusUpdate(status);
        }
      );
      
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
  <TextStyleDropdown
    selectedStyle={selectedStyle}
    disabled={isProcessing}
    onSelect={selectStyle}
  />

  <!-- Action Buttons -->
  <TextButtons
    isProcessing={isProcessing}
    selectedStyle={selectedStyle}
    theme={elementsTheme}
    onStyleGuideInsert={handleStyleGuideInsert}
    onApplyStyle={applySelectedStyle}
    onResetStyle={resetStyle}
    onToggleTheme={toggleTheme}
  />
</div>