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

	// FIXED: Main apply function - ALWAYS allow applying current state
	async function handleApply() {
		if (isProcessing) return;

		isProcessing = true;
		props.onProcessingStart?.();
		props.onStatusUpdate?.({
			type: 'processing',
			message: 'Applying table settings...'
		});

		try {
			const client = getGoogleService();
			const operations = [];

			// ALWAYS apply current alignment (even if it matches default)
			console.log('Sending alignment:', {
				action: 'setCellAlignment',
				scope,
				alignment: cellAlignment
			});
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

			// ALWAYS apply current padding
			const paddingValue = Number(cellPadding);
			if (!isNaN(paddingValue) && paddingValue >= 0) {
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

			// ALWAYS apply current borders
			const borderWidthValue = Number(borderWidth);
			if (!isNaN(borderWidthValue) && borderWidthValue >= 0) {
				const borderColorValue = borderColor || '#000000';
				console.log('Sending borders:', {
					action: 'setBorders',
					scope: 'table',
					borderWidth: borderWidthValue,
					borderColor: borderColorValue
				});
				const borderResponse = await client.sendMessage(
					'tableOps',
					{
						action: 'setBorders',
						scope: 'table',
						borderWidth: borderWidthValue,
						borderColor: borderColorValue
					},
					props.onStatusUpdate
				);
				operations.push({ name: 'borders', success: borderResponse.success });
			}

			// ALWAYS apply current background (if specified)
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
				message: `Applied ${operations.length} table settings`,
				details: `Applied current UI state to table`
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
<div class="space-y-4">
	<div class="flex h-full w-full flex-col gap-3">
		<!-- Row 1: Preview + Controls - ENHANCED GRID STRETCHING -->
		<div class="grid flex-1 grid-cols-2 gap-3" style="min-height: 120px;">
			<!-- Left: Interactive Table Preview + Scope Toggle -->
			<div class="flex flex-col justify-between gap-2 h-full">
				<!-- Table preview - ENHANCED: grows to fill more space -->
				<div class="flex flex-1 items-center justify-center" style="min-height: 80px;">
					<InteractiveTable
						{cellAlignment}
						{scope}
						{borderWidth}
						{borderColor}
						{backgroundColor}
						{cellPadding}
					/>
				</div>

				<!-- MOVED FROM CHILD: Scope Toggle - positioned at bottom -->
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

			<!-- Right: Alignment + Padding Controls - STRETCHED to align with left -->
			<div class="flex h-full flex-col justify-between gap-2">
				<AlignmentButtonGrid
					{cellAlignment}
					{scope}
					{isProcessing}
					onAlignmentChange={handleAlignmentChange}
					onScopeToggle={handleScopeToggle}
				/>

				<hr class="border-border" />

				<!-- ENHANCED: PaddingControls fills remaining space and aligns with scope toggle -->
				<div class="flex-1 flex flex-col justify-end">
					<PaddingControls {cellPadding} {isProcessing} onPaddingChange={handlePaddingChange} />
				</div>
			</div>
		</div>
	</div>

	<!-- Enhanced ColorControls with color picker -->
	<ColorControls {backgroundColor} {isProcessing} onColorChange={handleColorChange} />

	<!-- Actions Row with BorderControls combobox -->
	<div class="flex items-center gap-2">
		<div class="flex-1">
			<BorderControls
				{borderWidth}
				{borderColor}
				{isProcessing}
				onBorderChange={handleBorderChange}
			/>
		</div>

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
			disabled={isProcessing}
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
</div>