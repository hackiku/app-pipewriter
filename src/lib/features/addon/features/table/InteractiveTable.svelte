<!-- src/lib/features/addon/features/table/InteractiveTable.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";

  // Props
  const props = $props<{
    tableAlignment: 'left' | 'center' | 'right';
    cellAlignment: 'top' | 'middle' | 'bottom';
    columns: number;
    rows: number;
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

  // Generate grid template columns based on column count
  function getGridCols() {
    return `repeat(${props.columns}, 0fr)`;
  }

  // Generate total cells
  let totalCells = $derived(props.columns * props.rows);
</script>

<div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 h-28">
  <!-- Table positioned according to alignment -->
  <div class={cn("flex w-full h-full transition-all duration-200", getTableAlignClass())}>
    <!-- Table mockup with borders -->
    <div class="border border-neutral-300 dark:border-neutral-600 rounded-sm shadow-sm bg-white dark:bg-neutral-900">
      <!-- Dynamic grid based on columns/rows -->
      <div 
        class="grid h-full"
        style="grid-template-columns: {getGridCols()}"
      >
        {#each Array(totalCells) as _, index}
          {@const row = Math.floor(index / props.columns)}
          {@const col = index % props.columns}
          
          <div class={cn(
            "min-w-12 min-h-8 border-neutral-300 dark:border-neutral-600 p-2 flex transition-all duration-200",
            getCellAlignClass(),
            "justify-center", // Always center horizontally in this preview
            col < props.columns - 1 && "border-r", // Right border except last column
            row < props.rows - 1 && "border-b" // Bottom border except last row
          )}>
            <!-- Cell content - small rectangle representing text/content -->
            <div class="w-6 h-2 bg-neutral-300 dark:bg-neutral-500 rounded transition-all duration-200"></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>