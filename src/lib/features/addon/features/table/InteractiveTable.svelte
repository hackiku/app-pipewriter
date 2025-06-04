<!-- src/lib/features/addon/features/table/InteractiveTable.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";

  // Props - now showing actual table features
  const props = $props<{
    cellAlignment: 'top' | 'middle' | 'bottom';
    scope: 'cell' | 'table';
    borderWidth: number;
    borderColor: string;
    backgroundColor: string;
    cellPadding: number; // in points
  }>();

  // Get cell content alignment class
  function getCellAlignClass() {
    switch (props.cellAlignment) {
      case 'top': return 'items-start';
      case 'middle': return 'items-center'; 
      case 'bottom': return 'items-end';
      default: return 'items-center';
    }
  }

  // Get border style based on settings
  function getBorderStyle() {
    if (props.borderWidth === 0) {
      return 'border-dashed border-neutral-300 dark:border-neutral-600';
    }
    return `border-solid border-[${props.borderWidth}px]`;
  }

  // Get border color
  function getBorderColor() {
    if (props.borderWidth === 0) return '';
    return `border-color: ${props.borderColor};`;
  }

  // Get background color for table or specific cell
  function getBackgroundColor(cellIndex: number) {
    if (!props.backgroundColor) return 'bg-white dark:bg-neutral-900';
    
    if (props.scope === 'table') {
      // Apply to all cells
      return '';
    } else {
      // Apply only to top-left cell (index 0)
      return cellIndex === 0 ? '' : 'bg-white dark:bg-neutral-900';
    }
  }

  // Get cell padding in pixels (approximate conversion from points)
  function getCellPadding() {
    // Rough conversion: 1 point ≈ 1.33 pixels
    const paddingPx = Math.round(props.cellPadding * 1.33);
    return `${paddingPx}px`;
  }

  // Check if cell should be highlighted (selected cell scope)
  function isCellHighlighted(cellIndex: number) {
    return props.scope === 'cell' && cellIndex === 0;
  }

  // Fixed 2x2 table for compact view
  const rows = 2;
  const cols = 2;
  const totalCells = rows * cols;
</script>

<!-- Bigger preview container for better visibility -->
<div class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 border border-dashed border-neutral-400 dark:border-neutral-500">
  <!-- Table mockup with realistic sizing -->
  <div class="flex justify-center">
    <div 
      class="border rounded-sm shadow-sm {getBorderStyle()}"
      style="{getBorderColor()} {props.backgroundColor && props.scope === 'table' ? `background-color: ${props.backgroundColor};` : 'background-color: white;'} {props.backgroundColor && props.scope === 'table' ? '' : ''}"
    >
      <!-- Dynamic grid based on columns -->
      <div 
        class="grid"
        style="grid-template-columns: repeat({cols}, minmax(0, 1fr));"
      >
        {#each Array(totalCells) as _, index}
          {@const row = Math.floor(index / cols)}
          {@const col = index % cols}
          
          <div 
            class={cn(
              "min-w-14 min-h-12 border border-neutral-300 dark:border-neutral-600 flex transition-all duration-200 relative",
              getCellAlignClass(),
              getBackgroundColor(index),
              isCellHighlighted(index) && "ring-2 ring-primary/50 ring-inset"
            )}
            style="padding: {getCellPadding()}; {props.backgroundColor && ((props.scope === 'table') || (props.scope === 'cell' && index === 0)) ? `background-color: ${props.backgroundColor};` : ''}"
          >
            <!-- Cell content - represents text/content -->
            <div class="w-8 h-3 bg-neutral-400 dark:bg-neutral-500 rounded transition-all duration-200 self-center justify-self-start"></div>
            
            <!-- Cell selection indicator -->
            {#if isCellHighlighted(index)}
              <div class="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>

</div>