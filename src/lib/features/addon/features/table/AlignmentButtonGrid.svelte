<!-- src/lib/features/addon/features/table/AlignmentButtonGrid.svelte -->
<script lang="ts">
	import { cn } from '$lib/utils';
	import {
		AlignStartHorizontal,
		AlignCenterHorizontal,
		AlignEndHorizontal,
		Loader2
	} from '@lucide/svelte';

	// Props - REMOVED scope toggle (moved to parent)
	const props = $props<{
		cellAlignment: 'top' | 'middle' | 'bottom';
		scope: 'cell' | 'table';
		isProcessing: boolean;
		onAlignmentChange: (value: string) => void;
		onScopeToggle: () => void; // Keep for compatibility but not used here
	}>();

	// Cell content alignment options with better labels
	const cellAlignments = [
		{ value: 'top', icon: AlignStartHorizontal, label: 'Top' },
		{ value: 'middle', icon: AlignCenterHorizontal, label: 'Middle' },
		{ value: 'bottom', icon: AlignEndHorizontal, label: 'Bottom' }
	] as const;

	// Get button class based on selection state
	function getButtonClass(value: string) {
		const isSelected = props.cellAlignment === value;

		return cn(
			'flex h-8 w-8 items-center justify-center transition-all',
			'border rounded-md',
			isSelected
				? 'bg-primary/10 border-primary text-primary'
				: 'bg-card border-border hover:bg-accent',
			props.isProcessing && 'opacity-50 cursor-not-allowed'
		);
	}

	function handleClick(value: string) {
		if (!props.isProcessing) {
			props.onAlignmentChange(value);
		}
	}
</script>

<!-- SIMPLIFIED: Just cell content alignment, scope toggle moved to parent -->
<div class="space-y-2">
	<div>
		<h3 class="mb-1 text-[0.6em] font-medium text-muted-foreground">Cell Content</h3>
		<div class="grid grid-cols-3 gap-2">
			{#each cellAlignments as align}
				{@const IconComponent = align.icon}
				<button
					class={getButtonClass(align.value)}
					onclick={() => handleClick(align.value)}
					disabled={props.isProcessing}
					title={`Align content to ${align.label.toLowerCase()}`}
				>
					{#if props.isProcessing && props.cellAlignment === align.value}
						<Loader2 class="h-3 w-3 animate-spin" />
					{:else}
						<IconComponent class="h-3 w-3" />
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>