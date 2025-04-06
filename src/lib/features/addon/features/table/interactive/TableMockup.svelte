<!-- src/lib/features/addon/features/table/interactive/TableMockup.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { getTableAlignmentClass, getCellAlignmentClass, zigzagLayouts } from "../data.svelte";
  
  // Props using Svelte 5 runes
  const props = $props<{
    tableAlignment: string;
    cellVerticalAlignment: string;
    rows: number;
    hoveredAlignment?: {
      tableAlignment?: string;
      cellVerticalAlignment?: string;
    };
  }>();
  
  // Default to 3-column zigzag layout
  const columns = 3;
  const layoutConfig = zigzagLayouts.threeColumn;
  
  // Computed classes for alignment - use either hovered or current alignment
  let tableAlignmentClass = $derived(() => {
    const alignment = props.hoveredAlignment?.tableAlignment || props.tableAlignment;
    return getTableAlignmentClass(alignment);
  });
  
  let cellAlignmentClass = $derived(() => {
    const alignment = props.hoveredAlignment?.cellVerticalAlignment || props.cellVerticalAlignment;
    return getCellAlignmentClass(alignment);
  });
  
  // Generate table content
  function generateRows(rowCount: number) {
    const rows = [];
    
    for (let i = 0; i < rowCount; i++) {
      const cells = layoutConfig.map(col => ({
        width: col.width,
        align: col.contentAlign,
        content: col.label,
        contentWidth: Math.random() * 0.3 + 0.5 // Random width between 50-80%
      }));
      
      rows.push(cells);
    }
    
    return rows;
  }
  
  let tableData = $derived(generateRows(props.rows));
</script>

<div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
  <!-- Table Container with Horizontal Alignment -->
  <div class={cn("flex w-full transition-all duration-200", tableAlignmentClass)}>
    <!-- Table with proper border styling -->
    <div class="border border-neutral-300 dark:border-neutral-600 w-full overflow-hidden rounded-sm shadow-sm">
      <!-- Table Rows -->
      {#each tableData as row, rowIndex}
        <div class="grid" style="grid-template-columns: {layoutConfig.map(col => col.width + '%').join(' ')}">
          {#each row as cell, cellIndex}
            <div class={cn(
              "transition-colors",
              "border-neutral-300 dark:border-neutral-600",
              cellIndex < columns - 1 && "border-r",
              rowIndex < tableData.length - 1 && "border-b"
            )}>
              <!-- Cell Content with Vertical Alignment -->
              <div class={cn(
                "h-14 px-3 py-2 flex", 
                cellAlignmentClass,
                cell.align === "left" && "justify-start",
                cell.align === "center" && "justify-center",
                cell.align === "right" && "justify-end",
              )}>
                <!-- Content Placeholder -->
                <div 
                  class="h-4 bg-neutral-300 dark:bg-neutral-500 rounded"
                  style={`width: ${cell.contentWidth * 100}%`}
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>