<!-- src/lib/features/addon/features/table/InteractiveTable.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";

  // Props
  const props = $props<{
    tableAlignment: 'left' | 'center' | 'right';
    cellAlignment: 'top' | 'middle' | 'bottom';
  }>();

  // Get table container alignment class
  function getTableAlignClass() {
    switch (props.tableAlignment) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-center';
    }
  }

  // Get cell content alignment class
  function getCellAlignClass() {
    switch (props.cellAlignment) {
      case 'top': return 'items-start';
      case 'middle': return 'items-center';
      case 'bottom': return 'items-end';
      default: return 'items-center';
    }
  }

  // Generate grid template columns - make smaller/narrower
  function getGridCols() {
    return `repeat(2, minmax(0, 1fr))`;
  }

  // Fixed 2x2 table
  let totalCells = 4;
</script>

<!-- Match height with AlignmentButtonGrid: 2 sections with headers, gaps, and h-9 buttons -->
<div class="bg-neutral-200 dark:bg-neutral-700 rounded-lg py-6 px-1 border border-dashed border-neutral-500 dark:border-neutral-400 h-28 flex items-center">
  <!-- Table positioned according to alignment -->
  <div class={cn("flex w-full h-full transition-all duration-200", getTableAlignClass())}>
    <!-- Table mockup with borders -->
    <div class="border rounded-sm shadow-sm bg-white dark:bg-neutral-900">
      <!-- Dynamic grid based on columns/rows -->
      <div 
        class="grid h-full"
        style="grid-template-columns: {getGridCols()}"
      >
        {#each Array(totalCells) as _, index}
          {@const row = Math.floor(index / props.columns)}
          {@const col = index % props.columns}
          
          <div class={cn(
            "min-w-8 min-h-7 border border-neutral-300 dark:border-neutral-600 p-2 flex transition-all duration-200",
            getCellAlignClass(),
            "justify-center ", // Always center horizontally in this preview
          )}>
            <!-- Cell content - small rectangle representing text/content -->
            <div class="w-6 h-2 bg-neutral-300 dark:bg-neutral-500 rounded transition-all duration-200"></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>