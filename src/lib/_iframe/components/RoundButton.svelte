<!-- $lib/components/RoundButton.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import { Loader2 } from "lucide-svelte";
  import type { LucideIcon } from 'lucide-svelte';

  export let variant: 'default' | 'ghost' | 'outline' = 'ghost';
  export let size: 'xs' | 'sm' | 'md' | undefined = undefined;
  export let disabled = false;
  export let className = '';
  export let icon: typeof LucideIcon | undefined = undefined;
  export let color: string | undefined = undefined;
  export let gradient = false;
  export let selected = false;
  export let loading = false;
  export let tooltipContent: string | undefined = undefined;

  // Simplified sizes matching IconButton's proven ratios
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-7 w-7',
    md: 'h-8 w-8'
  };

  // Icon padding taken from IconButton
  const iconPadding = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    default: 'p-1.5' // For container-filling mode
  };

  $: buttonStyle = gradient 
    ? "background: linear-gradient(45deg, #FF0000, #00FF00, #0000FF);"
    : color ? `background-color: ${color};` : undefined;

  $: buttonClass = cn(
    // Core classes
    'rounded-full aspect-square',
    'transition-all duration-200',
    
    // Size handling
    size ? sizeClasses[size] : 'h-full w-full',
    
    // Border & shadow from ColorButton
    color || gradient ? [
      "border-2",
      selected ? "border-primary shadow-md" : "border-gray-300 dark:border-gray-600",
      "hover:border-primary hover:shadow-md"
    ] : [
      // Icon styling from IconButton
      selected && "bg-primary/10 text-primary hover:bg-primary/20",
      !selected && "text-muted-foreground hover:text-foreground"
    ],
    
    // Shared states
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    disabled && "opacity-50 cursor-not-allowed",
    loading && "animate-pulse",
    
    className
  );

  // Icon classes with proper padding
  $: iconClass = cn(
    "w-full h-full",
    size ? iconPadding[size] : iconPadding.default,
    color && "text-white"
  );
</script>

{#if tooltipContent}
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <Button
        {variant}
        {disabled}
        class={buttonClass}
        style={buttonStyle}
        on:click
      >
        {#if loading}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else if icon}
          <svelte:component this={icon} class={iconClass} />
        {:else}
          <slot />
        {/if}
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>{tooltipContent}</p>
    </Tooltip.Content>
  </Tooltip.Root>
{:else}
  <Button
    {variant}
    {disabled}
    class={buttonClass}
    style={buttonStyle}
    on:click
  >
    {#if loading}
      <Loader2 class="h-4 w-4 animate-spin" />
    {:else if icon}
      <svelte:component this={icon} class={iconClass} />
    {:else}
      <slot />
    {/if}
  </Button>
{/if}