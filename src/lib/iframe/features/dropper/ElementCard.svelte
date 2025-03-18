<!-- $lib/iframe/features/dropper/ElementCard.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { Plus, X, AlertCircle } from 'lucide-svelte';
  import type { Element, ElementTheme } from '$lib/data/addon/elements';

  // Props
  const props = $props<{
    element: Element;
    onSelect: (id: string) => void;
    theme: ElementTheme;
    disabled?: boolean;
    isSelected?: boolean;
  }>();

  // Local state
  let mounted = $state(false);
  let isProcessing = $state(false);
  let isDarkMode = $state(false);
  let imageError = $state(false);

  // Set mounted state and check theme when component is active
  $effect(() => {
    mounted = true;
    // Check for dark mode
    if (typeof document !== 'undefined') {
      isDarkMode = document.documentElement.classList.contains('dark');
      
      // Watch for theme changes
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
      
      // Cleanup on destroy
      return () => observer.disconnect();
    }
  });

  async function handleClick() {
    if (props.disabled || isProcessing) return;
    
    isProcessing = true;
    
    try {
      await props.onSelect(props.element.id);
    } finally {
      isProcessing = false;
    }
  }

  // Card styling based on theme
  const cardStyles = {
    light: "bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700/80 hover:bg-slate-400/30 dark:hover:bg-slate-900/80",
    dark: "bg-slate-950 dark:bg-white hover:bg-slate-900/80 dark:hover:bg-slate-400/30 border border-neutral-300",
  };

  const baseButtonClasses = cn(
    "group relative w-full h-full p-0 rounded-lg overflow-hidden",
    "transition-all duration-200 ease-out cursor-pointer",
    "hover:-translate-y-1 hover:-translate-x-1 hover:rotate-[-2deg]",
    "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]",
    "dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]",
    "active:translate-y-0 active:translate-x-0 active:shadow-none"
  );

  // Computed properties using $derived
  let buttonClass = $derived(cn(
    baseButtonClasses,
    cardBackground,
    props.isSelected && "ring-2 ring-primary ring-offset-2",
    (props.disabled || isProcessing) && "opacity-90 cursor-not-allowed pointer-events-none",
  ));

  let cardBackground = $derived(
    mounted ? cardStyles[props.theme] : cardStyles[props.theme]
  );
  
  // Get SVG URL based on theme and dark mode
  let imgSrc = $derived(() => {
    if (!mounted) return props.element.src;
    
    // Ensure path starts with '/' for absolute path from root
    const path = props.element.src.startsWith('/elements/') ? props.element.src : `/${props.element.src}`;
    return path;
  });
  
  function handleImageError() {
    console.error(`Failed to load image: ${imgSrc}`);
    imageError = true;
  }
</script>

<div class="relative">
  <Button
    variant="ghost"
    class={buttonClass}
    onclick={handleClick}
    disabled={props.disabled}
    title={props.element.description}
  >
    <div class="relative w-full h-full aspect-square">
      {#if imageError}
        <div class="flex flex-col items-center justify-center h-full p-2 text-center">
          <AlertCircle class="w-6 h-6 text-neutral-400 mb-1" />
          <span class="text-xs text-neutral-500">{props.element.id}</span>
        </div>
      {:else}
        <img
          src={imgSrc}
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