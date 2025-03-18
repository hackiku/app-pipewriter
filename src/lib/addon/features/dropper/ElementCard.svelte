<!-- $lib/iframe/features/dropper/ElementCard.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import type { ElementObject } from "./elements/elements";
  import type { ElementsTheme } from "./elements/elements";
  import { onMount, createEventDispatcher } from 'svelte';
  import { X, Plus } from 'lucide-svelte';

  export let element: ElementObject;
  export let onSelect: (id: string) => void;
  export let theme: ElementsTheme;
  export let disabled = false;
  export let isSelected = false;

  const dispatch = createEventDispatcher();
  let mounted = false;
  let isProcessing = false;
  let isDarkMode = false;

  onMount(() => {
    mounted = true;
    // Initial dark mode check
    isDarkMode = document.documentElement.classList.contains('dark');
    
    // Watch for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          isDarkMode = document.documentElement.classList.contains('dark');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  });

  async function handleClick() {
    if (disabled || isProcessing) return;
    isProcessing = true;
    dispatch('processingStart');
    
    try {
      await onSelect(element.id);
    } finally {
      isProcessing = false;
      dispatch('processingEnd');
    }
  }

  // Card background styles based on current theme
  const cardStyles = {
    light: "bg-white dark:bg-black border border-gray-300 dark:border-gray-700/80 hover:bg-slate-400/30 dark:hover:bg-slate-900/80",
    dark: "bg-slate-950 dark:bg-white hover:bg-slate-900/80 dark:hover:bg-slate-400/30 border border-gray-300",
  };

  const baseButtonClasses = cn(
    "group relative w-full h-full p-0 rounded-lg overflow-hidden",
    "transition-all duration-200 ease-out cursor-pointer",
    "hover:-translate-y-1 hover:-translate-x-1 hover:rotate-[-2deg]",
    "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]",
    "dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]",
    "active:translate-y-0 active:translate-x-0 active:shadow-none"
  );

  $: buttonClass = cn(
    baseButtonClasses,
    cardBackground,
    isSelected && "ring-2 ring-primary ring-offset-2",
    (disabled || isProcessing) && "opacity-90 cursor-not-allowed pointer-events-none",
  );

  $: cardBackground = mounted ? cn(cardStyles[theme]) : cardStyles[theme];
  
  // Dynamic SVG source based on theme and dark mode
  $: imgSrc = mounted ? getSvgUrl(element, theme, isDarkMode) : element.src;

  function getSvgUrl(element: ElementObject, theme: ElementsTheme, isDarkMode: boolean): string {
    // In dark mode, we invert the theme logic
    const shouldUseDarkVariant = isDarkMode ? theme === 'light' : theme === 'dark';
    const svgId = shouldUseDarkVariant ? `${element.baseId}-dark` : element.baseId;
    return `elements/${svgId}.svg`;
  }
</script>

<div class="relative">
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <Button
        variant="ghost"
        class={buttonClass}
        on:click={handleClick}
        {disabled}
      >
        <div class="relative w-full h-full">
          <img
            src={imgSrc}
            alt={element.alt}
            class="w-full h-full object-cover group-hover:opacity-40"
          />
          
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- <div class="w-2 h-8 bg-black/80 dark:bg-white/80 animate-cursor" /> -->
            <Plus class="text-gray-500 dark:text-sblack asnimate-spin" size={30} />
          </div>

          {#if isProcessing}
            <div class="absolute inset-0 flex items-center justify-center bg-black/50 dark:bg-white/50">
              <X class="text-white dark:text-black animate-spin" size={24} />
            </div>
          {/if}
        </div>
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>{element.description}</p>
    </Tooltip.Content>
  </Tooltip.Root>
</div>