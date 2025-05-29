<!-- Final src/lib/features/addon/features/dropper/DropperGrid.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import ElementCard from './ElementCard.svelte';
  import type { ElementTheme } from '$lib/types/elements';
  import { useTrialFeatures } from '$lib/context/trial.svelte';
	import { dev } from '$app/environment';
  import { createDropperElements, type DropperElementsStore } from '$lib/context/elements.svelte';

  const trialFeatures = useTrialFeatures();

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

  // Create elements store
  const elementsStore = createDropperElements(getUserTier());

  // Get user tier from trial context
  function getUserTier(): 'free' | 'trial' | 'pro' {
    if (trialFeatures.trialInfo.isPro) return 'pro';
    if (trialFeatures.trialInfo.active) return 'trial';
    return 'free';
  }

  // Update store when theme changes
  $effect(() => {
    elementsStore.setTheme(props.theme);
  });

  // Update store when user tier changes
  $effect(() => {
    const newTier = getUserTier();
    if (newTier !== elementsStore.userTier) {
      elementsStore.setUserTier(newTier);
    }
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

  // Cleanup on destroy
  $effect(() => {
    return () => {
      elementsStore.cleanup();
    };
  });
</script>

<div class="space-y-2 px-2 pb-10">
  {#if elementsStore.loading}
    <div class="p-4 text-center">
      <div class="flex flex-col items-center space-y-2">
        <div class="h-6 w-6 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
        <p class="text-neutral-500 dark:text-neutral-400 text-sm">
          Loading elements...
        </p>
      </div>
    </div>
  {:else if elementsStore.error}
    <div class="p-4 text-center">
      <div class="text-red-500 dark:text-red-400 text-sm">
        <p class="font-medium">Failed to load elements</p>
        <p class="text-xs mt-1 opacity-75">{elementsStore.error}</p>
        <button 
          class="mt-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs hover:bg-red-200 dark:hover:bg-red-900/50"
          onclick={() => elementsStore.loadElements()}
        >
          Retry
        </button>
      </div>
    </div>
  {:else if Object.keys(elementsStore.elements).length === 0}
    <div class="p-4 text-center">
      <p class="text-neutral-500 dark:text-neutral-400 text-sm">
        No elements available for theme: {props.theme}
      </p>
    </div>
  {:else}
    {#each Object.entries(elementsStore.elements) as [category, categoryElements]}
      <section>
        <!-- Category Header -->
        {#if uiState.showInfo}
          <h3
            class="mb-2 ml-2 text-xs font-normal capitalize text-neutral-400 dark:text-neutral-500"
          >
            {category.replace('-', ' ')} ({categoryElements.length})
          </h3>
        {/if}

        <!-- Elements Grid -->
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

<!-- {#if process.env.NODE_ENV === 'development'} -->
{#if dev}
  <div class="fixed bottom-2 left-2 text-[0.5em] text-gray-400 font-mono">
    Elements: {elementsStore.debugState().totalElements} | 
    Categories: {elementsStore.debugState().categoriesCount} |
    Tier: {elementsStore.userTier} |
    Theme: {elementsStore.theme}
  </div>
{/if}