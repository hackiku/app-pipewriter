<!-- $lib/iframe/features/dropper/DropperGrid.svelte -->
<script lang="ts">
  import ElementCard from "./ElementCard.svelte";
  import { elementManager, getElementsByCategory, getElementsByTheme } from '$lib/data/addon/elements';
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
  
  // Get elements by category from the elementManager
  let categories = $derived(() => {
    // Debug the theme value to make sure it's correct
    console.log(`Current theme is: "${props.theme}"`);
    
    // Get all elements first to check if there are any
    const allElements = getElementsByTheme(props.theme);
    console.log(`All elements for theme ${props.theme}:`, allElements.length);
    
    // Get elements by category
    const result = getElementsByCategory(props.theme);
    console.log(`Got ${Object.keys(result).length} categories for theme: ${props.theme}`);
    
    // Debug element manager if no categories found
    if (Object.keys(result).length === 0) {
      console.log('Debug ElementManager:', elementManager.debug());
    }
    
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