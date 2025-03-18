<!-- $lib/iframe/tabs/TableTab.svelte -->

<script lang="ts">
  import { AlignLeft, AlignCenter, AlignRight, AlignStartHorizontal, AlignVerticalDistributeCenter, AlignVerticalDistributeEnd } from 'lucide-svelte';
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  // import { callGAS } from "../utils";

	function callGAS(action: string, params: Record<string, any> = {}) {
    const payload = {
      ...params
    };
    
    window.parent.postMessage(
      JSON.stringify({
        action,
        payload
      }),
      '*'
    );
  }


  const horizontalAlignments = [
    {
      icon: AlignLeft,
      label: "Left",
      action: "tableAlignHorizontal",
      value: "left",
      tooltip: "Align text left"
    },
    {
      icon: AlignCenter,
      label: "Center",
      action: "tableAlignHorizontal", 
      value: "center",
      tooltip: "Align text center"
    },
    {
      icon: AlignRight,
      label: "Right",
      action: "tableAlignHorizontal",
      value: "right", 
      tooltip: "Align text right"
    }
  ];

  const verticalAlignments = [
    {
      icon: AlignStartHorizontal,
      label: "Top",
      action: "tableAlignVertical",
      value: "top",
      tooltip: "Align content to top"
    },
    {
      icon: AlignVerticalDistributeCenter,
      label: "Middle",
      action: "tableAlignVertical",
      value: "middle",
      tooltip: "Align content to middle"
    },
    {
      icon: AlignVerticalDistributeEnd,
      label: "Bottom",
      action: "tableAlignVertical",
      value: "bottom",
      tooltip: "Align content to bottom"
    }
  ];

  function handleAlignment(action: string, value: string) {
    callGAS(action, { alignment: value });
  }
</script>

<div class="flex flex-col items-center gap-2 w-full">
  <!-- Horizontal Alignment Row -->
  <div class="flex justify-center gap-1">
    {#each horizontalAlignments as { icon, label, action, value, tooltip }}
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            class="h-8 px-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            on:click={() => handleAlignment(action, value)}
          >
            <svelte:component this={icon} class="h-4 w-4" />
            <span class="sr-only">{label}</span>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{tooltip}</p>
        </Tooltip.Content>
      </Tooltip.Root>
    {/each}
  </div>

  <!-- Vertical Alignment Row -->
  <div class="flex justify-center gap-1">
    {#each verticalAlignments as { icon, label, action, value, tooltip }}
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            class="h-8 px-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            on:click={() => handleAlignment(action, value)}
          >
            <svelte:component this={icon} class="h-4 w-4" />
            <span class="sr-only">{label}</span>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{tooltip}</p>
        </Tooltip.Content>
      </Tooltip.Root>
    {/each}
  </div>
</div>