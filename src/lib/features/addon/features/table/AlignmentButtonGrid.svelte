<!-- src/lib/features/addon/features/table/AlignmentButtonGrid.svelte -->
<script lang="ts">
	import { cn } from '$lib/utils';
	import {
		AlignStartHorizontal,
		AlignCenterHorizontal,
		AlignEndHorizontal,
		Loader2,
		Table,
		Focus
	} from '@lucide/svelte';

	// Props
	const props = $props<{
		cellAlignment: 'top' | 'middle' | 'bottom';
		scope: 'cell' | 'table';
		isProcessing: boolean;
		onAlignmentChange: (value: string) => void;
		onScopeToggle: () => void;
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

	// Get scope toggle class
	function getScopeToggleClass() {
		return cn(
			'flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs transition-colors hover:bg-accent',
			props.scope === 'table' ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
		);
	}

	function handleClick(value: string) {
		if (!props.isProcessing) {
			props.onAlignmentChange(value);
		}
	}
</script>

<div class="space-y-2">
	<!-- Cell Content Alignment -->
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

	<!-- Scope Toggle with relevant icons -->
	<!-- <div class="flex items-center justify-center">
		<button
			class={getScopeToggleClass()}
			onclick={props.onScopeToggle}
			disabled={props.isProcessing}
			title={`Currently applying to ${props.scope}. Click to toggle.`}
		>
			{#if props.scope === 'table'}
				<Table class="h-3 w-3" />
				<span class="font-medium text-primary">Whole Table</span>
			{:else}
				<Focus class="h-3 w-3" />
				<span class="font-medium">Selected Cell</span>
			{/if}
		</button>
	</div> -->
</div>