<!-- $lib/iframe/features/dropper/DropperGrid.svelte -->
<script lang="ts">
  import ElementCard from "./ElementCard.svelte";
  
  // Props
  const props = $props<{
    isProcessing: boolean;
    context: any;
    theme: string;
    onElementSelect: (event: CustomEvent<{ elementId: string }>) => void;
  }>();
  
  // Local state
  let showInfo = $state(false);
  let gridColumns = $state(3);
  
  // Computed grid classes
  let gridClass = $derived({
    grid: `grid-cols-${gridColumns}`,
    gap: gridColumns === 1 ? 'gap-5' : 'gap-2',
    padding: gridColumns === 1 ? 'px-8' : 'px-2'
  });
  
  // Create mock element data for initial testing
  // This would normally come from a store or API
  const elements = $state([
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
    elements.forEach(element => {
      if (!grouped[element.category]) {
        grouped[element.category] = [];
      }
      grouped[element.category].push(element);
    });
    return grouped;
  });

  // Handle element selection
  function handleElementSelect(elementId) {
    if (!props.isProcessing) {
      props.onElementSelect(new CustomEvent('elementSelect', { 
        detail: { elementId } 
      }));
    }
  }
</script>

<div class="space-y-2 pb-10 -pr-2">
  {#each Object.entries(categories) as [category, categoryElements]}
    <section>
      {#if showInfo}
        <h3 class="text-xs font-normal text-gray-400 mb-2 ml-2 capitalize">
          {category.replace("-", " ")}
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
</div>