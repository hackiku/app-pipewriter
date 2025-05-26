<!-- src/lib/features/addon/features/table/TableTab.svelte -->

<script lang="ts">
  import InteractiveTable from './InteractiveTable.svelte';
  import AlignmentButtonGrid from './AlignmentButtonGrid.svelte';
  import SizeControls from './SizeControls.svelte';
  import { getGoogleService } from '$lib/services/google/client';

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

  // Scope selection (cell vs table)
  let scope = $state<'cell' | 'table'>('table');

  // Cell padding in points (converted from inches)
  let cellPadding = $state(0); // 0 points = no padding

  // Handle alignment changes - just update local state (no API calls)
  function handleAlignmentChange(type: 'table' | 'cell', value: string) {
    if (type === 'table') {
      tableAlignment = value as 'left' | 'center' | 'right';
    } else {
      cellAlignment = value as 'top' | 'middle' | 'bottom';
    }
  }

  // Handle scope change
  function toggleScope() {
    scope = scope === 'cell' ? 'table' : 'cell';
  }

  // Convert inches to points for padding input
  function inchesToPoints(inches: number): number {
    return Math.round(inches * 72); // 1 inch = 72 points
  }

  // Handle cell padding change (convert inches to points)
  function handlePaddingChange(inches: number) {
    cellPadding = inchesToPoints(inches);
  }

  // Main apply function - sends all settings to backend
  async function handleApply() {
    if (isProcessing) return;

    isProcessing = true;
    props.onProcessingStart?.();
    props.onStatusUpdate?.({
      type: 'processing',
      message: 'Applying table properties...'
    });

    try {
      const client = getGoogleService();
      
      // Apply table positioning (with limitations noted)
      const positionResponse = await client.sendMessage('tableOps', {
        action: 'setTablePosition',
        alignment: tableAlignment
      }, props.onStatusUpdate);

      // Apply cell content alignment  
      const alignmentResponse = await client.sendMessage('tableOps', {
        action: 'setCellAlignment',
        scope: scope,
        alignment: cellAlignment
      }, props.onStatusUpdate);

      // Apply cell padding
      const paddingResponse = await client.sendMessage('tableOps', {
        action: 'setCellPadding',
        scope: scope,
        padding: cellPadding
      }, props.onStatusUpdate);

      // Check if all operations succeeded
      if (!positionResponse.success || !alignmentResponse.success || !paddingResponse.success) {
        throw new Error('Some table operations failed');
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
  <!-- Row 1: Interactive Table + Alignment Controls -->
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

  <!-- Row 2: Scope Selector + Controls -->
  <div class="space-y-3">
    <!-- Scope Toggle -->
    <div class="flex items-center justify-center">
      <button
        class="flex items-center gap-2 px-3 py-1.5 text-xs border border-border rounded-md hover:bg-accent transition-colors"
        onclick={toggleScope}
        disabled={isProcessing}
      >
        <span class="font-medium">Apply to:</span>
        <span class={scope === 'table' ? 'text-primary font-semibold' : 'text-muted-foreground'}>
          {scope === 'table' ? '📋 Whole Table' : '🎯 Selected Cell'}
        </span>
        <span class="text-xs opacity-60">(click to toggle)</span>
      </button>
    </div>

    <!-- Size Controls -->
    <SizeControls
      {cellPadding}
      {isProcessing}
      onCellPaddingChange={handlePaddingChange}
      onApply={handleApply}
    />
  </div>

  <!-- Info Text -->
  <div class="text-xs text-center text-muted-foreground space-y-1">
    <p>Place cursor in table cell before applying</p>
    {#if scope === 'cell'}
      <p class="text-orange-600 dark:text-orange-400">⚡ Will apply to selected cell only</p>
    {:else}
      <p class="text-blue-600 dark:text-blue-400">🌐 Will apply to entire table</p>
    {/if}
  </div>
</div>