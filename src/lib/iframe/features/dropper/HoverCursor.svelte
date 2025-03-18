<!-- $lib/iframe/features/dropper/HoverCursor.svelte -->
<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { fade } from 'svelte/transition';
  import { cn } from "$lib/utils";

  export let visible = false;
  export let variant: "default" | "button" = "default";
  
  const TOOLTIP_DELAY = 400; // ms

  $: overlayClass = cn(
    "absolute inset-0 flex items-center justify-center",
    "transition-opacity duration-200 cursor-none",
    variant === "button" ? "bg-black/30 hover:bg-black/50" : "bg-black/50"
  );

  $: iconClass = cn(
    "text-white transition-transform duration-200",
    variant === "button" && "transform group-hover:scale-125"
  );
</script>

{#if visible}
  <div 
    class={overlayClass}
    transition:fade={{ duration: 200 }}
  >
    <Tooltip.Root delayDuration={TOOLTIP_DELAY}>
      <Tooltip.Trigger asChild>
        <div class="relative group">
          <Plus 
            class={iconClass}
            size={variant === "button" ? 32 : 24} 
          />
          <!-- Custom cursor overlay -->
          <div 
            class="absolute inset-0 cursor-none" 
            style="cursor: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><line x1=%2212%22 y1=%225%22 x2=%2212%22 y2=%2219%22></line><line x1=%225%22 y1=%2212%22 x2=%2219%22 y2=%2212%22></line></svg>'), auto;" 
          />
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Click to insert element</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </div>
{/if}

<style>
  /* Enhance opacity transitions */
  div {
    opacity: 0;
  }

  div:hover {
    opacity: 1;
  }

  /* Ensure smooth icon scaling */
  :global(.transform) {
    transform-origin: center;
    backface-visibility: hidden;
  }
</style>