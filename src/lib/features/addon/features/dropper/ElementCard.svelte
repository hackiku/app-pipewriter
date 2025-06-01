<!-- src/lib/features/addon/features/dropper/ElementCard.svelte - CLEANED -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { cn } from '$lib/utils';
  import { Plus, AlertCircle, Lock } from '@lucide/svelte';
  import type { ElementData } from '$lib/server/data-loaders';
  import type { ElementTheme } from '$lib/types/elements';

  // Props - much simpler now, no contexts!
  const props = $props<{
    element: ElementData;
    onSelect: (id: string) => void;
    theme: ElementTheme;
    disabled?: boolean;
    isSelected?: boolean;
    chainMode?: boolean;
    chainPosition?: number; // Position in chain (1, 2, 3, etc.) - 0 means not in chain
    onChainToggle?: (id: string) => void;
  }>();

  // Local state - minimal
  let isProcessing = $state(false);
  let imageError = $state(false);

  // Get SVG URL - simple path construction
  function getSvgUrl(): string {
    const isDarkTheme = typeof window !== 'undefined' && 
                       document.documentElement.classList.contains('dark');
    
    if (props.element.metadata?.supports?.darkMode && isDarkTheme) {
      return `/elements/${props.element.id}-dark.svg`;
    }
    return `/elements/${props.element.id}.svg`;
  }

  // Handle click on the element card
  async function handleClick(e: MouseEvent) {
    if (props.disabled || isProcessing || props.element.isLocked) return;

    // In chain mode, handle chain toggle instead of direct selection
    if (props.chainMode && props.onChainToggle) {
      e.preventDefault();
      e.stopPropagation();
      props.onChainToggle(props.element.id);
      return;
    }

    isProcessing = true;
    try {
      await props.onSelect(props.element.id);
    } finally {
      isProcessing = false;
    }
  }

  // Card styling based on element theme
  const cardStyles = {
    light: 'bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700/80 hover:bg-neutral-400/30 dark:hover:bg-neutral-900/80',
    dark: 'bg-neutral-950 dark:bg-white hover:bg-neutral-900/80 dark:hover:bg-neutral-400/30 border border-neutral-300'
  };

  const baseButtonClasses = cn(
    'group relative w-full h-full p-0 rounded-lg overflow-hidden',
    'transition-all duration-200 ease-out cursor-pointer'
  );

  // Button class calculation - SIMPLIFIED
  function getButtonClass() {
    return cn(
      baseButtonClasses,
      cardStyles[props.theme],
      // Hover animations ONLY for unlocked elements
      !props.element.isLocked && 'hover:-translate-y-1 hover:-translate-x-1 hover:rotate-[-2deg] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]',
      !props.element.isLocked && 'active:translate-y-0 active:translate-x-0 active:shadow-none',
      props.isSelected && 'ring-2 ring-primary ring-offset-2',
      (props.disabled || isProcessing) && 'opacity-90 cursor-not-allowed pointer-events-none',
      props.element.isLocked && 'opacity-60 grayscale cursor-not-allowed'
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
    disabled={props.disabled || isProcessing || props.element.isLocked}
    title={props.element.isLocked ? `Upgrade to access this ${props.element.metadata?.tier || 'pro'} element` : props.element.description}
  >
    <!-- Element Image Container -->
    <div class="relative w-full aspect-[4/2] overflow-hidden">
      {#if imageError}
        <div class="flex h-full flex-col items-center justify-center p-2 text-center">
          <AlertCircle class="mb-1 h-6 w-6 text-neutral-400" />
          <span class="text-xs text-neutral-500">{props.element.id}</span>
        </div>
      {:else}
        <!-- Element Image -->
        <img
          src={getSvgUrl()}
          alt={props.element.description}
          class="w-full h-full object-contain transition-opacity group-hover:opacity-40"
          onerror={handleImageError}
        />
      {/if}

      <!-- Chain Mode UI -->
      {#if props.chainMode && !props.element.isLocked}
        <div class="absolute left-1 top-1 z-10">
          <div class="flex h-5 w-5 items-center justify-center rounded-full border-2 bg-background/95 backdrop-blur-sm
                   {props.chainPosition && props.chainPosition > 0
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-primary/60 bg-background hover:border-primary hover:bg-primary/5'} 
                   transition-all duration-150 hover:scale-105">
            {#if props.chainPosition && props.chainPosition > 0}
              <span class="text-xs font-medium">{props.chainPosition}</span>
            {:else}
              <Plus class="h-2.5 w-2.5 text-primary/70" />
            {/if}
          </div>
        </div>
      {/if}

      <!-- Hover Overlays -->
      {#if !props.chainMode && !props.element.isLocked}
        <!-- Normal Mode: Add Element -->
        <div class="absolute inset-0 flex items-center justify-center 
                    bg-gradient-radial from-background/30 from-20% via-background/10 via-50% to-transparent to-100%
                    opacity-0 transition-opacity group-hover:opacity-100">
          <div class="rounded-full border border-border/50 bg-background/90 p-2 backdrop-blur-sm">
            <Plus class="text-foreground/80" size={20} />
          </div>
        </div>
      {:else if !props.chainMode && props.element.isLocked}
        <!-- Locked Element: Upgrade Message -->
        <div class="absolute inset-0 flex items-center justify-center 
                    bg-gradient-radial from-background/50 from-20% via-background/30 via-50% to-transparent to-100%
                    opacity-0 transition-opacity group-hover:opacity-100">
          <div class="rounded-full border border-border/50 bg-background/90 px-2 py-1 backdrop-blur-sm">
            <span class="text-xs font-medium text-foreground/80">
              {props.element.metadata?.tier === 'pro' ? 'Get Pro' : 'Get Trial'}
            </span>
          </div>
        </div>
      {/if}

      <!-- Processing State -->
      {#if isProcessing}
        <div class="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      {/if}
    </div>
  </Button>

  <!-- Lock Indicator -->
  {#if props.element.isLocked}
    <div class="absolute bottom-1 right-1 flex items-center gap-1 opacity-70 pointer-events-none">
      <div class="bg-background/90 backdrop-blur-sm rounded px-1 py-0.5 flex items-center gap-1">
        <Lock class="h-3 w-3 text-muted-foreground" />
        <span class="text-xs text-muted-foreground font-medium">
          {props.element.metadata?.tier === 'pro' ? 'Pro' : 'Trial'}
        </span>
      </div>
    </div>
  {/if}
</div>

<style>
  .bg-gradient-radial {
    background: radial-gradient(var(--tw-gradient-stops));
  }
</style>