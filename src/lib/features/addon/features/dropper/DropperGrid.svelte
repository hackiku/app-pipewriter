<!-- $lib/iframe/features/dropper/DropperGrid.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import ElementCard from './ElementCard.svelte';
  import { elementManager, getElementsByCategory } from '$lib/data/addon/utils';
  import type { ElementTheme, ElementCategory } from '$lib/data/addon/types';

  import { useTrialFeatures } from '$lib/context/trial.svelte';

  const trialFeatures = useTrialFeatures();

  function getUserTier() {
    if (trialFeatures.trialInfo.isPro) return 'pro';
    if (trialFeatures.trialInfo.active) return 'trial';
    return 'free';
  }

  // Props
  const props = $props<{
    isProcessing: boolean;
    context: any;
    theme: ElementTheme;
    gridColumns: number;
    chainMode?: boolean;
    getChainPosition?: (elementId: string) => number;
    onElementSelect: (event: CustomEvent<{ elementId: string }>) => void;
    onChainToggle?: (elementId: string) => void;
  }>();

  // Get UI state from context
  const uiState = getContext('uiState');

  // Local state
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
    if (lastTheme === props.theme) return;

    const userTier = getUserTier();
    console.log(`Loading categories for theme ${props.theme}, tier: ${userTier}`);
    const categories = elementManager.getElementsByCategory(props.theme, userTier);

    setTimeout(() => {
      categoriesCache = categories;
      lastTheme = props.theme;
      console.log('Categories loaded:', Object.keys(categoriesCache).length);
    }, 0);
  });

  // Handle element selection
  function handleElementSelect(elementId: string) {
    if (!props.isProcessing) {
      console.log(`Selected element: ${elementId} (chain mode: ${props.chainMode || false})`);
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

<div class="space-y-2 px-2 pb-10">
  {#if Object.keys(categoriesCache).length === 0}
    <div class="p-4 text-center">
      <p class="text-neutral-500 dark:text-neutral-400">
        Loading elements for theme: {props.theme}
      </p>
    </div>
  {:else}
    {#each Object.entries(categoriesCache) as [category, categoryElements]}
      <section>
        <!-- Use uiState.showInfo from context instead of local state -->
        {#if uiState.showInfo}
          <h3
            class="mb-2 ml-2 text-xs font-normal capitalize text-neutral-400 dark:text-neutral-500"
          >
            {category.replace('-', ' ')} ({categoryElements.length})
          </h3>
        {/if}

        <div class="grid grid-cols-3 gap-2">
          {#each categoryElements as element (element.id)}
            <ElementCard
              {element}
              onSelect={() => handleElementSelect(element.id)}
              theme={props.theme}
              disabled={props.isProcessing}
              isSelected={false}
              isLocked={element.isLocked}
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