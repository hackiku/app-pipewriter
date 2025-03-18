<!-- $lib/iframe/features/dropper/DropperGrid.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ElementCard from "./ElementCard.svelte";
  import { showInfo } from "../../stores";
  import { dropperStore, dropperStatus } from "../../stores/dropperStore";
  import { gridClass } from "../../stores/gridStore";
  import { elementsThemeStore } from "../../stores/elementsThemeStore";
  import { elementsManager } from "./elements/elements";

  export let isProcessing = false;
  // export let appsScript: any;

  const dispatch = createEventDispatcher();

  $: categories = elementsManager.getElementsByCategory($elementsThemeStore);

	function handleElementSelect(elementId: string) {
		if (!isProcessing && !$dropperStatus.isProcessing) {
			dispatch("elementSelect", { elementId });
		}
	}
</script>

<div class="space-y-2 pb-10 -pr-2">
  {#each Object.entries(categories) as [category, elements]}
    <section>
      {#if $showInfo}
        <h3 class="text-xs font-normal text-gray-400 mb-2 ml-2 capitalize">
          {category.replace("-", " ")}
        </h3>
      {/if}
      
      <div class="grid {$gridClass.grid} {$gridClass.gap} {$gridClass.padding}">
        {#each elements as element (element.id)}
          <ElementCard
            {element}
            onSelect={() => handleElementSelect(element.id)}
            theme={$elementsThemeStore}
            disabled={isProcessing || $dropperStatus.isProcessing}
            isSelected={$dropperStore.selectedElements.includes(element.id)}
          />
        {/each}
      </div>
    </section>
  {/each}
</div>