<!-- $lib/iframe/features/dropper/DropperGrid.svelte -->
<script lang="ts">
  import ElementCard from "./ElementCard.svelte";
  import { elementManager, getElementsByCategory } from '$lib/data/addon/utils';
  import type { ElementTheme, ElementCategory } from '$lib/data/addon/types';
  
  // Props
  const props = $props<{
    isProcessing: boolean;
    context: any;
    theme: ElementTheme;
    gridColumns: number;
    onElementSelect: (event: CustomEvent<{ elementId: string }>) => void;
  }>();
  
  // Local state
  let showInfo = $state(true);
  let categoriesCache = $state<Record<string, any>>({});
  
  // Get grid classes based on column count
  function getGridClasses() {
    const gridCols = props.gridColumns || 3; // Default to 3 if undefined
    return {
      grid: `grid-cols-${gridCols}`,
      gap: gridCols === 1 ? 'gap-5' : 'gap-2',
      padding: gridCols === 1 ? 'px-8' : 'px-2'
    };
  }
  
  // Load categories on theme change but use manual state tracking to prevent loops
  let lastTheme = $state<ElementTheme | null>(null);
  
  $effect(() => {
    // Only update categories when theme changes
    if (lastTheme === props.theme) return;
    
    console.log(`DropperGrid: Loading categories for theme ${props.theme}, grid: ${props.gridColumns}`);
    const categories = elementManager.getElementsByCategory(props.theme);
    
    // Update state after a microtask to prevent immediate dependent updates
    setTimeout(() => {
      categoriesCache = categories;
      lastTheme = props.theme;
      console.log("Categories loaded:", Object.keys(categoriesCache).length);
    }, 0);
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

<div class="space-y-2 pb-10 px-2">
  {#if Object.keys(categoriesCache).length === 0}
    <div class="p-4 text-center">
      <p class="text-neutral-500 dark:text-neutral-400">Loading elements for theme: {props.theme}</p>
    </div>
  {:else}
    {#each Object.entries(categoriesCache) as [category, categoryElements]}
      <section>
        {#if showInfo}
          <h3 class="text-xs font-normal text-neutral-400 dark:text-neutral-500 mb-2 ml-2 capitalize">
            {category.replace("-", " ")} ({categoryElements.length})
          </h3>
        {/if}
        
        <div class="grid {getGridClasses().grid} {getGridClasses().gap} {getGridClasses().padding}">
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