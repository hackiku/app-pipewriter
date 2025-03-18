<!-- $lib/iframe/features/Dropper.svelte -->
<script lang="ts">
  import { fade, slide, fly } from "svelte/transition";
  import { onDestroy } from "svelte";
  import type { StatusUpdate } from "../types/status";
  
  import StatusBar from "../components/StatusBar.svelte";
  import ChainDropper from "./dropper/ChainDropper.svelte";
  import DropperGrid from "./dropper/DropperGrid.svelte";
  import DropperBar from "./dropper/DropperBar.svelte";
  
  // Props
  const { context } = $props();
  
  // Local state variables
  let isProcessing = $state(false);
  let status = $state<StatusUpdate | null>(null);
  let statusTimeout = $state<number | null>(null);
  
  // State from stores - converted to runes state
  let zenMode = $state(false);
  let elementsThemeStore = $state('light');
  let chainMode = $state(false);
  
  // Mock dropperStore state
  let selectedElements = $state<string[]>([]);
  
  // Mock dropperStore for initial setup - will be replaced with proper state management
  const dropperStore = {
    addElement: (elementId: string) => {
      console.log(`Adding element to chain: ${elementId}`);
      selectedElements = [...selectedElements, elementId];
      // Will implement actual chain logic later
    },
    setProcessing: (state: boolean) => {
      isProcessing = state;
    },
    get selectedElements() {
      return selectedElements;
    }
  };

  // Status effect - clear timeout after delay
  $effect(() => {
    if (status && status.type !== "processing") {
      clearStatusTimeout();
      statusTimeout = window.setTimeout(() => {
        status = null;
      }, 2000) as unknown as number;
    }
  });

  // Cleanup on destroy
  onDestroy(() => {
    clearStatusTimeout();
  });

  // Helper function to clear timeout
  function clearStatusTimeout() {
    if (statusTimeout) {
      window.clearTimeout(statusTimeout);
      statusTimeout = null;
    }
  }

  // Element selection handler
  async function handleElementSelect(event: CustomEvent<{ elementId: string }>) {
    const { elementId } = event.detail;

    if (chainMode) {
      dropperStore.addElement(elementId);
      return;
    }

    isProcessing = true;
    dropperStore.setProcessing(true);
    status = {
      type: "processing",
      message: `Inserting ${elementId}...`,
      details: `Theme: ${elementsThemeStore}\nAttempting to fetch and insert element...`
    };

    try {
      console.log(`Attempting to insert element: ${elementId} (${elementsThemeStore})`);
      
      // Get AppsScript client from context
      const appsScript = context?.appsScript;
      
      if (!appsScript) {
        throw new Error("AppsScript client not available");
      }
      
      const response = await appsScript.sendMessage("getElement", {
        elementId,
        theme: elementsThemeStore
      });

      if (response.success) {
        status = {
          type: "success",
          message: "Element inserted",
          details: `Successfully inserted ${elementId} (${elementsThemeStore})`,
          executionTime: response.executionTime
        };
      } else {
        const errorMsg = response.error || "Failed to insert element";
        console.error(errorMsg, response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Failed to insert element:", error);
      status = {
        type: "error",
        message: "Failed to insert element",
        details: `Failed to insert ${elementId} (${elementsThemeStore})`,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          elementId,
          theme: elementsThemeStore,
          timestamp: new Date().toISOString()
        }
      };
    } finally {
      isProcessing = false;
      dropperStore.setProcessing(false);
    }
  }
</script>

<div class="relative h-full z-0 bg-gray-100 dark:bg-gray-800">
  <!-- Status Bar -->
  {#if status}
    <StatusBar status={status} />
  {/if}
  
  <!-- Chain Dropper Component (for chaining multiple elements) -->
  <ChainDropper />
  
  <!-- Main Scrollable Container -->
  <div class="custom-scrollbar overflow-y-scroll h-full pb-8 pt-2">
    <!-- Comment out DropperGrid for now to isolate issues -->
    
    <DropperGrid 
      isProcessing={isProcessing}
      context={context}
      on:elementSelect={handleElementSelect}
    />
   
    <!-- <div class="flex items-center justify-center h-full text-gray-400">
      <p>Content area (Elements will display here)</p>
    </div> -->
  </div>

  <!-- Bottom Control Bar -->
  <div
    class={`w-full transition-all duration-200 ${
      zenMode ? "fixed bottom-0 left-1/2 -translate-x-1/2" : ""
    }`}
    in:slide={{ duration: 200, axis: "y" }}
    out:fly={{ duration: 200 }}
  >
    <DropperBar />
  </div>
</div>

<style>
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    margin: 4rem 0;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 4px;
    min-height: 40px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(155, 155, 155, 0.7);
  }
</style>