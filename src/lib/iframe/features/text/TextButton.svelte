<!-- $lib/iframe/features/text/TextButton.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Loader2 } from "lucide-svelte";
  import type { LucideIcon } from 'lucide-svelte';
  import { cn } from "$lib/utils";

  // Props
  const props = $props<{
    icon?: typeof LucideIcon;
    label?: string;
    title?: string;
    iconOnly?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'outline' | 'ghost';
    onClick: () => void;
  }>();

  // Determine if button should be square
  let isSquare = $derived(props.iconOnly || !props.label);
  
  // Get CSS classes for button
  let buttonClass = $derived(() => {
    return cn(
      "transition-all duration-200",
      isSquare ? "aspect-square p-0" : "px-3",
      "h-10"
    );
  });
</script>

<Button
  variant={props.variant || "outline"}
  class={buttonClass}
  disabled={props.disabled || props.isLoading}
  onclick={props.onClick}
  title={props.title || props.label}
>
  {#if props.isLoading}
    <Loader2 class="h-4 w-4 animate-spin" />
  {:else if props.icon}
    <svelte:component this={props.icon} class="h-4 w-4 {!isSquare && 'mr-2'}" />
  {/if}
  
  {#if !isSquare && props.label}
    <span>{props.label}</span>
  {/if}
</Button>