<!-- $lib/iframe/layout/dropper/DropperBar.svelte -->
<script lang="ts">
  import { elementsThemeStore } from '../../stores/elementsThemeStore';
  import { zenMode } from '../../stores';
  import { dropperStore, chainMode, dropperStatus } from '../../stores/dropperStore';
  import { gridStore } from '../../stores/gridStore';
  import { Link } from 'lucide-svelte';
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import IconButton from "../../components/IconButton.svelte";
  import type { GridColumns } from '../../stores/gridStore';

  const themes = [
    { id: 'light', color: '#FFFFFF', label: 'Light' },
    { id: 'dark', color: '#171717', label: 'Dark' }
  ] as const;

  const gridSizes: { value: GridColumns; label: string }[] = [
    { value: 3, label: '3×' },
    { value: 2, label: '2×' },
    { value: 1, label: '1×' }
  ];

  $: currentTheme = themes.find(t => t.id === $elementsThemeStore) || themes[0];
  $: currentGridSize = gridSizes.find(s => s.value === $gridStore.columns) || gridSizes[0];
  $: nextGridSize = gridSizes[(gridSizes.findIndex(s => s.value === currentGridSize.value) + 1) % gridSizes.length];
  $: chainModeTooltip = $chainMode 
    ? "Exit chain mode" 
    : "Enter chain mode" + ($dropperStatus.hasElements 
        ? ` (${$dropperStatus.selectedElements?.length} selected)` 
        : "");

  $: nextTheme = themes[(themes.findIndex(t => t.id === currentTheme.id) + 1) % themes.length];
</script>

<div class="relative dropper-container" class:fixed={$zenMode} class:w-full={$zenMode}>
  <!-- Background Gradient -->
  <div 
    class="absolute bottom-0 left-0 right-0 h-16
           bg-gradient-to-t from-gray-100 from-20% 
           via-gray-100/80 via-70% to-transparent 
           dark:from-gray-950 dark:via-gray-950/65
           pointer-events-none"
    aria-hidden="true"
  />
  
  <!-- Control Bar -->
  <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 z-40">
    <div class="bg-white dark:bg-gray-900 rounded-t-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <div class="flex px-2 py-1.5 pb-2.5 items-center">
        <IconButton
          icon={Link}
          size="sm"
          selected={$chainMode}
          disabled={$dropperStatus.isProcessing}
          tooltipContent={chainModeTooltip}
          on:click={() => dropperStore.toggleChainMode()}
        />

        <!-- Simple Color Button -->
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              class="mr-2.5 ml-2 h-6 w-6 rounded-full border-[0.15em] border-gray-300 dark:border-gray-500
                     transition-all duration-150
                     hover:border-primary/60 dark:hover:border-primary/80 hover:shadow-sm active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed"
              style="background-color: {currentTheme.color}"
              disabled={$dropperStatus.isProcessing}
              on:click={() => elementsThemeStore.cycle()}
            >
              <span class="sr-only">Switch to {nextTheme.label} theme</span>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Switch to {nextTheme.label} theme</p>
          </Tooltip.Content>
        </Tooltip.Root>

        <!-- Grid Size -->
        <Button
          variant="outline"
          size="sm"
          class="h-6.5 w-6 aspect-square rounded-full text-xs font-medium border-[0.15em] border-gray-200 dark:border-gray-500
                 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-gray-700
								 hover:border-primary/60 dark:hover:border-primary/80 hover:shadow-sm active:scale-95
                 text-muted-foreground hover:text-foreground
                 transition-all duration-150"
          disabled={$dropperStatus.isProcessing}
          title={`Switch to ${nextGridSize.label} grid`}
          on:click={() => gridStore.cycleColumns()}
        >
          {currentGridSize.label}
        </Button>
      </div>
    </div>
  </div>
</div>

<style>
  .dropper-container {
    position: relative;
    z-index: 10;
  }

  .dropper-container.fixed {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  /* :global(.dropper-container [data-radix-popper-content-wrapper]) {
    z-index: 50 !important;
  } */
</style>