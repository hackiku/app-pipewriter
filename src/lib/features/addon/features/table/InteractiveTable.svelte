<!-- src/lib/features/addon/features/table/InteractiveTable.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";

  // Props - scope toggle moved to parent
  const props = $props<{
    cellAlignment: 'top' | 'middle' | 'bottom';
    scope: 'cell' | 'table';
    borderWidth: number;
    borderColor: string;
    backgroundColor: string;
    cellPadding: number; // in points
  }>();

  // Get cell content alignment class - ENHANCED for better visual feedback
  function getCellAlignClass() {
    switch (props.cellAlignment) {
      case 'top': return 'justify-start items-start pt-1';
      case 'middle': return 'justify-start items-center'; 
      case 'bottom': return 'justify-start items-end pb-1';
      default: return 'justify-start items-center';
    }
  }

  // Get border style - ALL DASHED when no border (as requested)
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

  // Get cell padding - SIMPLE: just real padding, no scaling
  function getCellPadding() {
    return `${props.cellPadding}px`; // Direct padding, no math
  }

  // Check if cell should be highlighted (selected cell scope)  
  function isCellHighlighted(cellIndex: number) {
    return props.scope === 'cell' && cellIndex === 0;
  }

  // Get cell opacity - dim non-selected cells when in cell mode
  function getCellOpacity(cellIndex: number) {
    if (props.scope === 'cell' && cellIndex !== 0) {
      return 'opacity-30';
    }
    return 'opacity-100';
  }

  // SIMPLE: Fixed content size, just moves with padding
  function getContentClass() {
    return {
      class: 'w-6 h-2 bg-neutral-400 dark:bg-neutral-500 rounded transition-all duration-200 flex-shrink-0',
      style: '' // No dynamic sizing
    };
  }

  // Fixed 2x2 table for compact view
  const rows = 2;
  const cols = 2;
  const totalCells = rows * cols;
</script>

<!-- Table container - stretches to fill height -->
<div class="flex justify-center h-full items-stretch">
  <div 
    class="flex-1 max-w-32 {getBorderStyle()}"
    style="{getBorderColor()} {props.backgroundColor && props.scope === 'table' ? `background-color: ${props.backgroundColor};` : 'background-color: white;'}"
  >
    <!-- Grid with all borders - cells stretch vertically -->
    <div class="grid grid-cols-2 grid-rows-2 h-full">
      {#each Array(totalCells) as _, index}
        {@const contentInfo = getContentClass()}
        
        <div 
          class={cn(
            // Remove min-height, let cells stretch to fill
            "min-w-16 flex transition-all duration-200 relative overflow-hidden",
            props.borderWidth === 0 ? "border-dashed border-neutral-300 dark:border-neutral-600" : "border-solid border-neutral-300 dark:border-neutral-600",
            getCellAlignClass(),
            getBackgroundColor(index),
            getCellOpacity(index)
            // REMOVED: ring when highlighted - no gray border!
          )}
          style="padding: {getCellPadding()}; border-width: {props.borderWidth === 0 ? '1px' : props.borderWidth + 'px'}; {getBorderColor()} {props.backgroundColor && ((props.scope === 'table') || (props.scope === 'cell' && index === 0)) ? `background-color: ${props.backgroundColor};` : ''}"
        >
          <!-- Simple content that moves with padding -->
          <div class={contentInfo.class} style={contentInfo.style}></div>
          
          <!-- Just a small indicator, no ring -->
          {#if isCellHighlighted(index)}
            <div class="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>