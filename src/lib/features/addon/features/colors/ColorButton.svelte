<!-- src/lib/features/addon/features/colors/ColorButton.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";

  // Props using SvelteKit 5 syntax
  const props = $props<{
    color: string;
    title: string;
    isSelected?: boolean;
    isProcessing?: boolean;
    onClick: (color: string) => void;
  }>();

  // Calculate button classes and style
  function getButtonClass() {
    return cn(
      "aspect-square w-full rounded-full transition-all duration-200 relative overflow-hidden",
      "border-2 cursor-pointer",
      props.isSelected 
        ? "border-primary shadow-lg __ring-2 __ring-red-200/60" 
        : "border-gray-300 dark:border-gray-600 hover:border-primary/60 hover:scale-105 hover:shadow-md",
      props.isProcessing && "opacity-50 cursor-not-allowed pointer-events-none"
    );
  }

  function getButtonStyle() {
    return `background-color: ${props.color};`;
  }

  function handleClick() {
    if (!props.isProcessing) {
      props.onClick(props.color);
    }
  }
</script>

<button
  onclick={handleClick}
  class={getButtonClass()}
  title={props.title}
  style={getButtonStyle()}
  disabled={props.isProcessing}
  aria-pressed={props.isSelected}
>
  <!-- Subtle inner border for better definition on light colors -->
  <!-- <div class="absolute inset-0.5 border-2 border-background rounded-full"></div> -->
  
  <!-- Selection indicator -->
  {#if props.isSelected}
    <div class="absolute inset-0 __bg-black/10 dark:bg-white/10 flex items-center justify-center">
      <!-- <div class="w-3 h-3 bg-white dark:bg-black rounded-full shadow-sm"></div> -->
    </div>
  {/if}
  
  <span class="sr-only">{props.title}</span>
</button>