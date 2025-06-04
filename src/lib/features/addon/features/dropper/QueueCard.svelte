<!-- src/lib/features/addon/features/dropper/QueueCard.svelte -->
<script lang="ts">
  import { AlertCircle } from '@lucide/svelte';
  import type { ElementData } from '$lib/server/data-loaders';
  import type { ElementTheme } from '$lib/types/elements';
  import { onMount, onDestroy } from 'svelte';

  // Props - simplified for queue use
  const props = $props<{
    element: ElementData;
    theme: ElementTheme; // Dropper theme (light/dark)
  }>();

  // Local state - minimal
  let imageError = $state(false);
  let appTheme = $state<ElementTheme>('light');
  let observer: MutationObserver | null = null;

  // Setup mutation observer to detect app theme changes (same logic as ElementCard)
  onMount(() => {
    appTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const newAppTheme = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light';
          if (appTheme !== newAppTheme) {
            appTheme = newAppTheme;
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  // SVG URL logic - same as ElementCard but simplified
  function getSvgUrl(): string {
    const baseId = props.element.id.endsWith('-dark') ? 
      props.element.id.replace(/-dark$/, '') : props.element.id;

    // Same contrast logic as ElementCard
    const shouldUseDarkVariant = props.theme !== appTheme;
    const canUseDarkVariant = props.element.metadata?.supports?.darkMode;
    const useDarkVariant = shouldUseDarkVariant && canUseDarkVariant;

    if (useDarkVariant) {
      return `/elements/${baseId}-dark.svg`;
    }
    return `/elements/${baseId}.svg`;
  }

  // Handle image loading errors
  function handleImageError() {
    console.error(`Failed to load image: ${getSvgUrl()}`);
    imageError = true;
  }

  // Card styling based on element theme - simplified, no hover effects
  const cardStyles = {
    light: 'bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700/80',
    dark: 'bg-neutral-950 dark:bg-white border border-neutral-300'
  };
</script>

<!-- Simple card container - no button wrapper, no hover effects -->
<div class="relative w-full aspect-[4/2] overflow-hidden rounded-lg {cardStyles[props.theme]}">
  {#if imageError}
    <div class="flex h-full flex-col items-center justify-center p-2 text-center">
      <AlertCircle class="mb-1 h-6 w-6 text-neutral-400" />
      <span class="text-xs text-neutral-500">{props.element.id}</span>
    </div>
  {:else}
    <!-- Element Image - clean, no opacity transitions -->
    <img
      src={getSvgUrl()}
      alt={props.element.description}
      class="w-full h-full object-contain"
      onerror={handleImageError}
      loading="lazy"
    />
  {/if}
</div>