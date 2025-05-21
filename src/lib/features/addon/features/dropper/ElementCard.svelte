<!-- $lib/iframe/features/dropper/ElementCard.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { Plus, X, AlertCircle, Lock } from '@lucide/svelte';
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
	}>();

	const isLocked = props.isLocked;

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
            console.log(`App theme changed from ${appTheme} to ${newAppTheme}`);
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
  async function handleClick() {
    if (props.disabled || isProcessing || isLocked) return;
    
    isProcessing = true;
    
    try {
      // Call the select handler without capturing any reactive dependencies
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
    disabled={props.disabled || isProcessing || checkIfElementLocked()}
    title={checkIfElementLocked() ? "Upgrade to access this element" : props.element.description}
  >
    <div class="relative w-full h-full __aspect-video">
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
          class="w-full h-full object-cover {checkIfElementLocked() ? 'opacity-40 grayscale' : 'group-hover:opacity-40'}"
          onerror={handleImageError}
        />

        <!-- Tier Badge - Using your smaller sizing -->
        <div class="absolute top-0.5 right-0.5 z-10">
          <div class="text-[0.4rem] px-1 rounded-md font-medium opacity-80 {
            (props.element.metadata?.tier === 'pro') 
              ? 'bg-primary/80 text-white' 
              : 'bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200'
          }">
            {props.element.metadata?.tier === 'pro' ? 'Pro' : 'Free'}
          </div>
        </div>
      {/if}
      
      {#if isLocked}
        <!-- Locked Element Overlay -->
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/30 dark:bg-white/20">
          <Lock class="text-white dark:text-gray-100 mb-1" size={20} />
          <span class="text-white dark:text-gray-100 text-xs font-medium">Pro</span>
        </div>
      {:else}
        <!-- Normal Hover Effect for Unlocked Elements -->
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus class="text-neutral-500 dark:text-black" size={30} />
        </div>
      {/if}

      {#if isProcessing}
        <!-- Processing State Overlay -->
        <div class="absolute inset-0 flex items-center justify-center bg-black/50 dark:bg-white/50">
          <X class="text-white dark:text-black animate-spin" size={24} />
        </div>
      {/if}
    </div>
  </Button>
</div>