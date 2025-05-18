<!-- src/lib/features/addon/features/table/TablePreview.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { getTableAlignmentClass, getCellAlignmentClass } from "./tableState.svelte";
  import type { TableConfig } from "./tableState.svelte";
  
  // Props with Svelte 5 runes
  const { config } = $props<{
    config: TableConfig;
  }>();
  
  // Calculate cell width for the preview display
  let cellWidths = $derived(() => {
    if (config.dimensions.columns === 3) {
      return [33, 33, 33]; // Even 3-column layout
    } else if (config.dimensions.columns === 2) {
      return [50, 50]; // Even 2-column layout
    } else {
      return [100]; // Single column
    }
  });
  
  // Calculate border style
  let borderStyle = $derived(() => {
    const { width, color, style } = config.borders;
    return `${width}px ${style} ${color}`;
  });
</script>

<div class="w-full flex p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
  <div 
    class={cn(
      "w-full flex transition-all duration-150", 
      getTableAlignmentClass(config.alignment.tableAlignment)
    )}
  >
    <!-- Table with proper border styling -->
    <div 
      class="overflow-hidden rounded-sm shadow-sm"
      style="border: {borderStyle};"
    >
      <div 
        class="grid"
        style="grid-template-columns: {cellWidths.map(w => w + '%').join(' ')};"
      >
        {#each Array(Math.min(4, config.dimensions.columns)) as _, col}
          <div 
            class="border-r" 
            style="border-color: {config.borders.color}; {col === config.dimensions.columns - 1 ? 'border-right: none;' : ''}"
          >
            <div 
              class={cn(
                "p-2 flex w-full", 
                getCellAlignmentClass(config.alignment.cellVerticalAlignment)
              )}
              style="height: {Math.min(config.dimensions.rowHeight * 36, 40)}px"
            >
              <div class="h-3 bg-neutral-300 dark:bg-neutral-600 rounded w-16"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>