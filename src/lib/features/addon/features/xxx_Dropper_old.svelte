<!-- src/lib/features/addon/features/Dropper.svelte - IMPROVED SPACING -->
<script lang="ts">
  import { fade, slide, fly } from "svelte/transition";
	import type { ElementTheme } from '$lib/types/elements';
	import type { StatusUpdate } from '$lib/types/appsScript';

  import { insertElement } from "$lib/services/google/docs";
  
  import CompactStatus from "../components/CompactStatus.svelte";
  import DropperGrid from "./dropper/DropperGrid.svelte";
  import DropperBar from "./dropper/DropperBar.svelte";
  import DocsLinks from "./dropper/DocsLinks.svelte";
  
  // MODERNIZED: Import access control utilities
  import { useAccessControl } from '$lib/utils/access-control';
  import type { SerializedUserAccess } from '$lib/utils/access-control';

  // New interface for queue items with individual themes
  interface QueueItem {
    id: string;
    theme: ElementTheme;
  }
  
  // MODERNIZED: Props now receive userAccess instead of legacy formats
  const { 
    context, 
    elements, 
    userAccess,
    showInfo 
  } = $props<{
    context: any;
    elements: Record<string, any[]>;
    userAccess?: SerializedUserAccess; // CHANGED: From userTier and features to userAccess
    showInfo?: boolean;
  }>();
  
  // MODERNIZED: Create access control utilities with fallback
  let access = $state();
  
  $effect(() => {
    if (!userAccess) {
      // Fallback to free tier if userAccess is not available
      access = useAccessControl({
        tier: 'free',
        isPro: false,
        trialActive: false,
        trialDaysLeft: 0,
        features: {
          elements: { canUseBasicElements: true, canUseTrialElements: false, canUseProElements: false },
          colors: { canUseBasicColors: true, canUsePremiumColorSchemes: false, canUseDocumentBackgrounds: false, canUseTableBackgrounds: false },
          prompts: { canCreateCustom: false, canEditOwn: false, maxCustomPrompts: 0 },
          ai: { canUseBasicPrompts: false, canUseAdvancedPrompts: false, canGenerateContent: false },
          export: { canExportBasic: false, canExportAdvanced: false }
        }
      });
    } else {
      access = useAccessControl(userAccess);
    }
  });
  
  // Local state variables
  let isProcessing = $state(false);
  let status = $state<StatusUpdate | null>(null);
  let elementsTheme = $state<ElementTheme>('light');
  let gridColumns = $state(3);
  
  // Chain mode state - ENHANCED with individual themes
  let chainMode = $state(false);
  let queuedElements = $state<QueueItem[]>([]);
  
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
    
    // Normal mode - insert directly with current theme
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
  
  // Chain mode functions - ENHANCED with individual themes
  function handleChainToggle(elementId: string) {
    const currentIndex = queuedElements.findIndex(item => item.id === elementId);
    
    if (currentIndex >= 0) {
      // Remove from queue
      queuedElements = queuedElements.filter(item => item.id !== elementId);
    } else {
      // Add to queue with current theme
      queuedElements = [...queuedElements, { id: elementId, theme: elementsTheme }];
    }
  }
  
  function getChainPosition(elementId: string): number {
    const index = queuedElements.findIndex(item => item.id === elementId);
    return index >= 0 ? index + 1 : 0;
  }
  
  // Queue management - ENHANCED with individual themes
  function handleAddToQueue(elementId: string) {
    const exists = queuedElements.some(item => item.id === elementId);
    if (!exists) {
      queuedElements = [...queuedElements, { id: elementId, theme: elementsTheme }];
    }
  }
  
  function handleRemoveFromQueue(elementId: string) {
    queuedElements = queuedElements.filter(item => item.id !== elementId);
  }
  
  function handleReorderQueue(newOrder: string[]) {
    // Reorder while preserving themes
    const orderedItems = newOrder.map(id => 
      queuedElements.find(item => item.id === id)
    ).filter(Boolean) as QueueItem[];
    queuedElements = orderedItems;
  }
  
  async function handleApplyQueue() {
    if (queuedElements.length === 0) return;
    
    isProcessing = true;
    
    const startTime = Date.now();
    let totalExecutionTime = 0;
    
    setStatusWithTimeout({
      type: "processing",
      message: `Inserting ${queuedElements.length} elements...`,
      details: `Processing queue with individual themes`
    });

    try {
      for (let i = 0; i < queuedElements.length; i++) {
        const item = queuedElements[i];
        
        setStatusWithTimeout({
          type: "processing",
          message: `Inserting element ${i + 1} of ${queuedElements.length}...`,
          details: `Inserting ${item.id} (${item.theme})`,
          elementId: item.id
        });
        
        const response = await insertElement(item.id, item.theme);
        
        if (response.executionTime) {
          totalExecutionTime += response.executionTime;
        }
        
        if (!response.success) {
          throw new Error(`Failed to insert ${item.id}: ${response.error}`);
        }
        
        if (i < queuedElements.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const overallTime = Date.now() - startTime;
      
      setStatusWithTimeout({
        type: "success",
        message: "Queue applied successfully",
        details: `Successfully inserted ${queuedElements.length} elements (${totalExecutionTime}ms scripts + ${overallTime - totalExecutionTime}ms overhead)`,
        executionTime: overallTime
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
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      isProcessing = false;
    }
  }
  
  function handleDiscardQueue() {
    queuedElements = [];
    chainMode = false;
  }
  
  function toggleChainMode() {
    chainMode = !chainMode;
    
    if (!chainMode && queuedElements.length > 0) {
      queuedElements = [];
    }
  }
  
  function toggleTheme() {
    elementsTheme = elementsTheme === 'light' ? 'dark' : 'light';
  }
  
  function updateGridColumns(cols: number) {
    gridColumns = cols;
  }

  // Export for parent component - ENHANCED
  export const getChainModeState = () => ({
    chainMode,
    queuedElements: queuedElements.map(item => item.id), // For backward compatibility
    queuedItems: queuedElements, // New: full items with themes
    queueCount: queuedElements.length
  });

  export const getTheme = () => elementsTheme;
  
  // Export queue management methods - ENHANCED
  export const removeFromQueue = handleRemoveFromQueue;
  export const applyQueue = handleApplyQueue;  
  export const discardQueue = handleDiscardQueue;
  export const reorderQueue = handleReorderQueue;
</script>

<div class="relative h-full z-0 bg-neutral-100/50 dark:bg-neutral-800/50">
  <!-- IMPROVED: Main Container with better spacing -->
  <div class="h-full pt-2 overflow-y-auto scrollbar-none">
    {#if access}
      <!-- Elements Grid -->
      <DropperGrid 
        isProcessing={isProcessing}
        context={context}
        elements={elements}
        userAccess={userAccess}
        theme={elementsTheme}
        gridColumns={gridColumns}
        chainMode={chainMode}
        showInfo={showInfo}
        getChainPosition={getChainPosition}
        onElementSelect={handleElementSelect}
        onChainToggle={handleChainToggle}
      />
    {:else}
      <div class="h-full flex items-center justify-center">
        <p class="text-muted-foreground text-sm">Loading access control...</p>
      </div>
    {/if}
    
    <!-- IMPROVED: Better visual separator -->
    <div class="py-3 px-2">
      <hr class="border-border" />
    </div>

    <!-- IMPROVED: Template Documents Section with proper bottom spacing -->
    <!-- {#if access} -->
      <DocsLinks 
        userAccess={userAccess}
        showInfo={showInfo}
      />
    <!-- {/if} -->

    <!-- IMPROVED: Bottom spacer that accounts for DropperBar height -->
    <div class="h-16"></div>
  </div>

  <!-- Bottom Control Bar -->
  <div class="absolute bottom-0 left-0 right-0 w-full transition-all duration-200">
    <DropperBar 
      isProcessing={isProcessing}
      theme={elementsTheme}
      selectedElements={[]}
      chainMode={chainMode}
      queuedElements={queuedElements.map(item => item.id)}
      gridColumns={gridColumns}
      onToggleTheme={toggleTheme}
      onGridChange={updateGridColumns}
      onToggleChainMode={toggleChainMode}
      onApplyQueue={handleApplyQueue}
      onDiscardQueue={handleDiscardQueue}
    />
  </div>
  
  <!-- Status display -->
  <CompactStatus status={status} onStatusClose={handleStatusClose} />
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