<!-- Updated src/lib/features/addon/features/dropper/ElementCard.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { cn } from '$lib/utils';
  import { Plus, AlertCircle, Lock } from '@lucide/svelte';
  import type { ElementWithAccess, ElementTheme } from '$lib/types/elements';

  // Props - much simpler now
  const props = $props<{
    element: ElementWithAccess;
    onSelect: (id: string) => void;
    theme: ElementTheme;
    svgUrl: string; // Now passed from parent
    disabled?: boolean;
    isSelected?: boolean;
    isLocked?: boolean;
    chainMode?: boolean;
    chainPosition?: number; // Position in chain (1, 2, 3, etc.) - 0 means not in chain
    onChainToggle?: (id: string) => void;
  }>();

  // Local state - minimal
  let isProcessing = $state(false);
  let imageError = $state(false);

  // Use the element's locked state (calculated by service)
  const isLocked = props.element.isLocked;
  const isPro = props.element.metadata?.tier === 'pro';

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

  // Card styling based on theme
  const cardStyles = {
    light:
      'bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700/80 hover:bg-neutral-400/30 dark:hover:bg-neutral-900/80',
    dark: 'bg-neutral-950 dark:bg-white hover:bg-neutral-900/80 dark:hover:bg-neutral-400/30 border border-neutral-300'
  };

  const baseButtonClasses = cn(
    'group relative w-full h-full p-0 rounded-lg overflow-hidden',
    'transition-all duration-200 ease-out cursor-pointer'
  );

  // Button class calculation
  function getButtonClass() {
    return cn(
      baseButtonClasses,
      cardStyles[props.theme],
      // Hover animations for unlocked elements
      !isLocked &&
        'hover:-translate-y-1 hover:-translate-x-1 hover:rotate-[-2deg] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]',
      !isLocked && 'active:translate-y-0 active:translate-x-0 active:shadow-none',
      props.isSelected && 'ring-2 ring-primary ring-offset-2',
      (props.disabled || isProcessing) && 'opacity-90 cursor-not-allowed pointer-events-none',
      isLocked && 'opacity-60 grayscale'
    );
  }

  // Handle image loading errors
  function handleImageError() {
    console.error(`Failed to load image: ${props.svgUrl}`);
    imageError = true;
  }
</script>

<div class="relative">
  <Button
    variant="ghost"
    class={getButtonClass()}
    onclick={handleClick}
    disabled={props.disabled || isProcessing}
    title={isLocked ? 'Upgrade to access this element' : props.element.description}
  >
    <div class="relative h-full w-full">
      {#if imageError}
        <div class="flex h-full flex-col items-center justify-center p-2 text-center">
          <AlertCircle class="mb-1 h-6 w-6 text-neutral-400" />
          <span class="text-xs text-neutral-500">{props.element.id}</span>
        </div>
      {:else}
        <!-- Element Image -->
        <img
          src={props.svgUrl}
          alt={props.element.alt || props.element.description}
          class="h-full w-full object-cover transition-opacity group-hover:opacity-40"
          onerror={handleImageError}
        />
      {/if}

      <!-- Chain Mode Selection Button -->
      {#if props.chainMode && !isLocked}
        <div class="pointer-events-none absolute left-0 top-0">
          <!-- Radial gradient for attention -->
          <div
            class="bg-gradient-radial absolute inset-0 h-12
                    w-12 from-accent/20 from-30% via-accent/10
                    via-60% to-transparent to-100%"
          ></div>
        </div>

        <div class="absolute left-1 top-1 z-10">
          <div
            class="pointer-events-auto flex h-5 w-5 items-center justify-center
                   rounded-full border-2 bg-background/95 backdrop-blur-sm
                   {props.chainPosition && props.chainPosition > 0
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-primary/60 bg-background hover:border-primary hover:bg-primary/5'} 
                   transition-all duration-150 hover:scale-105"
          >
            {#if props.chainPosition && props.chainPosition > 0}
              <span class="text-xs font-medium">{props.chainPosition}</span>
            {:else}
              <Plus class="h-2.5 w-2.5 text-primary/70" />
            {/if}
          </div>
        </div>
      {/if}

      {#if !props.chainMode && !isLocked}
        <!-- Normal Hover Effect for Unlocked Elements -->
        <div
          class="bg-gradient-radial absolute inset-0 flex items-center
                  justify-center from-background/30 from-20%
                  via-background/10 via-50% to-transparent to-100%
                  opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div class="rounded-full border border-border/50 bg-background/90 p-2 backdrop-blur-sm">
            <Plus class="text-foreground/80" size={20} />
          </div>
        </div>
      {:else if !props.chainMode && isLocked}
        <!-- Locked Element Hover Effect -->
        <div
          class="bg-gradient-radial absolute inset-0 flex items-center
                  justify-center from-background/30 from-20%
                  via-background/10 via-50% to-transparent to-100%
                  opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div class="rounded-full border border-border/50 bg-background/90 px-2 py-1 backdrop-blur-sm">
            <span class="text-xs font-medium text-foreground/80">Get Pro</span>
          </div>
        </div>
      {/if}

      {#if isProcessing}
        <!-- Processing State Overlay -->
        <div
          class="bg-gradient-radial absolute inset-0 flex items-center
                  justify-center from-background/80 from-20% via-background/60
                  via-50% to-background/40 to-100% backdrop-blur-sm"
        >
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          ></div>
        </div>
      {/if}
    </div>
  </Button>

  <!-- External Locked Overlay -->
  {#if isLocked}
    <div
      class="pointer-events-none absolute inset-0 z-10 
             bg-gradient-to-t from-background via-background/60 to-transparent 
             from-0% via-25% to-70%
             border-b border-background"
    >
      <div class="absolute bottom-1 right-1 flex items-center gap-1 opacity-70">
        <Lock class="h-3 w-3 text-muted-foreground" />
      </div>
    </div>
  {/if}
</div>

<style>
  /* Custom radial gradient utility */
  .bg-gradient-radial {
    background: radial-gradient(var(--tw-gradient-stops));
  }
</style>