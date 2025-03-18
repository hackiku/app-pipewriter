<!-- $lib/iframe/features/Dropper.svelte -->
<script lang="ts">
  import { fade, slide, fly } from "svelte/transition";
  import type { StatusUpdate } from "$lib/data/addon/status";
  import { insertElement } from "$lib/services/google/docs";
  import { elementManager } from "$lib/data/addon/elements";
  import type { ElementTheme } from '$lib/data/addon/elements';
  
  import StatusBar from "../components/StatusBar.svelte";
  import DropperGrid from "./dropper/DropperGrid.svelte";
  import DropperBar from "./dropper/DropperBar.svelte";
  
  // Props
  const { context } = $props();
  
  // Local state variables using Runes
  let isProcessing = $state(false);
  let status = $state<StatusUpdate | null>(null);
  let statusTimeout = $state<number | null>(null);

  // Initialize with light theme
  let elementsTheme = $state<ElementTheme>('light');
  let selectedElements = $state<string[]>([]);
  
  // Debug on component mount
  $effect(() => {
    console.log("Dropper component mounted");
    console.log("Initial theme:", elementsTheme);
    console.log("Elements available:", elementManager.debug());
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
    console.log(`Element selection handler received: ${elementId} with theme ${elementsTheme}`);

    isProcessing = true;
    status = {
      type: "processing",
      message: `Inserting ${elementId}...`,
      details: `Theme: ${elementsTheme}\nAttempting to fetch and insert element...`
    };

    try {
      console.log(`Attempting to insert element: ${elementId} (${elementsTheme})`);
      
      const response = await insertElement(
        elementId, 
        elementsTheme,
        (update) => {
          status = update;
        }
      );

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
  
  // Toggle theme function
  function toggleTheme() {
    console.log(`Toggling theme from ${elementsTheme} to ${elementsTheme === 'light' ? 'dark' : 'light'}`);
    elementsTheme = elementsTheme === 'light' ? 'dark' : 'light';
  }
</script>

<div class="relative h-full z-0 bg-neutral-100/50 dark:bg-neutral-800/50">
  <!-- Status Bar -->
  {#if status}
    <StatusBar status={status} />
  {/if}
  
  <!-- Debug info -->
  {#if import.meta.env.DEV}
    <div class="absolute top-0 right-0 p-1 text-xs bg-black/50 text-white z-50">
      Theme: {elementsTheme}
    </div>
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
      onToggleTheme={toggleTheme}
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