<!-- $lib/iframe/features/dropper/DropperGrid.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ElementCard from "./ElementCard.svelte";
  
  // Props
  const { isProcessing, context } = $props();
  
  // Local state
  let showInfo = $state(false);
  let elementsThemeStore = $state('light');
  let gridClass = $state({
    grid: 'grid-cols-3',
    gap: 'gap-2',
    padding: 'px-2'
  });
  
  // Create mock element data for initial testing
  // This would normally come from a store or API
  const mockElements = $state([
    {
      id: 'container-center',
      baseId: 'container-center',
      category: 'containers',
      theme: 'light',
      src: 'elements/container-center.svg',
      alt: 'Centered container',
      description: 'Centered container for content'
    },
    {
      id: 'hero',
      baseId: 'hero',
      category: 'content',
      theme: 'light',
      src: 'elements/hero.svg',
      alt: 'Hero section',
      description: 'Hero layout with heading and subtext'
    },
    {
      id: 'button-center',
      baseId: 'button-center',
      category: 'buttons',
      theme: 'light',
      src: 'elements/button-center.svg',
      alt: 'Center button',
      description: 'Button centered on page'
    }
  ]);
  
  // Group elements by category
  let categories = $derived(() => {
    const grouped = {};
    mockElements.forEach(element => {
      if (!grouped[element.category]) {
        grouped[element.category] = [];
      }
      grouped[element.category].push(element);
    });
    return grouped;
  });
  
  const dispatch = createEventDispatcher();

  // Handle element selection
  function handleElementSelect(elementId) {
    if (!isProcessing) {
      dispatch("elementSelect", { elementId });
    }
  }
</script>

<div class="space-y-2 pb-10 -pr-2">
  {#each Object.entries(categories) as [category, elements]}
    <section>
      {#if showInfo}
        <h3 class="text-xs font-normal text-gray-400 mb-2 ml-2 capitalize">
          {category.replace("-", " ")}
        </h3>
      {/if}
      
      <div class="grid {gridClass.grid} {gridClass.gap} {gridClass.padding}">
        {#each elements as element (element.id)}
          <ElementCard
            element={element}
            onSelect={() => handleElementSelect(element.id)}
            theme={elementsThemeStore}
            disabled={isProcessing}
            isSelected={false}
          />
        {/each}
      </div>
    </section>
  {/each}
</div>