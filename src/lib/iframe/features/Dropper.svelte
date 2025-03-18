<!-- $lib/iframe/features/Dropper.svelte -->
<script lang="ts">
  import { fade, slide, fly } from "svelte/transition";
  import { createEventDispatcher, onDestroy, getContext } from "svelte";
  import type { AppsScriptClient } from "../utils/appsScript";
  import type { StatusUpdate } from "../types/status";
  
  import DropperGrid from "./dropper/DropperGrid.svelte";
  import DropperBar from "./dropper/DropperBar.svelte";
  import ChainDropper from "./dropper/ChainDropper.svelte";
  import StatusBar from "../components/StatusBar.svelte";
 
  import { zenMode } from "../stores";
  import { dropperStore, dropperStatus, chainMode } from "../stores/dropperStore";
  import { elementsThemeStore } from "../stores/elementsThemeStore";

  // Get AppsScript client from context
  const appsScript = getContext<AppsScriptClient>('appsScript');
  
  const dispatch = createEventDispatcher();
  let isProcessing = false;
  let status: StatusUpdate | null = null;
  let statusTimeout: number;

  // Watch status changes
  $: if (status && status.type !== "processing") {
    if (statusTimeout) clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
      status = null;
    }, 2000);
  }

	// if (status && status.type !== "processing") {
	// 	if (statusTimeout) clearTimeout(statusTimeout);
	// 	// Use execution time + small buffer, or default client timeout
	// 	const duration = status.executionTime 
	// 		? status.executionTime + 500 
	// 		: appsScript.getTimeout();
	// 	statusTimeout = setTimeout(() => {
	// 		status = null;
	// 	}, duration);
	// }

  onDestroy(() => {
    if (statusTimeout) clearTimeout(statusTimeout);
  });

  async function handleElementSelect(event: CustomEvent<{elementId: string}>) {
    const { elementId } = event.detail;

    if ($chainMode) {
      dropperStore.addElement(elementId);
      return;
    }

    isProcessing = true;
    dropperStore.setProcessing(true);
    status = {
      type: 'processing',
      message: `Inserting ${elementId}...`,
      details: `Theme: ${$elementsThemeStore}\nAttempting to fetch and insert element...`
    };

    try {
      console.log(`Attempting to insert element: ${elementId} (${$elementsThemeStore})`);
      const response = await appsScript.sendMessage('getElement', {
        elementId, 
        theme: $elementsThemeStore
      });

      if (response.success) {
        status = {
          type: "success",
          message: "Element inserted",
          details: `Successfully inserted ${elementId} (${$elementsThemeStore})`,
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
        details: `Failed to insert ${elementId} (${$elementsThemeStore})`,
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          elementId,
          theme: $elementsThemeStore,
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
    <StatusBar {status} />
  {/if}
  
  <ChainDropper />
  
  <div class="custom-scrollbar overflow-y-scroll h-full pb-8 pt-2">
    <DropperGrid
  		{isProcessing}
  		on:elementSelect={handleElementSelect}
/>


  </div>

  <div
    class={`w-full transition-all duration-200 ${
      $zenMode ? "fixed bottom-0 left-1/2 -translate-x-1/2" : ""
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