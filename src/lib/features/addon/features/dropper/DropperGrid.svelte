<!-- src/lib/features/addon/features/dropper/DropperGrid.svelte -->
<script lang="ts">
  import ElementCard from './ElementCard.svelte';
  import type { ElementTheme } from '$lib/types/elements';
  import type { ElementData } from '$lib/server/data-loaders';

  // Props - server data instead of reactive stores
  const props = $props<{
    isProcessing: boolean;
    context: any;
    elements: Record<string, ElementData[]>;
    userTier: 'free' | 'trial' | 'pro';
    features: any;
    theme: ElementTheme;
    gridColumns: number;
    chainMode?: boolean;
    showInfo?: boolean;
    getChainPosition?: (elementId: string) => number;
    onElementSelect: (event: CustomEvent<{ elementId: string }>) => void;
    onChainToggle?: (elementId: string) => void;
  }>();

  // Handle element selection
  function handleElementSelect(elementId: string) {
    if (!props.isProcessing) {
      props.onElementSelect(
        new CustomEvent('elementSelect', {
          detail: { elementId }
        })
      );
    }
  }

  // Handle chain toggle
  function handleChainToggle(elementId: string) {
    if (props.onChainToggle) {
      props.onChainToggle(elementId);
    }
  }
</script>

<div class="space-y-2 px-2 pb-6">
  {#if Object.keys(props.elements).length === 0}
    <div class="p-4 text-center">
      <p class="text-neutral-500 dark:text-neutral-400 text-sm">
        No elements available for your current plan
      </p>
    </div>
  {:else}
    {#each Object.entries(props.elements) as [category, categoryElements]}
      <section>
        <!-- Category Header -->
        {#if props.showInfo}
          <h3
            class="mb-2 ml-2 text-xs font-normal capitalize text-neutral-400 dark:text-neutral-500"
          >
            {category.replace('-', ' ')} ({categoryElements.length})
          </h3>
        {/if}

        <!-- Elements Grid -->
        <div class="grid grid-cols-{props.gridColumns} gap-2">
					<!-- removed styleguide element -->
					{#each categoryElements.filter(el => el.id !== 'styleguide') as element}
            <ElementCard
              element={element}
              onSelect={() => handleElementSelect(element.id)}
              theme={props.theme}
              disabled={props.isProcessing}
              isSelected={false}
              chainMode={props.chainMode || false}
              chainPosition={props.getChainPosition ? props.getChainPosition(element.id) : 0}
              onChainToggle={handleChainToggle}
            />
          {/each}
        </div>
      </section>
    {/each}
  {/if}
</div>