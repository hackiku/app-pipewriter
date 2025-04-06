<!-- src/lib/features/addon/features/table/interactive/TableMockup.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { getTableAlignmentClass, getCellAlignmentClass, zigzagLayouts } from "../data.svelte";
  import InteractiveCell from "./InteractiveCell.svelte";
  import { generateCellContents, getHoverPosition, getSelectedPosition } from "../tableContext.svelte";
  
  // Props using Svelte 5 runes
  const props = $props<{
    tableAlignment: string;
    cellVerticalAlignment: string;
    rows?: number;
    onCellClick?: (row: number, col: number) => void;
  }>();
  
  // Default to 1 row
  const rows = props.rows || 1;
  
  // Generate cell content
  let cellGrid = $derived(generateCellContents(rows));
  
  // Default to 3-column zigzag layout
  const layoutConfig = zigzagLayouts.threeColumn;
  
  // Get current table alignment class
  let tableAlignmentClass = $derived(getTableAlignmentClass(props.tableAlignment));
</script>

<div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
  <!-- Table Container with Horizontal Alignment -->
  <div class={cn("flex w-full transition-all duration-200", tableAlignmentClass)}>
    <!-- Table with proper border styling -->
    <div class="border border-neutral-300 dark:border-neutral-600 w-full overflow-hidden rounded-sm shadow-sm">
      <!-- Table grid -->
      <div class="grid" style="grid-template-columns: {layoutConfig.map(col => col.width + '%').join(' ')}">
        {#each cellGrid as row, rowIndex}
          {#each row as cell, cellIndex}
            <div class={cn(
              "transition-colors",
              "border-neutral-300 dark:border-neutral-600",
              cellIndex < row.length - 1 && "border-r",
              rowIndex < cellGrid.length - 1 && "border-b"
            )}>
              <!-- Interactive Cell Component -->
              <InteractiveCell 
                position={{ row: rowIndex, col: cellIndex }}
                alignment={{
                  horizontal: cell.alignment.horizontal,
                  vertical: cell.alignment.vertical
                }}
              />
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </div>
</div>