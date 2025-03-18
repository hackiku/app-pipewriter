<!-- $lib/iframe/features/dropper/DropperGrid.svelte -->
<script lang="ts">
  import ElementCard from "./ElementCard.svelte";
  import { getElementsByCategory, elementManager } from '$lib/data/addon/elements';
  import type { ElementTheme } from '$lib/data/addon/elements';
  
  // Props
  const props = $props<{
    isProcessing: boolean;
    context: any;
    theme: ElementTheme;
    onElementSelect: (event: CustomEvent<{ elementId: string }>) => void;
  }>();
  
  // Local state
  let showInfo = $state(true);
  let gridColumns = $state(3);
  
  // Computed grid classes
  let gridClass = $derived({
    grid: `grid-cols-${gridColumns}`,
    gap: gridColumns === 1 ? 'gap-5' : 'gap-2',
    padding: gridColumns === 1 ? 'px-8' : 'px-2'
  });
  
  // Get elements by category directly from elementManager - not using the store
  let categories = $derived(() => {
    console.log(`Getting categories for theme: ${props.theme}`);
    
    // Debug the available elements
    const allElements = elementManager.getElementsByTheme(props.theme);
    console.log(`Found ${allElements.length} elements for theme ${props.theme}`);
    
    // Get the categorized elements
    const result = elementManager.getElementsByCategory(props.theme);
    console.log(`Categorized into ${Object.keys(result).length} categories for theme: ${props.theme}`);
    
    return result;
  });

  // Handle element selection
  function handleElementSelect(elementId: string) {
    if (!props.isProcessing) {
      console.log(`Selected element: ${elementId}`);
      props.onElementSelect(new CustomEvent('elementSelect', { 
        detail: { elementId } 
      }));
    }
  }
</script>

<div class="space-y-2 pb-10 -pr-2">
  {#if Object.keys(categories).length === 0}
    <div class="p-4 text-center">
      <p class="text-neutral-500 dark:text-neutral-400">No elements found for theme: {props.theme}</p>
      <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Check console for debugging info</p>
    </div>
  {:else}
    {#each Object.entries(categories) as [category, categoryElements]}
      <section>
        {#if showInfo}
          <h3 class="text-xs font-normal text-neutral-400 mb-2 ml-2 capitalize">
            {category.replace("-", " ")} ({categoryElements.length})
          </h3>
        {/if}
        
        <div class="grid {gridClass.grid} {gridClass.gap} {gridClass.padding}">
          {#each categoryElements as element (element.id)}
            <ElementCard
              element={element}
              onSelect={() => handleElementSelect(element.id)}
              theme={props.theme}
              disabled={props.isProcessing}
              isSelected={false}
            />
          {/each}
        </div>
      </section>
    {/each}
  {/if}
</div>