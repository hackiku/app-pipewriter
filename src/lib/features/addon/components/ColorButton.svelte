<!-- $lib/iframe/components/ColorButton.svelte -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cn } from "$lib/utils";

  export let color: string;
  export let title: string;
  export let isGradient: boolean = false;
  export let isSelected: boolean = false;
  export let isProcessing: boolean = false;
	export let tooltipContent: string;  
	export let buttonClass: string;

  const dispatch = createEventDispatcher();

  function handleClick() {
    if (!isProcessing) {
      dispatch('click', { color });
    }
  }

  $: buttonClass = cn(
    "aspect-square w-full rounded-full transition-all duration-200",
    "border-2",
    isSelected ? "border-primary shadow-md" : "border-gray-300 dark:border-gray-600",
    "hover:border-primary hover:shadow-md",
    "focus:ring-2 focus:ring-primary focus:ring-offset-2",
    isProcessing && "opacity-50 cursor-not-allowed"
  );

  $: buttonStyle = isGradient
    ? "background: linear-gradient(45deg, #FF0000, #00FF00, #0000FF);"
    : `background-color: ${color};`;
</script>

<button
  on:click={handleClick}
  class={buttonClass}
  {title}
  style={buttonStyle}
  disabled={isProcessing}
  aria-pressed={isSelected}
>
  <span class="sr-only">{title}</span>
</button>