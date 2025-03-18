<!-- $lib/iframe/layout/Dropper.svelte -->
<script lang="ts">
  import { fade, slide, fly } from "svelte/transition";
  import { getElement } from "../elements";
  import type { ElementObject } from "../elements";
  import { createEventDispatcher } from "svelte";
  
	import ElementCard from "../components/ElementCard.svelte";
  import DropperBar from "../features/dropper/DropperBar.svelte";
  import ChainDropper from "./dropper/ChainDropper.svelte";

	import DropperGrid from "./dropper/DropperGrid.svelte"
 
	import { showInfo, zenMode } from "../stores";
  import { elementsThemeStore } from "../stores/elementsThemeStore";
  import { gridClass } from "../stores/gridStore";

  export let elements: Record<string, ElementObject>;
  export let callGAS: (action: string, params: Record<string, any>) => void;

  const dispatch = createEventDispatcher();
  let isProcessing = false;

  $: filteredElements = Object.values(elements).filter((element) => {
    const isDarkVariant = element.id.includes("-dark");
    return $elementsThemeStore === "dark" ? isDarkVariant : !isDarkVariant;
  });

  $: groupedByCategory = filteredElements.reduce((acc, el) => {
    const category = el.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(el);
    return acc;
  }, {} as Record<string, ElementObject[]>);

  async function selectElement(elementId: string) {
    const element = getElement(elementId);
    if (element) {
      try {
        const result = await callGAS("getElement", { elementId });
        dispatch("elementSelected", { elementId, result });
      } catch (error) {
        console.error(`Failed to fetch element: ${elementId}`, error);
        dispatch("elementError", { elementId, error: error.message });
      }
    }
  }

  function handleProcessingStart() {
    isProcessing = true;
  }

  function handleProcessingEnd() {
    isProcessing = false;
  }
</script>

<div class="relative h-full z-0 bg-gray-100 dark:bg-gray-900">
  
	<!-- <DropperGrid /> -->
  <!-- <div class="custom-scrollbar overflow-y-scroll h-full pb-8 pt-2 {$gridClass.padding}">
		<DropperGrid />
		<p class="text-xs opacity-40">
			OLD DROPPER
		</p>
	</div> -->


	<ChainDropper />
  
<!-- 	
  <div class="custom-scrollbar overflow-y-scroll h-full pb-8 pt-2 {$gridClass.padding}">
    {#if Object.entries(groupedByCategory).length > 0}
      {#each Object.entries(groupedByCategory) as [category, categoryElements]}
        <div class="category-section mb-2">
          {#if $showInfo}
            <h3 class="text-xs font-normal text-gray-400 mb-1">
              {category.replace("-", " ")}
            </h3>
          {/if}
          <div class="grid {$gridClass.grid} {$gridClass.gap}">
            {#each categoryElements as element (element.id)}
              <ElementCard
                {element}
                onSelect={selectElement}
                theme={$elementsThemeStore}
                on:processingStart={handleProcessingStart}
                on:processingEnd={handleProcessingEnd}
              />
            {/each}
          </div>
        </div>
      {/each}
    {:else}
      <p>No elements available.</p>
    {/if}
  </div> -->
 	
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
    -webkit-overflow-scrolling: touch;
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

  .custom-scrollbar::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 0 rgba(0, 0, 0, 0.1);
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(155, 155, 155, 0.7);
  }
</style>