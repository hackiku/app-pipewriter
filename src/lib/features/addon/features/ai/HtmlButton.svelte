<!-- $lib/iframe/features/ai/HtmlButton.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import type { LucideIcon } from 'lucide-svelte';

  export let icon: LucideIcon;
  export let label: string;;
  // export let disabled = false;
  export let disabled = false;
  export let variant: 'icon-only' | 'text' = 'icon-only';
  export let actions: Array<{ label: string; onClick: () => void }> = [];

  $: buttonClass = cn(
    "h-10 text-sm",
    "relative",
    "flex items-center justify-between px-4",
    "w-full rounded-lg",
    "border border-input bg-background",
    "hover:bg-accent hover:text-accent-foreground",
    disabled && "opacity-50 cursor-not-allowed"
  );

  $: miniButtonClass = cn(
    "h-7",
    variant === 'icon-only' ? "w-7" : "px-3",
    "flex items-center justify-center",
    "rounded-md",
    "border border-input bg-background",
    "hover:bg-accent hover:text-accent-foreground",
    disabled && "opacity-50 cursor-not-allowed"
  );
</script>

<div class={buttonClass}>
  <div class="flex items-center gap-2">
    <svelte:component this={icon} class="h-4 w-4" />
    <span>{label}</span>
  </div>
  
  <div class="flex items-center gap-2">
    {#if variant === 'icon-only'}
      {#each actions as action}
        <button 
          class={miniButtonClass}
          on:click={action.onClick}
          {disabled}
          title={action.label}
        >
          <svelte:component this={action.icon} class="h-4 w-4" />
        </button>
      {/each}
    {:else}
      {#each actions as action}
        <button 
          class={miniButtonClass}
          on:click={action.onClick}
          {disabled}
        >
          {action.label}
        </button>
      {/each}
    {/if}
  </div>
</div>