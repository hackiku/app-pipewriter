<!-- src/lib/features/addon/features/table/interactive/TableGrid.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  
  // Props using Svelte 5 runes
  const props = $props<{
    tableAlignment: string;
    cellVerticalAlignment: string;
    columns: number;
    rows: number;
    hoveredAlignment: string | null;
  }>();
  
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
  
  // Hover effect handling
  let previewAlignmentClass = $derived(() => {
    if (!props.hoveredAlignment) return {};
    
    const [horizontal, vertical] = props.hoveredAlignment.split('-');
    
    const horizontalClass = horizontal === 'left' ? 'justify-start' : 
                           horizontal === 'right' ? 'justify-end' : 'justify-center';
                           
    const verticalClass = vertical === 'top' ? 'items-start' : 
                         vertical === 'bottom' ? 'items-end' : 'items-center';
    
    return {
      tableClass: horizontalClass,
      cellClass: verticalClass
    };
  });
  
  // Generate zigzag layout with 3 columns (outer columns wider)
  let tableStructure = $derived(() => {
    // Always 3 columns, wide-narrow-wide
    const rowArray = [];
    
    for (let i = 0; i < props.rows; i++) {
      const row = [
        { content: "Left column content", width: "40%" },
        { content: "Center", width: "20%" },
        { content: "Right column content", width: "40%" }
      ];
      rowArray.push(row);
    }
    
    return rowArray;
  });
</script>

<div class="relative w-full">
  <!-- Table Preview -->
  <div class={cn(
    "flex transition-all duration-150",
    props.hoveredAlignment ? previewAlignmentClass.tableClass : tableAlignmentClass
  )}>
    <div class="border border-neutral-300 dark:border-neutral-600 w-full overflow-hidden">
      <div class="grid grid-cols-3">
        {#each tableStructure as row, rowIndex}
          {#each row as cell, cellIndex}
            <div class={cn(
              "border-neutral-300 dark:border-neutral-600",
              cellIndex < row.length - 1 && "border-r",
              rowIndex < tableStructure.length - 1 && "border-b"
            )} style={`width: ${cell.width}`}>
              <div class={cn(
                "h-12 p-1 flex transition-all duration-150",
                props.hoveredAlignment ? previewAlignmentClass.cellClass : cellAlignmentClass
              )}>
                <div 
                  class="h-3 bg-neutral-300 dark:bg-neutral-500 rounded"
                  style={`width: ${cellIndex === 1 ? '80%' : '60%'}`}
                ></div>
              </div>
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </div>
</div>