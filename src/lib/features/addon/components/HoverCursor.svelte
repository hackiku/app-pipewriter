<!-- $lib/iframe/components/HoverCursor.svelte -->
<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { fade } from 'svelte/transition';

  export let visible = false;
  
  const TOOLTIP_DELAY = 400; // ms
</script>

{#if visible}
  <div 
    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 cursor-none"
    transition:fade={{ duration: 200 }}
  >
    <Tooltip.Root delayDuration={TOOLTIP_DELAY}>
      <Tooltip.Trigger asChild>
        <div class="relative">
          <Plus class="text-white" size={24} />
          <div class="absolute inset-0 cursor-none" style="cursor: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><line x1=%2212%22 y1=%225%22 x2=%2212%22 y2=%2219%22></line><line x1=%225%22 y1=%2212%22 x2=%2219%22 y2=%2212%22></line></svg>'), auto;" />
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Drop element to cursor</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </div>
{/if}

<style>
  div {
    opacity: 0;
  }

  div:hover {
    opacity: 1;
  }
</style>