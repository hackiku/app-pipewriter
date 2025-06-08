<!-- src/lib/features/addon/features/table/TableTab.svelte - MODERNIZED -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Save, Loader2, RotateCcw, Table, Focus } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import InteractiveTable from './InteractiveTable.svelte';
	import AlignmentButtonGrid from './AlignmentButtonGrid.svelte';
	import PaddingControls from './PaddingControls.svelte';
	import ColorControls from './ColorControls.svelte';
	import BorderControls from './BorderControls.svelte';
	import UpgradeDrawer from '$lib/components/pricing/UpgradeDrawer.svelte';
	import { getGoogleService } from '$lib/services/google/client';
	import type { SerializedUserAccess } from '$lib/utils/access-control';

	// MODERNIZED: Props now receive userAccess instead of legacy features
	const props = $props<{
		context?: any;
		userAccess?: SerializedUserAccess; // CHANGED: From features to userAccess
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
	let showUpgradeDrawer = $state(false);

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

	// Handle upgrade drawer
	function handleUpgradeDrawerChange(open: boolean) {
		showUpgradeDrawer = open;
	}

	function handleOpenUpgrade() {
		showUpgradeDrawer = true;
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

	// Apply function - table operations with proper scope handling
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

			// Apply alignment with current scope
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

			// Apply padding with current scope
			const paddingValue = Number(cellPadding);
			if (!isNaN(paddingValue) && paddingValue >= 0) {
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

			// Apply borders always with table scope (API limitation)
			const borderWidthValue = Number(borderWidth);
			if (!isNaN(borderWidthValue) && borderWidthValue >= 0) {
				const borderColorValue = borderColor || '#000000';
				const borderResponse = await client.sendMessage(
					'tableOps',
					{
						action: 'setBorders',
						scope: 'table', // ALWAYS table scope for borders
						borderWidth: borderWidthValue,
						borderColor: borderColorValue
					},
					props.onStatusUpdate
				);
				operations.push({ name: 'borders', success: borderResponse.success });
			}

			// Apply background with current scope
			if (backgroundColor) {
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

	function getScopeToggleClass() {
		return cn(
			'w-full flex items-center justify-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs transition-colors hover:bg-accent',
			scope === 'table' ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
		);
	}
</script>

<div class="space-y-3">
	<div class="flex h-full w-full flex-col gap-3">
		<!-- Row 1: Preview + Controls -->
		<div class="grid flex-1 grid-cols-2 gap-3" style="min-height: 120px;">
			<!-- Left: Interactive Table Preview + Scope Toggle -->
			<div class="flex flex-col justify-between gap-2 h-full">
				<!-- Table preview -->
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

				<!-- Scope toggle -->
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

			<!-- Right: Alignment + Padding Controls -->
			<div class="flex h-full flex-col justify-between gap-2">
				<AlignmentButtonGrid
					{cellAlignment}
					{scope}
					{isProcessing}
					onAlignmentChange={handleAlignmentChange}
					onScopeToggle={handleScopeToggle}
				/>

				<div class="flex-1 flex flex-col justify-end">
					<PaddingControls {cellPadding} {isProcessing} onPaddingChange={handlePaddingChange} />
				</div>
			</div>
		</div>
	</div>

	<hr/>
	
	<!-- MODERNIZED: ColorControls now receives userAccess instead of features -->
	<ColorControls 
		{backgroundColor} 
		{isProcessing} 
		userAccess={props.userAccess}
		onColorChange={handleColorChange}
		onOpenUpgrade={handleOpenUpgrade}
	/>
	
	<hr class="border-border" />
	
	<!-- Border controls and action buttons -->
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

	<!-- Upgrade Drawer -->
	<UpgradeDrawer isOpen={showUpgradeDrawer} onOpenChange={handleUpgradeDrawerChange} />
</div>