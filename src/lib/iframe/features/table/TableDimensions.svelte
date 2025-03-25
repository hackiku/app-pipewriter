<!-- src/lib/iframe/features/table/TableDimensions.svelte -->
<script lang="ts">
  import { Plus, Minus, GripHorizontal, GripVertical } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { cn } from "$lib/utils";
  
  // Props using Svelte 5 runes
  const props = $props<{
    values: {
      columns: number;
      rows: number;
      columnWidth: number;
      rowHeight: number;
    };
    onUpdate: (values: any) => void;
  }>();

  // Local state - using $state for local component state
  let localValues = $state({
    columns: props.values.columns,
    rows: props.values.rows,
    columnWidth: props.values.columnWidth,
    rowHeight: props.values.rowHeight
  });
  
  // Update local state when props change
  $effect(() => {
    localValues = {
      columns: props.values.columns,
      rows: props.values.rows,
      columnWidth: props.values.columnWidth,
      rowHeight: props.values.rowHeight
    };
  });

  // Handle input changes and notify parent
  function setColumns(value: number) {
    value = Math.max(1, Math.min(10, value)); // Limit between 1-10
    localValues.columns = value;
    notifyParent();
  }

  function setRows(value: number) {
    value = Math.max(1, Math.min(20, value)); // Limit between 1-20
    localValues.rows = value;
    notifyParent();
  }

  function setColumnWidth(value: number) {
    value = Math.max(0.5, Math.min(8, value)); // Limit between 0.5-8
    localValues.columnWidth = value;
    notifyParent();
  }

  function setRowHeight(value: number) {
    value = Math.max(0.25, Math.min(3, value)); // Limit between 0.25-3
    localValues.rowHeight = value;
    notifyParent();
  }

  // Notify parent of changes - one-way data flow to prevent infinite loops
  function notifyParent() {
    props.onUpdate(localValues);
  }
  
  // Handle number input changes - directly from input elements
  function handleColumnsInput(event) {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setColumns(value);
    }
  }
  
  function handleRowsInput(event) {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setRows(value);
    }
  }
  
  // Handle range inputs
  function handleColumnWidthInput(event) {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setColumnWidth(value);
    }
  }
  
  function handleRowHeightInput(event) {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setRowHeight(value);
    }
  }
</script>

<div>
  <!-- 50/50 2-column layout -->
  <div class="grid grid-cols-2 gap-6">
    <!-- Left column: Column/Row Count Controls -->
    <div class="space-y-4">
      <!-- Columns Control -->
      <div class="space-y-1">
        <div class="text-xs text-neutral-500 dark:text-neutral-400">Columns</div>
        <div class="flex items-center">
          <Button 
            variant="outline" 
            class="h-8 w-8 rounded-r-none p-0 flex items-center justify-center" 
            onclick={() => setColumns(localValues.columns - 1)}
            disabled={localValues.columns <= 1}
          >
            <Minus class="h-3 w-3" />
          </Button>
          <Input 
            type="number" 
            value={localValues.columns} 
            oninput={handleColumnsInput}
            class="h-8 rounded-none text-center w-14 px-1"
            min="1"
            max="10"
          />
          <Button 
            variant="outline" 
            class="h-8 w-8 rounded-l-none p-0 flex items-center justify-center" 
            onclick={() => setColumns(localValues.columns + 1)}
            disabled={localValues.columns >= 10}
          >
            <Plus class="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <!-- Rows Control -->
      <div class="space-y-1">
        <div class="text-xs text-neutral-500 dark:text-neutral-400">Rows</div>
        <div class="flex items-center">
          <Button 
            variant="outline" 
            class="h-8 w-8 rounded-r-none p-0 flex items-center justify-center" 
            onclick={() => setRows(localValues.rows - 1)}
            disabled={localValues.rows <= 1}
          >
            <Minus class="h-3 w-3" />
          </Button>
          <Input 
            type="number" 
            value={localValues.rows} 
            oninput={handleRowsInput}
            class="h-8 rounded-none text-center w-14 px-1"
            min="1"
            max="20"
          />
          <Button 
            variant="outline" 
            class="h-8 w-8 rounded-l-none p-0 flex items-center justify-center" 
            onclick={() => setRows(localValues.rows + 1)}
            disabled={localValues.rows >= 20}
          >
            <Plus class="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Right column: Width/Height Controls -->
    <div class="space-y-4">
      <!-- Column Width Slider -->
      <div class="space-y-1">
        <div class="flex justify-between">
          <div class="text-xs text-neutral-500 dark:text-neutral-400">Column Width</div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400">{localValues.columnWidth.toFixed(1)} in</div>
        </div>
        <div class="flex items-center gap-2">
          <GripHorizontal class="h-4 w-4 text-neutral-500" />
          <input 
            type="range" 
            min="0.5" 
            max="8" 
            step="0.1" 
            value={localValues.columnWidth}
            oninput={handleColumnWidthInput}
            class="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
          />
        </div>
      </div>
      
      <!-- Row Height Slider -->
      <div class="space-y-1">
        <div class="flex justify-between">
          <div class="text-xs text-neutral-500 dark:text-neutral-400">Row Height</div>
          <div class="text-xs text-neutral-500 dark:text-neutral-400">{localValues.rowHeight.toFixed(2)} in</div>
        </div>
        <div class="flex items-center gap-2">
          <GripVertical class="h-4 w-4 text-neutral-500" />
          <input 
            type="range" 
            min="0.25" 
            max="3" 
            step="0.05" 
            value={localValues.rowHeight}
            oninput={handleRowHeightInput}
            class="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
          />
        </div>
      </div>
    </div>
  </div>
</div>