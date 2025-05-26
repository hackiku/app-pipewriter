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

  // Only cell padding control - default to 0.00 inches
  let cellPadding = $state(0.00);

  // Handle alignment changes - no status updates, just local state
  function handleAlignmentChange(type: 'table' | 'cell', value: string) {
    if (type === 'table') {
      tableAlignment = value as 'left' | 'center' | 'right';
    } else {
      cellAlignment = value as 'top' | 'middle' | 'bottom';
    }
  }

  // Handle apply changes - only trigger status here
  async function handleApply() {
    if (isProcessing) return;

    isProcessing = true;
    props.onProcessingStart?.();
    props.onStatusUpdate?.({
      type: 'processing',
      message: 'Applying table properties...'
    });

    try {
      // Apply both alignment and padding properties
      const alignmentResponse = await setTableAlignment(tableAlignment, props.onStatusUpdate);
      const cellAlignResponse = await setCellAlignment(cellAlignment, props.onStatusUpdate);
      const paddingResponse = await setTableProperties({
        cellPadding
      }, props.onStatusUpdate);

      if (!alignmentResponse.success || !cellAlignResponse.success || !paddingResponse.success) {
        throw new Error('Failed to apply table properties');
      }

      props.onStatusUpdate?.({
        type: 'success',
        message: 'Table properties applied successfully'
      });

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
  <!-- Row 1: Interactive Table + Alignment Controls (2-column grid) -->
  <div class="grid grid-cols-2 gap-4">
    <!-- Left: Interactive Table Preview -->
    <div>
      <InteractiveTable 
        {tableAlignment} 
        {cellAlignment}
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

  <!-- Row 2: Size Controls (matching 2-column layout) -->
  <div>
    <SizeControls
      {cellPadding}
      {isProcessing}
      onCellPaddingChange={(value) => cellPadding = value}
      onApply={handleApply}
    />
  </div>
</div>