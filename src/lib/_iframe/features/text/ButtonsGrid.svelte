<!-- $lib/iframe/features/text/ButtonsGrid.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import * as LucideIcons from "lucide-svelte";

  // Props with simpler structure
  const props = $props<{
    buttons: Array<{
      icon: keyof typeof LucideIcons;
      label?: string;
      onClick: () => void;
      variant?: 'default' | 'outline' | 'ghost';
      disabled?: boolean;
      title?: string;
      className?: string;
      gridArea?: string;
    }>;
    className?: string;
    compact?: boolean;
  }>();

  // Generate button class based on button props
  function getButtonClass(button) {
    return cn(
      "flex items-center justify-center text-xs",
      button.gridArea && `${button.gridArea}`, 
      button.className,
      props.compact && "px-2 py-1 h-8"
    );
  }
</script>

<div class={cn("grid grid-cols-2 grid-rows-2 gap-2 h-full", props.className)}>
  {#each props.buttons as button}
    <Button
      variant={button.variant || 'outline'}
      class={getButtonClass(button)}
      disabled={button.disabled}
      onclick={button.onClick}
      title={button.title}
    >
      {#if button.icon}
        {@const Icon = LucideIcons[button.icon]}
        <Icon class={cn("h-3 w-3", button.label && "mr-1")} />
      {/if}
      
      {#if button.label}
        <span>{button.label}</span>
      {/if}
    </Button>
  {/each}
</div>