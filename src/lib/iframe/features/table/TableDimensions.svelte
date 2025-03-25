<!-- src/lib/iframe/features/table/TableDimensions.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Plus, Minus, ArrowRight, GripHorizontal, GripVertical, X } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";

  // Props with default values
  const props = $props<{
    initialValues: {
      columns: number;
      rows: number;
      columnWidth: number;
      rowHeight: number;
    };
  }>();

  // Set up event dispatcher
  const dispatch = createEventDispatcher();

  // Local state that we'll modify
  let columns = $state(props.initialValues.columns);
  let rows = $state(props.initialValues.rows);
  let columnWidth = $state(props.initialValues.columnWidth);
  let rowHeight = $state(props.initialValues.rowHeight);
  
  // Table preview grid dimensions
  const MAX_PREVIEW_CELLS = 6;

  // Track changes and dispatch them
  function dispatchChange() {
    dispatch("change", {
      columns,
      rows,
      columnWidth,
      rowHeight
    });
  }

  // Input handlers
  function setColumns(value: number) {
    columns = Math.max(1, Math.min(20, value));
    dispatchChange();
  }

  function setRows(value: number) {
    rows = Math.max(1, Math.min(50, value));
    dispatchChange();
  }

  function handleColumnWidthChange(event: Event) {
    columnWidth = parseFloat((event.target as HTMLInputElement).value) || 1;
    dispatchChange();
  }

  function handleRowHeightChange(event: Event) {
    rowHeight = parseFloat((event.target as HTMLInputElement).value) || 1;
    dispatchChange();
  }

  // Derived value for the class based on grid dimensions
  let gridClass = $derived(() => {
    // Calculate preview dimensions (limited to a maximum)
    const previewCols = Math.min(columns, MAX_PREVIEW_CELLS);
    const previewRows = Math.min(rows, MAX_PREVIEW_CELLS);
    return `grid-cols-${previewCols} grid-rows-${previewRows}`;
  });
</script>

<div class="space-y-6">
  <div class="flex items-start gap-6">
    <!-- Column Controls -->
    <div class="flex-1 space-y-2">
      <Label class="text-sm font-medium">Columns</Label>
      <div class="flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          class="h-8 w-8 rounded-r-none" 
          on:click={() => setColumns(columns - 1)}
          disabled={columns <= 1}
        >
          <Minus class="h-3 w-3" />
        </Button>
        <Input 
          type="number" 
          value={columns} 
          on:change={(e) => setColumns(parseInt(e.currentTarget.value) || 1)} 
          class="h-8 rounded-none text-center w-12"
          min="1"
          max="20"
        />
        <Button 
          variant="outline" 
          size="icon" 
          class="h-8 w-8 rounded-l-none" 
          on:click={() => setColumns(columns + 1)}
          disabled={columns >= 20}
        >
          <Plus class="h-3 w-3" />
        </Button>
      </div>
    </div>
    
    <!-- Row Controls -->
    <div class="flex-1 space-y-2">
      <Label class="text-sm font-medium">Rows</Label>
      <div class="flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          class="h-8 w-8 rounded-r-none" 
          on:click={() => setRows(rows - 1)}
          disabled={rows <= 1}
        >
          <Minus class="h-3 w-3" />
        </Button>
        <Input 
          type="number" 
          value={rows} 
          on:change={(e) => setRows(parseInt(e.currentTarget.value) || 1)} 
          class="h-8 rounded-none text-center w-12"
          min="1"
          max="50"
        />
        <Button 
          variant="outline" 
          size="icon" 
          class="h-8 w-8 rounded-l-none" 
          on:click={() => setRows(rows + 1)}
          disabled={rows >= 50}
        >
          <Plus class="h-3 w-3" />
        </Button>
      </div>
    </div>
  </div>

  <!-- Table Preview -->
  <div class="border rounded-md p-2 bg-gray-50 dark:bg-gray-800 overflow-hidden">
    <Label class="text-xs text-gray-500 mb-2 block">Preview</Label>
    <div class="relative h-32 overflow-hidden">
      <div class={`grid gap-1 ${gridClass} absolute inset-0`}>
        {#each Array(Math.min(rows, MAX_PREVIEW_CELLS)) as _, rowIndex}
          {#each Array(Math.min(columns, MAX_PREVIEW_CELLS)) as _, colIndex}
            <div 
              class={cn(
                "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded",
                rowIndex === 0 && "bg-gray-100 dark:bg-gray-600"
              )}
            ></div>
          {/each}
        {/each}
      </div>
      
      {#if rows > MAX_PREVIEW_CELLS || columns > MAX_PREVIEW_CELLS}
        <div class="absolute bottom-0 right-0 bg-gray-200 dark:bg-gray-700 rounded-tl px-2 py-1 text-xs">
          Full size: {columns}×{rows}
        </div>
      {/if}
    </div>
  </div>

  <!-- Sizes -->
  <div class="flex gap-6">
    <!-- Column Width -->
    <div class="flex-1 space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-sm font-medium">Column Width</Label>
        <div class="text-xs text-gray-500 dark:text-gray-400">{columnWidth} in</div>
      </div>
      <div class="flex items-center gap-2">
        <GripHorizontal class="h-4 w-4 text-gray-500" />
        <input 
          type="range" 
          min="0.5" 
          max="8" 
          step="0.1" 
          value={columnWidth}
          on:input={handleColumnWidthChange}
          class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>
    </div>

    <!-- Row Height -->
    <div class="flex-1 space-y-2">
      <div class="flex items-center justify-between">
        <Label class="text-sm font-medium">Row Height</Label>
        <div class="text-xs text-gray-500 dark:text-gray-400">{rowHeight} in</div>
      </div>
      <div class="flex items-center gap-2">
        <GripVertical class="h-4 w-4 text-gray-500" />
        <input 
          type="range" 
          min="0.5" 
          max="4" 
          step="0.125" 
          value={rowHeight}
          on:input={handleRowHeightChange}
          class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>
    </div>
  </div>
</div>