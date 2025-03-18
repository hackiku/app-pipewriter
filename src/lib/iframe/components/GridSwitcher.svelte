<!-- $lib/iframe/components/GridSwitcher.svelte -->

<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { gridStore } from '../stores/gridStore';
  import { cn } from "$lib/utils";

  export let disabled = false;

  $: tooltipContent = `Switch to ${
    $gridStore.columns === 3 ? "2" :
    $gridStore.columns === 2 ? "1" : "3"
  } column layout`;
</script>

<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Button
      variant="ghost"
      size="icon"
      {disabled}
      class={cn(
        "h-7 w-7 rounded-full transition-colors duration-200",
        "hover:bg-gray-200 dark:hover:bg-gray-700",
        "border-none"
      )}
      on:click={() => gridStore.cycleColumns()}
    >
      <span class="font-mono text-sm">
        {$gridStore.columns}×
      </span>
    </Button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    <p>{tooltipContent}</p>
  </Tooltip.Content>
</Tooltip.Root>