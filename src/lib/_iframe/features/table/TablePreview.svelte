<!-- src/lib/iframe/features/table/TablePreview.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  
  // Props using Svelte 5 runes
  const props = $props<{
    tableAlignment: string;
    cellVerticalAlignment: string;
    columns?: number;
    rows?: number;
    previewHeader?: boolean;
  }>();
  
  // Use default values when not provided
  let columns = $derived(props.columns || 2);
  let rows = $derived(props.rows || 1);
  let previewHeader = $derived(props.previewHeader || false);
  
  // Computed classes for alignment
  let tableAlignmentClass = $derived(() => {
    switch (props.tableAlignment) {
      case "left": return "justify-start";
      case "center": return "justify-center";
      case "right": return "justify-end";
      default: return "justify-center";
    }
  });
  
  let cellAlignmentClass = $derived(() => {
    switch (props.cellVerticalAlignment) {
      case "top": return "items-start";
      case "middle": return "items-center";
      case "bottom": return "items-end";
      default: return "items-center";
    }
  });
  
  // Generate preview cells
  function generatePreviewCells(numCols) {
    return Array(numCols).fill(0).map((_, index) => {
      const width = Math.random() * 0.4 + 0.3; // Random width between 0.3 and 0.7
      return { width };
    });
  }
  
  // Create preview rows with cells
  function generatePreviewRows(numRows, numCols) {
    return Array(numRows).fill(0).map(() => {
      return generatePreviewCells(numCols);
    });
  }
  
  // Generate preview grid
  let previewGrid = $derived(generatePreviewRows(rows, columns));
</script>

<div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
  <!-- Table Preview -->
  <div class={cn("flex", tableAlignmentClass)}>
    <div class="border border-neutral-300 dark:border-neutral-600 w-full overflow-hidden">
      {#if previewHeader}
        <div class="bg-neutral-100 dark:bg-neutral-700 border-b border-neutral-300 dark:border-neutral-600 p-1">
          <div class="h-4 bg-neutral-300 dark:bg-neutral-500 w-2/3 rounded"></div>
        </div>
      {/if}
      
      <div class={cn("grid", `grid-cols-${columns}`)}>
        {#each previewGrid as row, rowIndex}
          {#each row as cell, cellIndex}
            <div class={cn(
              "border-neutral-300 dark:border-neutral-600",
              cellIndex < columns - 1 && "border-r",
              rowIndex < rows - 1 && "border-b"
            )}>
              <div class={cn("h-10 p-1 flex", cellAlignmentClass)}>
                <div 
                  class="h-3 bg-neutral-300 dark:bg-neutral-500 rounded"
                  style={`width: ${cell.width * 100}%`}
                ></div>
              </div>
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </div>
</div>