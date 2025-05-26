<!-- src/lib/features/addon/features/table/AlignmentButtonGrid.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { 
    AlignLeft, 
    AlignCenter, 
    AlignRight, 
    AlignStartVertical, 
    AlignCenterVertical, 
    AlignEndVertical,
    Loader2
  } from "@lucide/svelte";

  // Props
  const props = $props<{
    tableAlignment: 'left' | 'center' | 'right';
    cellAlignment: 'top' | 'middle' | 'bottom';
    isProcessing: boolean;
    onAlignmentChange: (type: 'table' | 'cell', value: string) => void;
  }>();

  // Table alignment options
  const tableAlignments = [
    { value: 'left', icon: AlignLeft, label: 'Align table left' },
    { value: 'center', icon: AlignCenter, label: 'Center table' },
    { value: 'right', icon: AlignRight, label: 'Align table right' }
  ] as const;

  // Cell content alignment options
  const cellAlignments = [
    { value: 'top', icon: AlignStartVertical, label: 'Align content to top' },
    { value: 'middle', icon: AlignCenterVertical, label: 'Center content vertically' },
    { value: 'bottom', icon: AlignEndVertical, label: 'Align content to bottom' }
  ] as const;

  // Get button class based on selection state
  function getButtonClass(type: 'table' | 'cell', value: string) {
    const currentValue = type === 'table' ? props.tableAlignment : props.cellAlignment;
    const isSelected = currentValue === value;
    
    return cn(
      "flex h-9 w-9 items-center justify-center transition-all",
      "border rounded-md",
      isSelected 
        ? "bg-primary/10 border-primary text-primary" 
        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700",
      props.isProcessing && "opacity-50 cursor-not-allowed"
    );
  }

  // Handle button click
  function handleClick(type: 'table' | 'cell', value: string) {
    if (!props.isProcessing) {
      props.onAlignmentChange(type, value);
    }
  }
</script>

<div class="space-y-2">
  <!-- Table Position Section -->
  <div>
    <h3 class="text-[0.6em] mb-1 font-medium text-muted-foreground">
      Table Position
    </h3>
    <div class="grid grid-cols-3 gap-2">
      {#each tableAlignments as align}
        <button
          class={getButtonClass('table', align.value)}
          onclick={() => handleClick('table', align.value)}
          disabled={props.isProcessing}
          title={align.label}
        >
          {#if props.isProcessing && props.tableAlignment === align.value}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            <svelte:component this={align.icon} class="h-4 w-4" />
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Cell Content Section -->
  <div>
    <h3 class="text-[0.6em] mb-1 font-medium text-muted-foreground">
      Cell Content
    </h3>
    <div class="grid grid-cols-3 gap-2">
      {#each cellAlignments as align}
        <button
          class={getButtonClass('cell', align.value)}
          onclick={() => handleClick('cell', align.value)}
          disabled={props.isProcessing}
          title={align.label}
        >
          {#if props.isProcessing && props.cellAlignment === align.value}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            <svelte:component this={align.icon} class="h-3 w-3" />
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>