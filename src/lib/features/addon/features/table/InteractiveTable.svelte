<!-- src/lib/features/addon/features/table/InteractiveTable.svelte - ULTRA SIMPLE CN() VERSION -->
<script lang="ts">
  import { cn } from "$lib/utils";

  const props = $props<{
    cellAlignment: 'top' | 'middle' | 'bottom';
    scope: 'cell' | 'table';
    borderWidth: number;
    borderColor: string;
    backgroundColor: string;
    cellPadding: number;
  }>();

  // SIMPLE: Derived classes using cn()
  const containerClass = $derived(cn(
    "flex justify-center h-full items-center p-3" // Padding to contain borders
  ));

  const tableClass = $derived(cn(
    "w-32 h-16 overflow-hidden",
    // Border state: dashed gray OR solid colored
    props.borderWidth === 0 
      ? "border-2 border-dashed border-muted-foreground/40"
      : `border-[${props.borderWidth}px] border-solid`,
    // Background: chessboard pattern when no color
    !props.backgroundColor && "bg-gradient-to-br from-muted/20 via-transparent to-muted/20"
  ));

  const gridClass = $derived(cn(
    "grid grid-cols-2 grid-rows-2 h-full w-full",
    // Internal borders - SAME for all cells
    "[&>*]:border-r [&>*]:border-b",
    "[&>*:nth-child(2)]:border-r-0", // Remove right border from top-right
    "[&>*:nth-child(3)]:border-b-0", // Remove bottom border from bottom-left  
    "[&>*:nth-child(4)]:border-r-0 [&>*:nth-child(4)]:border-b-0", // Remove both from bottom-right
    // Internal border styling
    props.borderWidth === 0
      ? "[&>*]:border-dashed [&>*]:border-muted-foreground/40"
      : "[&>*]:border-solid"
  ));

  // Cell alignment
  const alignmentClass = $derived(cn(
    props.cellAlignment === 'top' && "items-start justify-start",
    props.cellAlignment === 'middle' && "items-center justify-start", 
    props.cellAlignment === 'bottom' && "items-end justify-start"
  ));

  // Get cell class for each cell
  function getCellClass(cellIndex: number) {
    return cn(
      "flex transition-all duration-200 relative",
      alignmentClass,
      // Cell selection opacity
      props.scope === 'cell' && cellIndex !== 0 && "opacity-30",
      // Padding
      props.cellPadding === 0 && "p-1",
      props.cellPadding === 5 && "p-1.5", 
      props.cellPadding === 10 && "p-2",
      props.cellPadding === 20 && "p-3",
      props.cellPadding > 20 && "p-4"
    );
  }

  // Get cell background
  function getCellBgClass(cellIndex: number) {
    if (!props.backgroundColor) return "";
    
    if (props.scope === 'table') {
      return ""; // Applied to table container
    } else if (props.scope === 'cell' && cellIndex === 0) {
      return ""; // Applied inline
    }
    return "";
  }

  // Table background style
  const tableStyle = $derived(() => {
    let style = '';
    
    // Border color for solid borders
    if (props.borderWidth > 0) {
      style += `border-color: ${props.borderColor}; `;
    }
    
    // Background color
    if (props.backgroundColor) {
      if (props.scope === 'table') {
        style += `background-color: ${props.backgroundColor}; `;
      }
    }
    
    return style;
  });

  // Grid style for internal border colors
  const gridStyle = $derived(() => {
    if (props.borderWidth > 0) {
      return `--border-color: ${props.borderColor};`;
    }
    return '';
  });

  // Individual cell style
  function getCellStyle(cellIndex: number) {
    if (props.backgroundColor && props.scope === 'cell' && cellIndex === 0) {
      return `background-color: ${props.backgroundColor};`;
    }
    return '';
  }
</script>

<div class={containerClass}>
  <div 
    class={tableClass}
    style={tableStyle()}
  >
    <div 
      class={gridClass}
      style={gridStyle()}
    >
      {#each Array(4) as _, index}
        <div 
          class={getCellClass(index)}
          style={getCellStyle(index)}
        >
          <!-- Content bar -->
          <div class="w-3 h-1 bg-muted-foreground/60 rounded-sm flex-shrink-0"></div>
          
          <!-- Selection indicator -->
          {#if props.scope === 'cell' && index === 0}
            <div class="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-primary rounded-full"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  /* Apply border color to internal borders when solid */
  :global([style*="--border-color"] > *) {
    border-color: var(--border-color) !important;
  }
</style>