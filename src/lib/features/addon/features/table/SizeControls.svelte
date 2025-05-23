<!-- src/lib/features/addon/features/table/SizeControls.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Loader2, Save } from "lucide-svelte";

  // Props
  const props = $props<{
    columns: number;
    rows: number;
    columnWidth: number;
    rowHeight: number;
    cellPadding: number;
    isProcessing: boolean;
    onColumnsChange: (value: number) => void;
    onRowsChange: (value: number) => void;
    onColumnWidthChange: (value: number) => void;
    onRowHeightChange: (value: number) => void;
    onCellPaddingChange: (value: number) => void;
    onApply: () => void;
  }>();

  // Input styles
  const inputClass = "w-16 h-8 px-2 text-center text-sm border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800";
  const labelClass = "text-xs font-medium text-neutral-600 dark:text-neutral-400";
</script>

<div class="space-y-4">
  <!-- Size Controls Header -->
  <h3 class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
    Table Size
  </h3>

  <!-- Grid Layout for Controls -->
  <div class="grid grid-cols-2 gap-4">
    <!-- Left Column: Dimensions -->
    <div class="space-y-3">
      <!-- Columns & Rows -->
      <div class="flex items-center justify-between">
        <label class={labelClass}>Columns</label>
        <input 
          type="number" 
          min="1" 
          max="10"
          value={props.columns}
          onchange={(e) => props.onColumnsChange(parseInt(e.target.value) || 1)}
          class={inputClass}
          disabled={props.isProcessing}
        />
      </div>
      
      <div class="flex items-center justify-between">
        <label class={labelClass}>Rows</label>
        <input 
          type="number" 
          min="1" 
          max="20"
          value={props.rows}
          onchange={(e) => props.onRowsChange(parseInt(e.target.value) || 1)}
          class={inputClass}
          disabled={props.isProcessing}
        />
      </div>
    </div>

    <!-- Right Column: Sizing -->
    <div class="space-y-3">
      <!-- Column Width -->
      <div class="flex items-center justify-between">
        <label class={labelClass}>Width</label>
        <div class="flex items-center gap-1">
          <input 
            type="number" 
            step="0.1" 
            min="0.5" 
            max="10"
            value={props.columnWidth}
            onchange={(e) => props.onColumnWidthChange(parseFloat(e.target.value) || 1)}
            class={inputClass}
            disabled={props.isProcessing}
          />
          <span class="text-xs text-neutral-500">in</span>
        </div>
      </div>
      
      <!-- Row Height -->
      <div class="flex items-center justify-between">
        <label class={labelClass}>Height</label>
        <div class="flex items-center gap-1">
          <input 
            type="number" 
            step="0.1" 
            min="0.1" 
            max="5"
            value={props.rowHeight}
            onchange={(e) => props.onRowHeightChange(parseFloat(e.target.value) || 0.1)}
            class={inputClass}
            disabled={props.isProcessing}
          />
          <span class="text-xs text-neutral-500">in</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Cell Padding (Full Width) -->
  <div class="flex items-center justify-between">
    <label class={labelClass}>Cell Padding</label>
    <div class="flex items-center gap-1">
      <input 
        type="number" 
        step="0.01" 
        min="0" 
        max="1"
        value={props.cellPadding}
        onchange={(e) => props.onCellPaddingChange(parseFloat(e.target.value) || 0)}
        class={inputClass}
        disabled={props.isProcessing}
      />
      <span class="text-xs text-neutral-500">in</span>
    </div>
  </div>

  <!-- Apply Button -->
  <div class="pt-2 border-t border-neutral-200 dark:border-neutral-700">
    <Button 
      variant="default" 
      class="w-full flex items-center justify-center gap-2"
      onclick={props.onApply}
      disabled={props.isProcessing}
    >
      {#if props.isProcessing}
        <Loader2 class="h-4 w-4 animate-spin" />
        <span>Applying...</span>
      {:else}
        <Save class="h-4 w-4" />
        <span>Apply Changes</span>
      {/if}
    </Button>
  </div>

  <!-- Helper Text -->
  <div class="text-xs text-neutral-500 dark:text-neutral-400 text-center">
    Place cursor in table cell before applying
  </div>
</div>