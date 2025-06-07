<!-- src/lib/features/addon/features/table/InteractiveTable.svelte - FIXED BORDER THICKNESS -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { Check } from "@lucide/svelte";

  const props = $props<{
    cellAlignment: 'top' | 'middle' | 'bottom';
    scope: 'cell' | 'table';
    borderWidth: number;
    borderColor: string;
    backgroundColor: string;
    cellPadding: number;
  }>();

  // Container with enough padding for thick borders
  const containerClass = $derived(cn(
    "flex justify-center h-full items-center p-2" // Padding to show borders
  ));

  // FIXED: Proper border thickness mapping
  const tableClass = $derived(cn(
    "w-[7.5em] h-20 overflow-visible", // !!! KEEP WITH 7.5em
    // Map actual border widths properly
    props.borderWidth === 0 
      ? "border border-dashed border-muted-foreground/40"
      : props.borderWidth === 1 
        ? "border border-solid"
        : props.borderWidth === 2
          ? "border-2 border-solid"
          : props.borderWidth === 3
            ? "border-[3px] border-solid"
            : props.borderWidth === 4
              ? "border-[4px] border-solid"
              : props.borderWidth === 5
                ? "border-[5px] border-solid"
                : "border-[6px] border-solid" // 6pt max
  ));

  // FIXED: Internal borders to match external thickness
  const gridClass = $derived(cn(
    "grid grid-cols-2 grid-rows-2 h-full w-full",
    // Don't use divide utilities - use custom borders for thickness control
    "[&>*]:border-r [&>*]:border-b",
    "[&>*:nth-child(2)]:border-r-0", // Remove right border from top-right
    "[&>*:nth-child(3)]:border-b-0", // Remove bottom border from bottom-left  
    "[&>*:nth-child(4)]:border-r-0 [&>*:nth-child(4)]:border-b-0", // Remove both from bottom-right
    // Style the borders to match external
    props.borderWidth === 0
      ? "[&>*]:border-dashed [&>*]:border-muted-foreground/40"
      : props.borderWidth === 1
        ? "[&>*]:border-solid"
        : props.borderWidth === 2
          ? "[&>*]:border-2 [&>*]:border-solid"
          : props.borderWidth === 3
            ? "[&>*]:border-[3px] [&>*]:border-solid"
            : props.borderWidth === 4
              ? "[&>*]:border-[4px] [&>*]:border-solid"
              : props.borderWidth === 5
                ? "[&>*]:border-[5px] [&>*]:border-solid"
                : "[&>*]:border-[6px] [&>*]:border-solid"
  ));

  // Cell alignment classes
  const alignmentClass = $derived(cn(
    props.cellAlignment === 'top' && "items-start justify-start",
    props.cellAlignment === 'middle' && "items-center justify-start", 
    props.cellAlignment === 'bottom' && "items-end justify-start"
  ));

  // Better padding interpolation
  function getCellClass(cellIndex: number) {
    let paddingClass = "p-1"; // default
    
    if (props.cellPadding === 0) paddingClass = "p-0";
    else if (props.cellPadding <= 3) paddingClass = "p-0.5";
    else if (props.cellPadding <= 6) paddingClass = "p-1";
    else if (props.cellPadding <= 9) paddingClass = "p-1.5";
    else if (props.cellPadding <= 12) paddingClass = "p-2";
    else if (props.cellPadding <= 16) paddingClass = "p-3";
    else if (props.cellPadding <= 20) paddingClass = "p-4";
    else if (props.cellPadding <= 24) paddingClass = "p-5";
    else paddingClass = "p-6"; // 30pt max
    
    return cn(
      "flex transition-all duration-200 relative",
      alignmentClass,
      paddingClass,
      // Cell selection opacity (only for background, not borders)
      props.scope === 'cell' && cellIndex !== 0 && "opacity-30"
    );
  }

  // Table styles with proper border color
  const tableStyle = $derived(() => {
    let style = '';
    
    // Border color when borders are enabled
    if (props.borderWidth > 0) {
      style += `border-color: ${props.borderColor}; `;
    }
    
    // Background color for whole table
    if (props.backgroundColor && props.scope === 'table') {
      style += `background-color: ${props.backgroundColor}; `;
    }
    
    return style;
  });

  // FIXED: Grid style for internal border colors
  const gridStyle = $derived(() => {
    if (props.borderWidth > 0) {
      return `--border-color: ${props.borderColor};`;
    }
    return '';
  });

  // Individual cell background
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
          <!-- Content bar (smaller to accommodate padding) -->
          <!-- !!! KEEP THIS -->
          <div class="w-5 h-2 bg-muted-foreground/60 rounded-sm flex-shrink-0"></div>
          
          <!-- Selection indicator -->
          {#if props.scope === 'cell' && index === 0}
            <div class="absolute top-0.5 right-0.5 w-3 h-3 bg-green-500/40 rounded-full flex items-center justify-center">
              <Check class="w-2 h-2 text-green-700"/>
            </div>
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