<!-- $lib/iframe/features/dropper/ElementCard.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { Plus, AlertCircle, Lock, Star } from '@lucide/svelte';
  import type { Element, ElementTheme } from '$lib/data/addon/types';
  import { onMount, onDestroy } from 'svelte';

  import { useTrialFeatures } from '$lib/context/trial.svelte';
  const trialFeatures = useTrialFeatures();

  // Props
  const props = $props<{
    element: Element;
    onSelect: (id: string) => void;
    theme: ElementTheme;
    disabled?: boolean;
    isSelected?: boolean;
    isLocked?: boolean;
    chainMode?: boolean;
    chainPosition?: number; // Position in chain (1, 2, 3, etc.) - 0 means not in chain
    onChainToggle?: (id: string) => void;
  }>();

  const isLocked = props.isLocked;
  const isPro = props.element.metadata?.tier === 'pro';

  // Fix: Use a regular function to determine lock status (not $derived)
  function checkIfElementLocked() {
    const elementTier = props.element.metadata?.tier || 'free';
    
    if (trialFeatures.trialInfo.isPro) return false;
    if (trialFeatures.trialInfo.active) return elementTier === 'pro';
    return elementTier !== 'free';
  }
  
  // Local state - minimal reactivity
  let isProcessing = $state(false);
  let imageError = $state(false);
  let appTheme = $state<ElementTheme>('light');
  let observer: MutationObserver | null = null;
  
  // Setup mutation observer to detect theme changes on document
  onMount(() => {
    // Initial dark mode check
    appTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    
    // Watch for dark mode changes
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const newAppTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
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
  
  // Clean up observer on component destroy
  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });
  
  // Handle click on the element card
  async function handleClick(e: MouseEvent) {
    if (props.disabled || isProcessing) return;
    
    // In chain mode, handle chain toggle instead of direct selection
    if (props.chainMode && props.onChainToggle) {
      e.preventDefault();
      e.stopPropagation();
      props.onChainToggle(props.element.id);
      return;
    }
    
    // Don't proceed if locked
    if (isLocked) return;
    
    isProcessing = true;
    
    try {
      await props.onSelect(props.element.id);
    } finally {
      isProcessing = false;
    }
  }

  // Function to get the correct image path based on both element theme and app theme
  function getSvgUrl(): string {
    const element = props.element;
    const baseId = element.id.endsWith('-dark') ? element.id.replace(/-dark$/, '') : element.id;
    
    // In app dark mode, we invert the theme logic
    const shouldUseDarkVariant = appTheme === 'dark' 
      ? props.theme === 'light'  // In dark app, light elements should be dark
      : props.theme === 'dark';  // In light app, dark elements stay dark
    
    const svgPath = shouldUseDarkVariant ? `${baseId}-dark.svg` : `${baseId}.svg`;
    return `/elements/${svgPath}`;
  }

  // Card styling based on theme
  const cardStyles = {
    light: "bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700/80 hover:bg-neutral-400/30 dark:hover:bg-neutral-900/80",
    dark: "bg-neutral-950 dark:bg-white hover:bg-neutral-900/80 dark:hover:bg-neutral-400/30 border border-neutral-300",
  };

  const baseButtonClasses = cn(
    "group relative w-full h-full p-0 rounded-lg overflow-hidden",
    "transition-all duration-200 ease-out cursor-pointer"
  );

  // Pure function to get button class - no reactive dependencies
  function getButtonClass() {
    const isLockedElement = checkIfElementLocked();
    
    return cn(
      baseButtonClasses,
      cardStyles[props.theme],
      // Keep hover animations for pro elements but gray them out
      !isLockedElement && "hover:-translate-y-1 hover:-translate-x-1 hover:rotate-[-2deg] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]",
      !isLockedElement && "active:translate-y-0 active:translate-x-0 active:shadow-none",
      props.isSelected && "ring-2 ring-primary ring-offset-2",
      (props.disabled || isProcessing) && "opacity-90 cursor-not-allowed pointer-events-none",
      isLockedElement && "opacity-60 grayscale"
    );
  }
  
  // Handle image loading errors
  function handleImageError() {
    console.error(`Failed to load image: ${getSvgUrl()}`);
    imageError = true;
  }
</script>

<div class="relative">
  <Button
    variant="ghost"
    class={getButtonClass()}
    onclick={handleClick}
    disabled={props.disabled || isProcessing}
    title={checkIfElementLocked() ? "Upgrade to access this element" : props.element.description}
  >
    <div class="relative w-full h-full">
      {#if imageError}
        <div class="flex flex-col items-center justify-center h-full p-2 text-center">
          <AlertCircle class="w-6 h-6 text-neutral-400 mb-1" />
          <span class="text-xs text-neutral-500">{props.element.id}</span>
        </div>
      {:else}
        <!-- Element Image -->
        <img
          src={getSvgUrl()}
          alt={props.element.alt}
          class="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
          onerror={handleImageError}
        />

        <!-- Pro Star Icon (top-right, subtle) -->
        {#if isPro}
          <div class="absolute top-1 right-1">
            <Star size={10} class="text-amber-400/60 fill-amber-400/60" />
          </div>
        {/if}
      {/if}
      
      <!-- Chain Mode Selection Button (top-left) -->
      {#if props.chainMode}
        <div class="absolute pl-0.5 pt-0.5 pb-3 pr-2 gradient-from-tr to  top-0 left-0 bg-red-400/10">
          <div 
            class="w-5 h-5 rounded-full border-2 border-primary/60 bg-background/90 flex items-center justify-center
                   {props.chainPosition > 0 ? 'bg-foreground border-border' : 'bg-card border-blue-500'} 
                   transition-all duration-150"
          >
            {#if props.chainPosition > 0}
              <span class="text-xs font-medium text-background">{props.chainPosition}</span>
            {/if}
          </div>
        </div>
      {/if}
      
      {#if checkIfElementLocked()}
        <!-- Locked Element Overlay -->
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/30 dark:bg-white/20">
          <Lock class="text-white dark:text-gray-100 mb-1" size={20} />
          <span class="text-white dark:text-gray-100 text-xs font-medium">Pro</span>
        </div>
      {:else if !props.chainMode}
        <!-- Normal Hover Effect for Unlocked Elements (only when not in chain mode) -->
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus class="text-neutral-500 dark:text-black" size={30} />
        </div>
      {/if}

      {#if isProcessing}
        <!-- Processing State Overlay -->
        <div class="absolute inset-0 flex items-center justify-center bg-black/50 dark:bg-white/50">
          <div class="w-6 h-6 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      {/if}
    </div>
  </Button>
</div>