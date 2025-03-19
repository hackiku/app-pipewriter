<!-- $lib/iframe/features/text/TextTab.svelte -->
<script lang="ts">
  import TextDropdown from "./TextDropdown.svelte";
  import TextActions from "./TextActions.svelte";
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
  let selectedStyle = $state<{
    headingType: string;
    tag: string;
    label: string;
    fontSize?: number;
  } | null>(null);
  let elementsTheme = $state<ElementTheme>('light');

  // Toggle theme function
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

  // Extract style from current selection (simulated for now)
  function extractStyle() {
    if (isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    props.onStatusUpdate({
      type: 'processing',
      message: 'Extracting text style...'
    });
    
    // Simulate a delay
    setTimeout(() => {
      // Randomly pick a style for simulation
      const randomIndex = Math.floor(Math.random() * 7);
      const styles = [
        { headingType: 'NORMAL', tag: 'p', label: 'Normal text', fontSize: 11 },
        { headingType: 'HEADING1', tag: 'h1', label: 'Heading 1', fontSize: 24 },
        { headingType: 'HEADING2', tag: 'h2', label: 'Heading 2', fontSize: 20 },
        { headingType: 'HEADING3', tag: 'h3', label: 'Heading 3', fontSize: 16 },
        { headingType: 'HEADING4', tag: 'h4', label: 'Heading 4', fontSize: 14 },
        { headingType: 'HEADING5', tag: 'h5', label: 'Heading 5', fontSize: 12 },
        { headingType: 'HEADING6', tag: 'h6', label: 'Heading 6', fontSize: 11 }
      ];
      selectedStyle = styles[randomIndex];
      
      props.onStatusUpdate({
        type: 'success',
        message: `Extracted ${selectedStyle.label} style`,
        executionTime: 350
      });
      
      isProcessing = false;
      props.onProcessingEnd();
    }, 350);
  }

  // Apply style to current selection
  async function applyStyle() {
    if (!selectedStyle || isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    props.onStatusUpdate({
      type: 'processing',
      message: `Applying ${selectedStyle.label} style...`
    });

    try {
      // Simulate an API call
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

  // Reset style selection
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
  <TextDropdown
    selectedStyle={selectedStyle}
    disabled={isProcessing}
    onSelect={selectStyle}
  />

  <!-- Actions with Resizable Layout -->
  <TextActions
    isProcessing={isProcessing}
    selectedStyle={selectedStyle}
    theme={elementsTheme}
    onStyleGuideInsert={handleStyleGuideInsert}
    onExtractStyle={extractStyle}
    onApplyStyle={applyStyle}
    onResetStyle={resetStyle}
    onToggleTheme={toggleTheme}
  />
</div>