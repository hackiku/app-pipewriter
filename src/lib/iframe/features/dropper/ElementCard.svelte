<!-- $lib/iframe/features/dropper/ElementCard.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { Plus, X, AlertCircle } from 'lucide-svelte';
  import type { Element, ElementTheme } from '$lib/data/addon/types';

  // Props
  const props = $props<{
    element: Element;
    onSelect: (id: string) => void;
    theme: ElementTheme;
    disabled?: boolean;
    isSelected?: boolean;
  }>();

  // Local state - minimal reactivity
  let isProcessing = $state(false);
  let imageError = $state(false);
  
  // Use a DOM flag instead of state for mounted/dark mode
  // This avoids unnecessary reactivity
  let mounted = false;
  let isDarkModeEl = false;
  
  // Initialize dark mode detection once at mount time
  function initDarkModeDetection() {
    if (typeof document === 'undefined') return () => {};
    
    mounted = true;
    isDarkModeEl = document.documentElement.classList.contains('dark');
    
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          isDarkModeEl = document.documentElement.classList.contains('dark');
        }
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }
  
  // Run once at component initialization
  const cleanup = initDarkModeDetection();
  
  // Handle click on the element card
  async function handleClick() {
    if (props.disabled || isProcessing) return;
    
    isProcessing = true;
    
    try {
      // Call the select handler without capturing any reactive dependencies
      await props.onSelect(props.element.id);
    } finally {
      isProcessing = false;
    }
  }

  // Card styling based on theme
  const cardStyles = {
    light: "bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700/80 hover:bg-neutral-400/30 dark:hover:bg-neutral-900/80",
    dark: "bg-neutral-950 dark:bg-white hover:bg-neutral-900/80 dark:hover:bg-neutral-400/30 border border-neutral-300",
  };

  const baseButtonClasses = cn(
    "group relative w-full h-full p-0 rounded-lg overflow-hidden",
    "transition-all duration-200 ease-out cursor-pointer",
    "hover:-translate-y-1 hover:-translate-x-1 hover:rotate-[-2deg]",
    "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]",
    "dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]",
    "active:translate-y-0 active:translate-x-0 active:shadow-none"
  );

  // Pure function to get button class - no reactive dependencies
  function getButtonClass() {
    return cn(
      baseButtonClasses,
      cardStyles[props.theme], // Direct lookup by theme
      props.isSelected && "ring-2 ring-primary ring-offset-2",
      (props.disabled || isProcessing) && "opacity-90 cursor-not-allowed pointer-events-none",
    );
  }
  
  // Pure function to get image source - no reactive dependencies
  function getImageSrc() {
    return props.element.src;
  }
  
  // Handle image loading errors
  function handleImageError() {
    console.error(`Failed to load image: ${props.element.src}`);
    imageError = true;
  }
</script>

<div class="relative">
  <Button
    variant="ghost"
    class={getButtonClass()}
    onclick={handleClick}
    disabled={props.disabled}
    title={props.element.description}
  >
    <div class="relative w-full h-full __aspect-video">
      {#if imageError}
        <div class="flex flex-col items-center justify-center h-full p-2 text-center">
          <AlertCircle class="w-6 h-6 text-neutral-400 mb-1" />
          <span class="text-xs text-neutral-500">{props.element.id}</span>
        </div>
      {:else}
        <img
          src={getImageSrc()}
          alt={props.element.alt}
          class="w-full h-full object-cover group-hover:opacity-40"
          onerror={handleImageError}
        />
      {/if}
      
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus class="text-neutral-500 dark:text-black" size={30} />
      </div>

      {#if isProcessing}
        <div class="absolute inset-0 flex items-center justify-center bg-black/50 dark:bg-white/50">
          <X class="text-white dark:text-black animate-spin" size={24} />
        </div>
      {/if}
    </div>
  </Button>
</div>