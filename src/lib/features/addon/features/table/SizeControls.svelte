<!-- src/lib/features/addon/features/table/SizeControls.svelte -->

<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Loader2, Save } from "@lucide/svelte";

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
  const inputClass = "w-16 h-8 px-2 text-center text-xs border border-neutral-300 dark:border-neutral-700 rounded bg-background";
  const labelClass = "text-[0.6em] font-medium text-muted-foreground";
</script>

<div class="space-y-4">
  <!-- Size Controls Header -->
  <!-- <h3 class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
    Table Size
  </h3> -->

  <!-- Cell Padding (Full Width) -->
  <div class="flex items-center justify-between">
    <label class={labelClass}>Cell <br> Padding</label>
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

		<Button 
			variant="default" 
			class="text-xs _w-full flex items-center justify-center gap-2"
			onclick={props.onApply}
			disabled={props.isProcessing}
		>
			{#if props.isProcessing}
				<Loader2 class="h-4 w-4 animate-spin" />
				<span>Applying...</span>
			{:else}
				<Save class="h-4 w-4" />
				<span>Apply</span>
			{/if}
		</Button>
  </div>

  <!-- Apply Button -->
  <div class="pt-2 border-t border-neutral-200 dark:border-neutral-700">
  </div>

  <!-- Helper Text -->
  <div class="text-xs text-neutral-500 dark:text-neutral-400 text-center">
    Place cursor in table cell before applying
  </div>
</div>