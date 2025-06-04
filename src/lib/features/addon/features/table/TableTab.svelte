<!-- src/lib/features/addon/features/table/TableTab.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Save, Loader2, RotateCcw } from '@lucide/svelte';
	import InteractiveTable from './InteractiveTable.svelte';
	import AlignmentButtonGrid from './AlignmentButtonGrid.svelte';
	import PaddingControls from './PaddingControls.svelte';
	import ColorControls from './ColorControls.svelte';
	import BorderControls from './BorderControls.svelte';
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

	// State - all table properties
	let cellAlignment = $state<'top' | 'middle' | 'bottom'>('middle');
	let scope = $state<'cell' | 'table'>('table');
	let cellPadding = $state(0); // in points
	let borderWidth = $state(0); // in pixels
	let borderColor = $state('#000000');
	let backgroundColor = $state('');
	let isProcessing = $state(false);

	// Default state for reset
	const defaultState = {
		cellAlignment: 'middle' as const,
		scope: 'table' as const,
		cellPadding: 0,
		borderWidth: 0,
		borderColor: '#000000',
		backgroundColor: ''
	};

	// Derived state for summary
	let hasChanges = $derived(
		cellAlignment !== defaultState.cellAlignment ||
			cellPadding !== defaultState.cellPadding ||
			borderWidth !== defaultState.borderWidth ||
			backgroundColor !== defaultState.backgroundColor
	);

	let changesSummary = $derived(() => {
		const changes = [];
		if (cellAlignment !== defaultState.cellAlignment) changes.push(`${cellAlignment} align`);
		if (cellPadding > 0) changes.push(`${cellPadding}pt padding`);
		if (borderWidth > 0) changes.push(`${borderWidth}pt border`);
		if (backgroundColor) changes.push('background');
		return changes.length > 0 ? changes.join(', ') : 'No changes';
	});

	// Event handlers
	function handleAlignmentChange(value: string) {
		cellAlignment = value as 'top' | 'middle' | 'bottom';
	}

	function handleScopeToggle() {
		scope = scope === 'cell' ? 'table' : 'cell';
	}

	function handlePaddingChange(points: number) {
		cellPadding = points;
	}

	function handleColorChange(color: string) {
		backgroundColor = color;
	}

	function handleBorderChange(width: number, color: string = '#000000') {
		borderWidth = width;
		borderColor = color;
	}

	function handleReset() {
		cellAlignment = defaultState.cellAlignment;
		scope = defaultState.scope;
		cellPadding = defaultState.cellPadding;
		borderWidth = defaultState.borderWidth;
		borderColor = defaultState.borderColor;
		backgroundColor = defaultState.backgroundColor;
	}

	// Main apply function
	async function handleApply() {
		if (isProcessing || !hasChanges) return;

		isProcessing = true;
		props.onProcessingStart?.();
		props.onStatusUpdate?.({
			type: 'processing',
			message: 'Applying table settings...'
		});

		try {
			const client = getGoogleService();
			const operations = [];

			// Apply cell content alignment if changed
			if (cellAlignment !== defaultState.cellAlignment) {
				const alignmentResponse = await client.sendMessage(
					'tableOps',
					{
						action: 'setCellAlignment',
						scope: scope,
						alignment: cellAlignment
					},
					props.onStatusUpdate
				);
				operations.push({ name: 'alignment', success: alignmentResponse.success });
			}

			// Apply cell padding if changed
			if (cellPadding !== defaultState.cellPadding) {
				const paddingResponse = await client.sendMessage(
					'tableOps',
					{
						action: 'setCellPadding',
						scope: scope,
						padding: cellPadding
					},
					props.onStatusUpdate
				);
				operations.push({ name: 'padding', success: paddingResponse.success });
			}

			// Apply borders if changed
			if (borderWidth !== defaultState.borderWidth) {
				const borderResponse = await client.sendMessage(
					'tableOps',
					{
						action: 'setBorders',
						scope: 'table', // borders are always table-wide
						borderWidth: borderWidth,
						borderColor: borderColor
					},
					props.onStatusUpdate
				);
				operations.push({ name: 'borders', success: borderResponse.success });
			}

			// Apply background color if changed
			if (backgroundColor !== defaultState.backgroundColor) {
				const backgroundResponse = await client.sendMessage(
					'tableOps',
					{
						action: 'setCellBackground',
						scope: scope,
						backgroundColor: backgroundColor || null
					},
					props.onStatusUpdate
				);
				operations.push({ name: 'background', success: backgroundResponse.success });
			}

			// Check if all operations succeeded
			const failedOps = operations.filter((op) => !op.success);
			if (failedOps.length > 0) {
				throw new Error(`Failed operations: ${failedOps.map((op) => op.name).join(', ')}`);
			}

			props.onStatusUpdate?.({
				type: 'success',
				message: `Applied ${operations.length} table changes`,
				details: changesSummary
			});
		} catch (error) {
			console.error('Apply error:', error);
			props.onStatusUpdate?.({
				type: 'error',
				message: 'Failed to apply table settings',
				error
			});
		} finally {
			isProcessing = false;
			props.onProcessingEnd?.();
		}
	}
</script>

<div class="flex w-full flex-col gap-3">
	<!-- Row 1: Preview + Alignment Controls -->
	<div class="grid grid-cols-2 gap-3">
		<!-- Left: Interactive Table Preview -->
		<div class="space-y-2">
			<InteractiveTable
				{cellAlignment}
				{scope}
				{borderWidth}
				{borderColor}
				{backgroundColor}
				{cellPadding}
			/>
		</div>

		<!-- Right: Alignment + Scope Controls -->
		<div class="space-y-2">
			<AlignmentButtonGrid
				{cellAlignment}
				{scope}
				{isProcessing}
				onAlignmentChange={handleAlignmentChange}
				onScopeToggle={handleScopeToggle}
			/>

			<hr>

			<PaddingControls 
				{cellPadding}
				{isProcessing}
				onPaddingChange={handlePaddingChange}
			/>
		</div>
	</div>

	<!-- Row 2: Padding Controls -->
	<!-- <PaddingControls {cellPadding} {isProcessing} onPaddingChange={handlePaddingChange} /> -->

	<!-- Row 3: Border Controls -->
	<BorderControls {borderWidth} {borderColor} {isProcessing} onBorderChange={handleBorderChange} />

	<!-- Row 4: Color Controls -->
	<ColorControls {backgroundColor} {isProcessing} onColorChange={handleColorChange} />

	<!-- Row 5: Action Buttons + Summary -->
	<div class="flex items-center gap-2">
		<!-- Left: Reset + Apply buttons -->
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				class="h-8 w-8"
				onclick={handleReset}
				disabled={isProcessing || !hasChanges}
				title="Reset to defaults"
			>
				<RotateCcw class="h-3 w-3" />
			</Button>

			<Button
				variant="default"
				class="flex h-8 items-center gap-1.5 px-3 text-xs"
				onclick={handleApply}
				disabled={isProcessing || !hasChanges}
			>
				{#if isProcessing}
					<Loader2 class="h-3 w-3 animate-spin" />
					<span>Applying...</span>
				{:else}
					<Save class="h-3 w-3" />
					<span>Apply</span>
				{/if}
			</Button>
		</div>

		<!-- Right: Changes Summary -->
		<!-- <div class="flex-1 text-right">
      <div class="text-[0.6rem] text-muted-foreground">
        {changesSummary}
      </div>
      {#if scope === 'cell'}
        <div class="text-[0.55rem] text-muted-foreground/70">
          to selected cell
        </div>
      {/if}
    </div> -->
	</div>
</div>
