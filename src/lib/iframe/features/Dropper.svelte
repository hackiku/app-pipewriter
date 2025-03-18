<!-- $lib/iframe/features/Dropper.svelte -->
<script lang="ts">
  import { fade, slide, fly } from "svelte/transition";
  import type { StatusUpdate } from "../types/status";
  
  import StatusBar from "../components/StatusBar.svelte";
  import DropperGrid from "./dropper/DropperGrid.svelte";
  import DropperBar from "./dropper/DropperBar.svelte";
  
  // Props
  const { context } = $props();
  
  // Local state variables using Runes
  let isProcessing = $state(false);
  let status = $state<StatusUpdate | null>(null);
  let statusTimeout = $state<number | null>(null);
  
  // Theme state - will be shared with child components
  let elementsTheme = $state('light');
  let chainMode = $state(false);
  let selectedElements = $state<string[]>([]);
  
  // Dropper API functions to pass to children
  const dropperAPI = $derived({
    addElement: (elementId: string) => {
      selectedElements = [...selectedElements, elementId];
    },
    setProcessing: (state: boolean) => {
      isProcessing = state;
    },
    clearElements: () => {
      selectedElements = [];
    },
    toggleChainMode: () => {
      chainMode = !chainMode;
      if (!chainMode) selectedElements = [];
    },
    toggleTheme: () => {
      elementsTheme = elementsTheme === 'light' ? 'dark' : 'light';
    }
  });

  // Clear status timeout on component destroy
  $effect(() => {
    // Cleanup effect
    return () => {
      if (statusTimeout) {
        clearTimeout(statusTimeout);
      }
    };
  });

  // Status effect - clear timeout after delay
  $effect(() => {
    if (status && status.type !== "processing") {
      if (statusTimeout) {
        clearTimeout(statusTimeout);
      }
      statusTimeout = window.setTimeout(() => {
        status = null;
      }, 2000) as unknown as number;
    }
  });

  // Element selection handler
  async function handleElementSelect(event: CustomEvent<{ elementId: string }>) {
    const { elementId } = event.detail;

    if (chainMode) {
      dropperAPI.addElement(elementId);
      return;
    }

    isProcessing = true;
    status = {
      type: "processing",
      message: `Inserting ${elementId}...`,
      details: `Theme: ${elementsTheme}\nAttempting to fetch and insert element...`
    };

    try {
      console.log(`Attempting to insert element: ${elementId} (${elementsTheme})`);
      
      // Get AppsScript client from context
      const appsScript = context?.appsScript;
      
      if (!appsScript) {
        throw new Error("AppsScript client not available");
      }
      
      const response = await appsScript.sendMessage("getElement", {
        elementId,
        theme: elementsTheme
      });

      if (response.success) {
        status = {
          type: "success",
          message: "Element inserted",
          details: `Successfully inserted ${elementId} (${elementsTheme})`,
          executionTime: response.executionTime
        };
      } else {
        throw new Error(response.error || "Failed to insert element");
      }
    } catch (error) {
      console.error("Failed to insert element:", error);
      status = {
        type: "error",
        message: "Failed to insert element",
        details: `Failed to insert ${elementId} (${elementsTheme})`,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          elementId,
          theme: elementsTheme,
          timestamp: new Date().toISOString()
        }
      };
    } finally {
      isProcessing = false;
    }
  }
</script>

<div class="relative h-full z-0 bg-neutral-100/30 dark:bg-neutral-900">
  <!-- Status Bar -->
  {#if status}
    <StatusBar status={status} />
  {/if}
  
  <!-- Main Scrollable Container -->
  <div class="custom-scrollbar overflow-y-scroll h-full pb-8 pt-2">
    <DropperGrid 
      isProcessing={isProcessing}
      context={context}
      theme={elementsTheme}
      onElementSelect={handleElementSelect}
    />
  </div>

  <!-- Bottom Control Bar -->
  <div 
    class="w-full transition-all duration-200"
    in:slide={{ duration: 200, axis: "y" }}
    out:fly={{ duration: 200 }}
  >
    <DropperBar 
      isProcessing={isProcessing}
      theme={elementsTheme}
      selectedElements={selectedElements}
      onToggleChainMode={dropperAPI.toggleChainMode}
      onToggleTheme={dropperAPI.toggleTheme}
    />
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