<!-- $lib/iframe/features/Dropper.svelte -->
<script lang="ts">
  import { getContext } from "svelte";
  import { fade, slide, fly } from "svelte/transition";
  import type { StatusUpdate } from "$lib/data/addon/types";
  import { insertElement } from "$lib/services/google/docs";
  import { elementManager, getElementsByCategory } from '$lib/data/addon/utils';
  import type { ElementTheme } from '$lib/data/addon/types';
  
  import StatusBar from "../components/StatusBar.svelte";
  import DropperGrid from "./dropper/DropperGrid.svelte";
  import DropperBar from "./dropper/DropperBar.svelte";
  
  // Props - service context
  const { context } = $props();
  
  // Get UI state from context
  const uiState = getContext('uiState');
  
  // Local state variables - using plain variables where possible to reduce reactivity
  let isProcessing = $state(false);
  let status = $state<StatusUpdate | null>(null);
  let elementsTheme = $state<ElementTheme>('light');
  let gridColumns = $state(3); // Default to 3 columns
  let selectedElements: string[] = []; // No need for reactivity here
  
  // Chain mode state
  let chainMode = $state(false);
  let queuedElements = $state<string[]>([]); // Ordered array of element IDs
  
  // Initialize once on component mount
  console.log("Dropper component mounted, initial theme:", elementsTheme);
  
  // Status bar management
  function handleStatusClose() {
    status = null;
  }
  
  function setStatusWithTimeout(newStatus: StatusUpdate | null, timeoutMs = 500) {
    // Add elementId to status for better messaging
    if (newStatus && newStatus.details) {
      const elementIdMatch = newStatus.details.match(/(\w+-\w+(?:-\w+)*)/);
      if (elementIdMatch) {
        (newStatus as any).elementId = elementIdMatch[1];
      }
    }
    
    status = newStatus;
  }

  // Element selection handler - now handles chain mode
  async function handleElementSelect(event: CustomEvent<{ elementId: string }>) {
    const { elementId } = event.detail;
    
    if (chainMode) {
      // In chain mode, add to queue instead of inserting directly
      handleAddToQueue(elementId);
      return;
    }
    
    // Normal mode - insert directly
    const currentTheme = elementsTheme; // Capture current theme to prevent reactivity issues
    
    console.log(`Element selection handler received: ${elementId} with theme ${currentTheme}`);

    // Set processing state
    isProcessing = true;
    setStatusWithTimeout({
      type: "processing",
      message: `Inserting element...`,
      details: `Inserting ${elementId} (${currentTheme})`,
      elementId
    });

    try {
      console.log(`Attempting to insert element: ${elementId} (${currentTheme})`);
      
      const response = await insertElement(
        elementId, 
        currentTheme,
        (update) => {
          setStatusWithTimeout(update);
        }
      );

      if (response.success) {
        setStatusWithTimeout({
          type: "success",
          message: "Element inserted",
          details: `Successfully inserted ${elementId} (${currentTheme})`,
          executionTime: response.executionTime,
          elementId
        });
      } else {
        throw new Error(response.error || "Failed to insert element");
      }
    } catch (error) {
      console.error("Failed to insert element:", error);
      setStatusWithTimeout({
        type: "error",
        message: "Failed to insert element",
        details: `Failed to insert ${elementId} (${currentTheme})`,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          elementId,
          theme: currentTheme,
          timestamp: new Date().toISOString()
        },
        elementId
      });
    } finally {
      isProcessing = false;
    }
  }
  
  // Chain mode element toggle
  function handleChainToggle(elementId: string) {
    const currentIndex = queuedElements.indexOf(elementId);
    
    if (currentIndex >= 0) {
      // Remove from chain
      queuedElements = queuedElements.filter(id => id !== elementId);
      console.log(`Removed ${elementId} from chain. Chain: [${queuedElements.join(', ')}]`);
    } else {
      // Add to chain
      queuedElements = [...queuedElements, elementId];
      console.log(`Added ${elementId} to chain. Chain: [${queuedElements.join(', ')}]`);
    }
    
    setStatusWithTimeout({
      type: "success",
      message: currentIndex >= 0 ? `Removed from chain` : `Added to chain`,
      details: `Chain now has ${queuedElements.length} elements`,
      elementId
    }, 1000);
  }
  
  // Get chain position for an element (1-indexed, 0 if not in chain)
  function getChainPosition(elementId: string): number {
    const index = queuedElements.indexOf(elementId);
    return index >= 0 ? index + 1 : 0;
  }
  
  // Queue management functions
  function handleAddToQueue(elementId: string) {
    if (!queuedElements.includes(elementId)) {
      queuedElements = [...queuedElements, elementId];
      console.log(`Added ${elementId} to queue. Queue length: ${queuedElements.length}`);
      
      setStatusWithTimeout({
        type: "success",
        message: `Added to queue`,
        details: `${elementId} added to queue (${queuedElements.length} total)`,
        elementId
      }, 1000);
    }
  }
  
  function handleRemoveFromQueue(elementId: string) {
    queuedElements = queuedElements.filter(id => id !== elementId);
    console.log(`Removed ${elementId} from queue. Queue length: ${queuedElements.length}`);
  }
  
  async function handleApplyQueue() {
    if (queuedElements.length === 0) return;
    
    const currentTheme = elementsTheme;
    isProcessing = true;
    
    setStatusWithTimeout({
      type: "processing",
      message: `Inserting ${queuedElements.length} elements...`,
      details: `Processing queue in ${currentTheme} theme`
    });

    try {
      // Insert elements sequentially
      for (let i = 0; i < queuedElements.length; i++) {
        const elementId = queuedElements[i];
        
        setStatusWithTimeout({
          type: "processing",
          message: `Inserting element ${i + 1} of ${queuedElements.length}...`,
          details: `Inserting ${elementId} (${currentTheme})`,
          elementId
        });
        
        const response = await insertElement(elementId, currentTheme);
        
        if (!response.success) {
          throw new Error(`Failed to insert ${elementId}: ${response.error}`);
        }
        
        // Small delay between insertions to prevent overwhelming the API
        if (i < queuedElements.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setStatusWithTimeout({
        type: "success",
        message: "Queue applied successfully",
        details: `Successfully inserted ${queuedElements.length} elements`,
        executionTime: Date.now() // Rough timing
      });
      
      // Clear queue after successful application
      queuedElements = [];
      
    } catch (error) {
      console.error("Failed to apply queue:", error);
      setStatusWithTimeout({
        type: "error",
        message: "Failed to apply queue",
        details: `Error applying queue: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          queue: queuedElements,
          theme: currentTheme,
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      isProcessing = false;
    }
  }
  
  function handleDiscardQueue() {
    const count = queuedElements.length;
    queuedElements = [];
    
    setStatusWithTimeout({
      type: "success",
      message: "Queue discarded",
      details: `Removed ${count} elements from queue`
    }, 1000);
  }
  
  // Toggle chain mode
  function toggleChainMode() {
    chainMode = !chainMode;
    console.log(`Chain mode ${chainMode ? 'enabled' : 'disabled'}`);
    
    // Clear queue when exiting chain mode
    if (!chainMode && queuedElements.length > 0) {
      handleDiscardQueue();
    }
    
    setStatusWithTimeout({
      type: "success",
      message: chainMode ? "Chain mode enabled" : "Chain mode disabled",
      details: chainMode ? "Click elements to add to chain" : "Click elements to insert directly"
    }, 1500);
  }
  
  // Toggle theme function - keep this simple
  function toggleTheme() {
    const newTheme = elementsTheme === 'light' ? 'dark' : 'light';
    console.log(`Toggling theme from ${elementsTheme} to ${newTheme}`);
    elementsTheme = newTheme;
  }
  
  // Update grid columns - keep this simple
  function updateGridColumns(cols: number) {
    console.log(`Updating grid columns to: ${cols}`);
    gridColumns = cols;
  }

  // Export chain mode and queue state for parent component
  export const getChainModeState = () => ({
    chainMode,
    queuedElements,
    queueCount: queuedElements.length
  });
</script>

<div class="relative h-full z-0 bg-neutral-100/50 dark:bg-neutral-800/50">
  <!-- Status Bar -->
  {#if status}
    <div class="fixed top-3 w-full z-20">
      <StatusBar {status} onStatusClose={handleStatusClose} />
    </div>
  {/if}
  
  <!-- Main Container - No scrollbar visible but still scrollable -->
  <div class="h-full pb-8 pt-2 overflow-y-auto scrollbar-none">
    <DropperGrid 
      isProcessing={isProcessing}
      context={context}
      theme={elementsTheme}
      gridColumns={gridColumns}
      chainMode={chainMode}
      {getChainPosition}
      onElementSelect={handleElementSelect}
      onChainToggle={handleChainToggle}
    />
  </div>

  <!-- Bottom Control Bar -->
  <div class="w-full transition-all duration-200">
    <DropperBar 
      isProcessing={isProcessing}
      theme={elementsTheme}
      selectedElements={selectedElements}
      chainMode={chainMode}
      onToggleTheme={toggleTheme}
      onGridChange={updateGridColumns}
      onToggleChainMode={toggleChainMode}
    />
  </div>
</div>

<style>
  /* Remove scrollbar completely */
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>