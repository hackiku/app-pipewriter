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

  // Get cell padding in pixels - ENHANCED to maintain visibility at all levels
  function getCellPadding() {
    // Better conversion that maintains content visibility
    const paddingPx = Math.round(props.cellPadding * 0.6);
    return `${Math.min(paddingPx, 8)}px`; // Cap at 8px for UI
  }

  // Check if cell should be highlighted (selected cell scope)
  function isCellHighlighted(cellIndex: number) {
    return props.scope === 'cell' && cellIndex === 0;
  }

  // ENHANCED: Get cell content positioning based on alignment and padding
  function getContentClass(cellIndex: number) {
    const baseClasses = "w-6 h-2 bg-neutral-400 dark:bg-neutral-500 rounded transition-all duration-200";
    
    // Show alignment effect on all cells or just selected cell
    const shouldShowAlignment = props.scope === 'table' || (props.scope === 'cell' && cellIndex === 0);
    
    if (shouldShowAlignment) {
      return `${baseClasses} flex-shrink-0`;
    }
    
    // Default centered positioning for non-affected cells
    return `${baseClasses} self-center justify-self-start flex-shrink-0`;
  }

  // Fixed 2x2 table for compact view - TALLER cells for better alignment
  const rows = 2;
  const cols = 2;
  const totalCells = rows * cols;
</script>

<!-- ENHANCED: Taller table to help with alignment -->
<div class="flex justify-center h-full items-center">
  <div 
    class="rounded-sm shadow-sm {getBorderStyle()}"
    style="{getBorderColor()} {props.backgroundColor && props.scope === 'table' ? `background-color: ${props.backgroundColor};` : 'background-color: white;'}"
  >
    <!-- Dynamic grid with TALLER cells for better alignment -->
    <div 
      class="grid"
      style="grid-template-columns: repeat({cols}, minmax(0, 1fr));"
    >
      {#each Array(totalCells) as _, index}
        {@const row = Math.floor(index / cols)}
        {@const col = index % cols}
        
        <div 
          class={cn(
            // ENHANCED: Taller cells (min-h-16) for better visual balance
            "min-w-16 min-h-16 flex transition-all duration-200 relative",
            props.borderWidth === 0 ? "border-dashed border-neutral-300 dark:border-neutral-600" : "border-solid border-neutral-300 dark:border-neutral-600",
            getCellAlignClass(),
            getBackgroundColor(index),
            isCellHighlighted(index) && "ring-2 ring-primary/50 ring-inset"
          )}
          style="padding: {getCellPadding()}; border-width: {props.borderWidth === 0 ? '1px' : props.borderWidth + 'px'}; {getBorderColor()} {props.backgroundColor && ((props.scope === 'table') || (props.scope === 'cell' && index === 0)) ? `background-color: ${props.backgroundColor};` : ''}"
        >
          <!-- ENHANCED: Cell content that moves based on alignment -->
          <div class={getContentClass(index)}></div>
          
          <!-- Cell selection indicator -->
          {#if isCellHighlighted(index)}
            <div class="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>