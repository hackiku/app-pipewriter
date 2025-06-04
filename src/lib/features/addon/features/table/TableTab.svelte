<!-- src/lib/features/addon/features/table/TableTab.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Save, Loader2, RotateCcw, Table, Focus } from '@lucide/svelte';
	import { cn } from '$lib/utils';
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

	// MOVED FROM CHILD: Scope toggle handler
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

	// FIXED: Main apply function with proper parameter validation
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

			// FIXED: Apply cell content alignment if changed
			if (cellAlignment !== defaultState.cellAlignment) {
				console.log('Sending alignment:', { action: 'setCellAlignment', scope, alignment: cellAlignment });
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

			// FIXED: Apply cell padding if changed - ONLY IF ACTUALLY DIFFERENT
			if (cellPadding !== defaultState.cellPadding) {
				const paddingValue = Number(cellPadding); // Ensure it's a number
				if (!isNaN(paddingValue) && paddingValue >= 0) { // Only send if valid
					console.log('Sending padding:', { action: 'setCellPadding', scope, padding: paddingValue });
					const paddingResponse = await client.sendMessage(
						'tableOps',
						{
							action: 'setCellPadding',
							scope: scope,
							padding: paddingValue
						},
						props.onStatusUpdate
					);
					operations.push({ name: 'padding', success: paddingResponse.success });
				}
			}

			// FIXED: Apply borders if changed - ONLY IF ACTUALLY DIFFERENT  
			if (borderWidth !== defaultState.borderWidth) {
				const borderWidthValue = Number(borderWidth);
				if (!isNaN(borderWidthValue) && borderWidthValue >= 0) { // Only send if valid
					const borderColorValue = borderColor || '#000000';
					console.log('Sending borders:', { action: 'setBorders', scope: 'table', borderWidth: borderWidthValue, borderColor: borderColorValue });
					const borderResponse = await client.sendMessage(
						'tableOps',
						{
							action: 'setBorders',
							scope: 'table', // borders are always table-wide per Google Apps Script
							borderWidth: borderWidthValue,
							borderColor: borderColorValue
						},
						props.onStatusUpdate
					);
					operations.push({ name: 'borders', success: borderResponse.success });
				}
			}

			// FIXED: Apply background color if changed - ONLY SEND IF NOT EMPTY
			if (backgroundColor !== defaultState.backgroundColor) {
				// Only send background change if there's actually a color (don't send empty string)
				if (backgroundColor) {
					console.log('Sending background:', { action: 'setCellBackground', scope, backgroundColor });
					const backgroundResponse = await client.sendMessage(
						'tableOps',
						{
							action: 'setCellBackground',
							scope: scope,
							backgroundColor: backgroundColor
						},
						props.onStatusUpdate
					);
					operations.push({ name: 'background', success: backgroundResponse.success });
				}
			}

			// Check if all operations succeeded
			if (operations.length === 0) {
				props.onStatusUpdate?.({
					type: 'success',
					message: 'No valid changes to apply',
					details: 'All values are at their defaults or invalid'
				});
				return;
			}

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

	// Get scope toggle class
	function getScopeToggleClass() {
		return cn(
			'flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs transition-colors hover:bg-accent',
			scope === 'table' ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
		);
	}
</script>

<!-- ENHANCED: Better grid layout with stretched spacing -->
<div class="flex w-full flex-col gap-3 h-full">
	<!-- Row 1: Preview + Controls - ENHANCED GRID STRETCHING -->
	<div class="grid grid-cols-2 gap-3 flex-1">
		<!-- Left: Interactive Table Preview + Scope Toggle -->
		<div class="flex flex-col gap-2 justify-between">
			<!-- Table preview - grows to fill space -->
			<div class="flex-1 flex items-center justify-center">
				<InteractiveTable
					{cellAlignment}
					{scope}
					{borderWidth}
					{borderColor}
					{backgroundColor}
					{cellPadding}
				/>
			</div>
			
			<!-- MOVED FROM CHILD: Scope Toggle -->
			<div class="flex items-center justify-center">
				<button
					class={getScopeToggleClass()}
					onclick={handleScopeToggle}
					disabled={isProcessing}
					title={`Currently applying to ${scope}. Click to toggle.`}
				>
					{#if scope === 'table'}
						<Table class="h-3 w-3" />
						<span class="font-medium text-primary">Whole Table</span>
					{:else}
						<Focus class="h-3 w-3" />
						<span class="font-medium">Selected Cell</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Right: Alignment + Padding Controls - STRETCHED -->
		<div class="flex flex-col gap-2 justify-between h-full">
			<AlignmentButtonGrid
				{cellAlignment}
				{scope}
				{isProcessing}
				onAlignmentChange={handleAlignmentChange}
				onScopeToggle={handleScopeToggle}
			/>

			<hr class="border-border">

			<!-- ENHANCED: PaddingControls fills remaining space -->
			<div class="flex-1">
				<PaddingControls 
					{cellPadding}
					{isProcessing}
					onPaddingChange={handlePaddingChange}
				/>
			</div>
		</div>
	</div>

	<!-- Row 2: Border Controls -->
	<BorderControls {borderWidth} {borderColor} {isProcessing} onBorderChange={handleBorderChange} />

	<!-- Row 3: Color Controls -->
	<ColorControls {backgroundColor} {isProcessing} onColorChange={handleColorChange} />

	<!-- Row 4: Action Buttons -->
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

		<!-- Changes summary - as requested, keep commented parts commented -->
		<!-- {#if changesSummary && !isProcessing}
			<span class="text-[0.6rem] text-muted-foreground ml-auto text-right leading-tight">
				{changesSummary}
			</span>
		{/if} -->
	</div>
</div>