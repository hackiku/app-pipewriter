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
  
  // Local state variables - using plain variables where possible to reduce reactivity
  let isProcessing = $state(false);
  let status = $state<StatusUpdate | null>(null);
  let elementsTheme = $state<ElementTheme>('light');
  let gridColumns = $state(3); // Default to 3 columns
  let selectedElements: string[] = []; // No need for reactivity here
  
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

  // Element selection handler - avoid using reactive values inside
  async function handleElementSelect(event: CustomEvent<{ elementId: string }>) {
    const { elementId } = event.detail;
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
</script>

<div class="relative h-full z-0 bg-neutral-100/50 dark:bg-neutral-800/50">
  <!-- Status Bar -->
  {#if status}
    <StatusBar status={status} />
  {/if}
  
  <!-- Debug info in dev mode -->
  {#if import.meta.env.DEV}
    <div class="absolute top-0 right-0 p-1 text-xs bg-black/50 text-white z-50">
      Theme: {elementsTheme} | Grid: {gridColumns}
    </div>
  {/if}
  
  <!-- Test SVG for verifying SVG loading works -->
  <img src="/elements/blurbs-4.svg" alt="Test SVG" class="w-1 h-1 opacity-5 absolute top-0 left-0" />
  
  <!-- Main Container - No scrollbar visible but still scrollable -->
  <div class="h-full pb-8 pt-2 overflow-y-auto scrollbar-none">
    <DropperGrid 
      isProcessing={isProcessing}
      context={context}
      theme={elementsTheme}
      gridColumns={gridColumns}
      onElementSelect={handleElementSelect}
    />
  </div>

  <!-- Bottom Control Bar -->
  <div class="w-full transition-all duration-200">
    <DropperBar 
      isProcessing={isProcessing}
      theme={elementsTheme}
      selectedElements={selectedElements}
      onToggleTheme={toggleTheme}
      onGridChange={updateGridColumns}
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