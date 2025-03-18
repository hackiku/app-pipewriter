<!-- $lib/iframe/features/colors/ColorButton.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";

  // Props using SvelteKit 5 syntax
  const props = $props<{
    color: string;
    title: string;
    isGradient?: boolean;
    isSelected?: boolean;
    isProcessing?: boolean;
    onClick: (color: string) => void;
  }>();

  // Calculate button classes and style in the render function
  function getButtonClass() {
    return cn(
      "aspect-square w-full rounded-full transition-all duration-200",
      "border-2",
      props.isSelected ? "border-primary shadow-md" : "border-gray-300 dark:border-gray-600",
      "hover:border-primary hover:shadow-md",
      "focus:ring-2 focus:ring-primary focus:ring-offset-2",
      props.isProcessing && "opacity-50 cursor-not-allowed"
    );
  }

  function getButtonStyle() {
    return props.isGradient
      ? "background: linear-gradient(45deg, #FF0000, #00FF00, #0000FF);"
      : `background-color: ${props.color};`;
  }

  function handleClick() {
    if (!props.isProcessing) {
      props.onClick(props.color);
    }
  }
</script>

<button
  on:click={handleClick}
  class={getButtonClass()}
  title={props.title}
  style={getButtonStyle()}
  disabled={props.isProcessing}
  aria-pressed={props.isSelected}
>
  <span class="sr-only">{props.title}</span>
</button>