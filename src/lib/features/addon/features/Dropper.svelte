<!-- src/lib/features/addon/features/Dropper.svelte -->
<script lang="ts">
  import { fade, slide, fly } from "svelte/transition";
  import type { ElementTheme, StatusUpdate } from '$lib/types/elements';
  import { insertElement } from "$lib/services/google/docs";
  
  import StatusSonner from "../components/StatusSonner.svelte";
  import DropperGrid from "./dropper/DropperGrid.svelte";
  import DropperBar from "./dropper/DropperBar.svelte";
  
  // Props - server data instead of contexts
  const { 
    context, 
    elements, 
    userTier, 
    features, 
    showInfo 
  } = $props();
  
  // Local state variables
  let isProcessing = $state(false);
  let status = $state<StatusUpdate | null>(null);
  let elementsTheme = $state<ElementTheme>('light');
  let gridColumns = $state(3);
  
  // Chain mode state
  let chainMode = $state(false);
  let queuedElements = $state<string[]>([]);
  
  console.log("Dropper mounted with elements:", Object.keys(elements).length, "categories");
  
  // Status management
  function handleStatusClose() {
    status = null;
  }
  
  function setStatusWithTimeout(newStatus: StatusUpdate | null, timeoutMs = 500) {
    if (newStatus && newStatus.details) {
      const elementIdMatch = newStatus.details.match(/(\w+-\w+(?:-\w+)*)/);
      if (elementIdMatch) {
        (newStatus as any).elementId = elementIdMatch[1];
      }
    }
    status = newStatus;
  }

  // Element selection handler
  async function handleElementSelect(event: CustomEvent<{ elementId: string }>) {
    const { elementId } = event.detail;
    
    if (chainMode) {
      handleAddToQueue(elementId);
      return;
    }
    
    // Normal mode - insert directly
    const currentTheme = elementsTheme;
    
    isProcessing = true;
    setStatusWithTimeout({
      type: "processing",
      message: `Inserting element...`,
      details: `Inserting ${elementId} (${currentTheme})`,
      elementId
    });

    try {
      const response = await insertElement(
        elementId, 
        currentTheme,
        (update) => setStatusWithTimeout(update)
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
  
  // Chain mode functions
  function handleChainToggle(elementId: string) {
    const currentIndex = queuedElements.indexOf(elementId);
    
    if (currentIndex >= 0) {
      queuedElements = queuedElements.filter(id => id !== elementId);
    } else {
      queuedElements = [...queuedElements, elementId];
    }
    
    // No status messages - keep chain operations silent
  }
  
  function getChainPosition(elementId: string): number {
    const index = queuedElements.indexOf(elementId);
    return index >= 0 ? index + 1 : 0;
  }
  
  // Queue management
  function handleAddToQueue(elementId: string) {
    if (!queuedElements.includes(elementId)) {
      queuedElements = [...queuedElements, elementId];
      // No status message - just add silently
    }
  }
  
  function handleRemoveFromQueue(elementId: string) {
    queuedElements = queuedElements.filter(id => id !== elementId);
    // No status message - keep it minimal
  }
  
  function handleReorderQueue(newOrder: string[]) {
    queuedElements = newOrder;
    // No status message - silent reordering
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
        
        if (i < queuedElements.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setStatusWithTimeout({
        type: "success",
        message: "Queue applied successfully",
        details: `Successfully inserted ${queuedElements.length} elements`,
        executionTime: Date.now()
      });
      
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
    chainMode = false; // Also exit chain mode
    
    // No status message - just silently clear
  }
  
  function toggleChainMode() {
    chainMode = !chainMode;
    
    if (!chainMode && queuedElements.length > 0) {
      queuedElements = [];
    }
    
    // No status messages - keep it clean
  }
  
  function toggleTheme() {
    elementsTheme = elementsTheme === 'light' ? 'dark' : 'light';
  }
  
  function updateGridColumns(cols: number) {
    gridColumns = cols;
  }

  // Export for parent component - including theme
  export const getChainModeState = () => ({
    chainMode,
    queuedElements,
    queueCount: queuedElements.length
  });

  export const getTheme = () => elementsTheme;
  
  // Export queue management methods for parent using different names
  export const removeFromQueue = handleRemoveFromQueue;
  export const applyQueue = handleApplyQueue;  
  export const discardQueue = handleDiscardQueue;
  export const reorderQueue = handleReorderQueue;
</script>

<div class="relative h-full z-0 bg-neutral-100/50 dark:bg-neutral-800/50">
  <!-- Main Container -->
  <div class="h-full pb-8 pt-2 overflow-y-auto scrollbar-none">
    <DropperGrid 
      isProcessing={isProcessing}
      context={context}
      elements={elements}
      userTier={userTier}
      features={features}
      theme={elementsTheme}
      gridColumns={gridColumns}
      chainMode={chainMode}
      showInfo={showInfo}
      getChainPosition={getChainPosition}
      onElementSelect={handleElementSelect}
      onChainToggle={handleChainToggle}
    />
  </div>

  <!-- Bottom Control Bar -->
  <div class="w-full transition-all duration-200">
    <DropperBar 
      isProcessing={isProcessing}
      theme={elementsTheme}
      selectedElements={[]}
      chainMode={chainMode}
      queuedElements={queuedElements}
      onToggleTheme={toggleTheme}
      onGridChange={updateGridColumns}
      onToggleChainMode={toggleChainMode}
      onApplyQueue={handleApplyQueue}
      onDiscardQueue={handleDiscardQueue}
    />
  </div>
  
  <!-- Status Sonner - Fixed positioned, will appear in bottom-right -->
  <StatusSonner {status} onStatusClose={handleStatusClose} />
</div>

<style>
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>