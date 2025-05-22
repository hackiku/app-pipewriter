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
  let queuedElements = $state<string[]>([]);
  
  // Initialize once on component mount
  console.log("Dropper component mounted, initial theme:", elementsTheme);
  
  // Only use one status timeout to prevent multiple timers
  let statusTimeoutId: number | null = null;
  
  function clearStatusTimeout() {
    if (statusTimeoutId !== null) {
      window.clearTimeout(statusTimeoutId);
      statusTimeoutId = null;
    }
  }
  
  function setStatusWithTimeout(newStatus: StatusUpdate | null, timeoutMs = 2000) {
    // Clear any existing timeout
    clearStatusTimeout();
    
    // Set the new status
    status = newStatus;
    
    // Set a timeout to clear the status if it's not a processing status
    if (newStatus && newStatus.type !== 'processing') {
      statusTimeoutId = window.setTimeout(() => {
        status = null;
        statusTimeoutId = null;
      }, timeoutMs);
    }
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
      message: `Inserting ${elementId}...`,
      details: `Theme: ${currentTheme}\nAttempting to fetch and insert element...`
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
          executionTime: response.executionTime
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
        }
      });
    } finally {
      isProcessing = false;
    }
  }
  
  // Queue management functions
  function handleAddToQueue(elementId: string) {
    if (!queuedElements.includes(elementId)) {
      queuedElements = [...queuedElements, elementId];
      console.log(`Added ${elementId} to queue. Queue length: ${queuedElements.length}`);
      
      setStatusWithTimeout({
        type: "success",
        message: `Added to queue`,
        details: `${elementId} added to queue (${queuedElements.length} total)`
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
          details: `Inserting ${elementId} (${currentTheme})`
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
      details: chainMode ? "Click elements to add to queue" : "Click elements to insert directly"
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
  
  // Clean up on destroy
  function cleanup() {
    clearStatusTimeout();
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
    <StatusBar status={status} />
	</div>
  {/if}
  
  <!-- Debug info in dev mode -->
  <!-- {#if import.meta.env.DEV}
    <div class="opacity-70 absolute top-0 right-0 p-1 text-[0.6em] rounded-sm bg-black/15 text-neutral-900/40 z-50">
      {elementsTheme} | grid-{gridColumns} | chain: {chainMode ? 'on' : 'off'} | queue: {queuedElements.length}
    </div>
  {/if} -->
  
  <!-- Main Container - No scrollbar visible but still scrollable -->
  <div class="h-full pb-8 pt-2 overflow-y-auto scrollbar-none">
    <DropperGrid 
      isProcessing={isProcessing}
      context={context}
      theme={elementsTheme}
      gridColumns={gridColumns}
      chainMode={chainMode}
      onElementSelect={handleElementSelect}
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