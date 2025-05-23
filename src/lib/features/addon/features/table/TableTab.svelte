<!-- src/lib/features/addon/features/table/TableTab.svelte -->
<script lang="ts">
  import InteractiveTable from './InteractiveTable.svelte';
  import AlignmentButtonGrid from './AlignmentButtonGrid.svelte';
  import SizeControls from './SizeControls.svelte';
  import { setTableAlignment, setCellAlignment, setTableProperties } from '$lib/services/google/table';

  // Props
  const props = $props<{
    context?: any;
    onStatusUpdate?: (status: {
      type: 'processing' | 'success' | 'error';
      message: string;
      details?: string;
      executionTime?: number;
      error?: any;
    }) => void;
    onProcessingStart?: () => void;
    onProcessingEnd?: () => void;
  }>();

  // Internal state - no external context needed
  let tableAlignment = $state<'left' | 'center' | 'right'>('center');
  let cellAlignment = $state<'top' | 'middle' | 'bottom'>('middle');
  let isProcessing = $state(false);

  // Size state
  let columns = $state(2);
  let rows = $state(2);
  let columnWidth = $state(2.5);
  let rowHeight = $state(0.75);
  let cellPadding = $state(0.08);

  // Handle alignment changes
  async function handleAlignmentChange(type: 'table' | 'cell', value: string) {
    if (isProcessing) return;

    isProcessing = true;
    props.onProcessingStart?.();

    const message = type === 'table' ? `Aligning table ${value}...` : `Aligning cell content ${value}...`;

    props.onStatusUpdate?.({
      type: 'processing',
      message
    });

    try {
      let response;
      
      if (type === 'table') {
        response = await setTableAlignment(value as 'left' | 'center' | 'right', props.onStatusUpdate);
        if (response.success) {
          tableAlignment = value as 'left' | 'center' | 'right';
        }
      } else {
        response = await setCellAlignment(value as 'top' | 'middle' | 'bottom', props.onStatusUpdate);
        if (response.success) {
          cellAlignment = value as 'top' | 'middle' | 'bottom';
        }
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to apply alignment');
      }

    } catch (error) {
      console.error('Alignment error:', error);
      props.onStatusUpdate?.({
        type: 'error',
        message: `Failed to ${type === 'table' ? 'align table' : 'align cell content'}`,
        error
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd?.();
    }
  }

  // Handle apply changes
  async function handleApply() {
    if (isProcessing) return;

    isProcessing = true;
    props.onProcessingStart?.();
    props.onStatusUpdate?.({
      type: 'processing',
      message: 'Applying table changes...'
    });

    try {
      const response = await setTableProperties({
        columns,
        rows,
        columnWidth,
        rowHeight,
        cellPadding
      }, props.onStatusUpdate);

      if (!response.success) {
        throw new Error(response.error || 'Failed to apply table properties');
      }

    } catch (error) {
      console.error('Apply error:', error);
      props.onStatusUpdate?.({
        type: 'error',
        message: 'Failed to apply table properties',
        error
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd?.();
    }
  }
</script>

<div class="flex flex-col w-full gap-4">
  <!-- Row 1: Interactive Table + Alignment Controls (50/50 split) -->
  <div class="grid grid-cols-2 gap-4">
    <!-- Left: Interactive Table Preview -->
    <div>
      <InteractiveTable 
        {tableAlignment} 
        {cellAlignment}
        {columns}
        {rows}
      />
    </div>
    
    <!-- Right: Alignment Button Grid -->
    <div>
      <AlignmentButtonGrid
        {tableAlignment}
        {cellAlignment}
        {isProcessing}
        onAlignmentChange={handleAlignmentChange}
      />
    </div>
  </div>

  <!-- Row 2: Size Controls -->
  <div>
    <SizeControls
      {columns}
      {rows}
      {columnWidth}
      {rowHeight}
      {cellPadding}
      {isProcessing}
      onColumnsChange={(value) => columns = value}
      onRowsChange={(value) => rows = value}
      onColumnWidthChange={(value) => columnWidth = value}
      onRowHeightChange={(value) => rowHeight = value}
      onCellPaddingChange={(value) => cellPadding = value}
      onApply={handleApply}
    />
  </div>
</div>