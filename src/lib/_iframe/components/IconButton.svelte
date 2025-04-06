<!-- $lib/iframe/components/IconButton.svelte -->

<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import type { LucideIcon } from 'lucide-svelte';
  import { Info } from 'lucide-svelte';

  export let icon: typeof LucideIcon = Info;
  export let label: string | undefined = undefined;
  export let selected = false;
  export let disabled = false;
  export let size: "sm" | "md" | "lg" = "md";
  export let variant: "ghost" | "outline" | "secondary" = "ghost";
  export let tooltipContent: string | undefined = undefined;
  export let className: string | undefined = undefined;
  
  $: sizeClasses = {
    sm: "h-7 w-7 p-1.5",
    md: "h-8 w-8 p-2",
    lg: "h-9 w-9 p-2"
  };

  $: buttonClass = cn(
    "rounded-full transition-all duration-200",
    sizeClasses[size],
    selected && "bg-primary/10 text-primary hover:bg-primary/20",
    !selected && "text-muted-foreground hover:text-foreground",
    disabled && "opacity-50 cursor-not-allowed",
    className
  );
</script>

{#if tooltipContent}
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <Button
        {variant}
        size="icon"
        class={buttonClass}
        {disabled}
        on:click
      >
        <svelte:component this={icon} class={cn("w-full h-full", label && "mr-2")} />
        {#if label}<span class="sr-only">{label}</span>{/if}
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>{tooltipContent}</p>
    </Tooltip.Content>
  </Tooltip.Root>
{:else}
  <Button
    {variant}
    size="icon"
    class={buttonClass}
    {disabled}
    on:click
  >
    <svelte:component this={icon} class={cn("w-full h-full", label && "mr-2")} />
    {#if label}<span class="sr-only">{label}</span>{/if}
  </Button>
{/if}