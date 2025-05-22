<!-- $lib/iframe/features/dropper/DropperBar.svelte -->
<script lang="ts">
	import { Link2, X, Plus } from '@lucide/svelte';
	import ChainActions from './ChainActions.svelte';
	import type { ElementTheme } from '$lib/data/addon/types';

	// Props
	const props = $props<{
		isProcessing: boolean;
		theme: string;
		selectedElements: string[];
		chainMode: boolean;
		queuedElements?: string[];
		onToggleTheme: () => void;
		onGridChange: (cols: number) => void;
		onToggleChainMode: () => void;
		onApplyQueue?: () => void;
		onDiscardQueue?: () => void;
	}>();

	// Grid size options (constant, won't change)
	const gridSizes = [
		{ value: 3, label: '3×' },
		{ value: 2, label: '2×' },
		{ value: 1, label: '1×' }
	];

	// Current grid size (read-only in this component, set only on cycleGridColumns)
	let gridColumns = $state(3);

	// Themes configuration (these won't change)
	const themes = [
		{ id: 'light', color: '#FFFFFF', label: 'Light' },
		{ id: 'dark', color: '#171717', label: 'Dark' }
	];

	// Current theme
	let currentTheme = $derived(() => {
		return themes.find((t) => t.id === props.theme) || themes[0];
	});

	// Next theme (for UI display)
	let nextTheme = $derived(() => {
		const currentIndex = themes.findIndex((t) => t.id === currentTheme.id);
		return themes[(currentIndex + 1) % themes.length];
	});

	// Current grid size
	let currentGridSize = $derived(() => {
		return gridSizes.find((s) => s.value === gridColumns) || gridSizes[0];
	});

	// Next grid size (for UI display)
	let nextGridSize = $derived(() => {
		const currentIndex = gridSizes.findIndex((s) => s.value === currentGridSize.value);
		return gridSizes[(currentIndex + 1) % gridSizes.length];
	});

	// Methods
	function cycleGridColumns() {
		const nextColumns = {
			3: 2,
			2: 1,
			1: 3
		} as Record<number, number>;

		gridColumns = nextColumns[gridColumns];
		props.onGridChange(gridColumns);

		console.log(`Grid columns updated to: ${gridColumns}`);
	}
</script>

<div class="dropper-container relative">
	<!-- Background Gradient -->
	<div
		class="pointer-events-none absolute bottom-0 left-0 right-0
           z-10 h-16 bg-gradient-to-t
           from-background from-20% via-background/80
           via-70% to-transparent"
		aria-hidden="true"
	></div>

	<!-- Control Bar -->
	<div class="absolute bottom-0 left-0 right-0 z-20 px-5 pb-0">
		<div class="flex items-center justify-between">
			<!-- Left Side Controls -->
			<div class="flex items-center gap-2">
				<!-- Chain Mode Toggle Button -->
				<button
					class="-mb-1 h-10 w-8 rounded-t-full border transition-all duration-150 active:scale-95
                 {props.chainMode
						? 'border-border bg-primary text-primary-foreground shadow-sm'
						: 'border-border bg-accent/40 hover:border-primary/60 hover:shadow-sm dark:hover:border-primary/80'}"
					disabled={props.isProcessing}
					onclick={props.onToggleChainMode}
					title={props.chainMode
						? 'Exit chain mode'
						: 'Enter chain mode - queue elements before inserting'}
				>
					<Link2
						size={12}
						class="mx-auto {props.chainMode
							? 'text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
					/>
					<span class="sr-only">{props.chainMode ? 'Exit chain mode' : 'Enter chain mode'}</span>
				</button>

				<!-- Theme Toggle Button -->
				<button
					class="h-6 w-6 rounded-full border-2 border-border/60
                 transition-all duration-150
                 hover:border-primary/60 hover:shadow-sm active:scale-95 dark:hover:border-primary/80"
					style={`background-color: ${currentTheme.color}`}
					disabled={props.isProcessing}
					onclick={props.onToggleTheme}
					title={`Switch to ${nextTheme.label} theme`}
				>
					<span class="sr-only">Switch to {nextTheme.label} theme</span>
				</button>

				<!-- Grid Size Button -->
				<button
					class="h-6 w-6 rounded-full border-2 border-border/60 bg-background/80 text-xs
                 font-medium text-muted-foreground
                 backdrop-blur-sm transition-all duration-150
                 hover:border-primary/60 hover:bg-accent/20
                 hover:text-foreground hover:shadow-sm
                 active:scale-95 dark:hover:border-primary/80"
					disabled={props.isProcessing}
					title={`Switch to ${nextGridSize.label} grid`}
					onclick={cycleGridColumns}
				>
					{currentGridSize.label}
				</button>
			</div>

			{#if props.chainMode}
				<div class="flex items-center gap-2">
					<!-- Clear/Reset Button -->
					<button
						class="h-6 w-6 rounded-full border-2 border-border/60
		       bg-background/80 text-muted-foreground
		       backdrop-blur-sm transition-all
		       duration-150 hover:border-destructive/60
		       hover:bg-destructive/10 hover:text-destructive
		       hover:shadow-sm active:scale-95
		       disabled:cursor-not-allowed disabled:opacity-50"
						onclick={props.onDiscardQueue}
						title="Clear queue"
					>
						<X size={12} class="mx-auto" />
					</button>

					<!-- Drop Button -->
					<button
						class="h-6 w-6 rounded-full border-2 border-primary/60
		       bg-primary/10 text-primary
		       backdrop-blur-sm transition-all
		       duration-150 hover:border-primary
		       hover:bg-primary/20 hover:text-primary
		       hover:shadow-sm active:scale-95
		       disabled:cursor-not-allowed disabled:opacity-50"
						onclick={props.onApplyQueue}
					>
						<Plus size={12} class="mx-auto" />
					</button>
				</div>
			{/if}
			<!-- Right Side Chain Actions -->
			<!-- {#if props.chainMode && props.queuedElements && props.queuedElements.length >= 0 && props.onApplyQueue && props.onDiscardQueue}
        <ChainActions 
          queuedElements={props.queuedElements}
          isProcessing={props.isProcessing}
          onApplyQueue={props.onApplyQueue}
          onDiscardQueue={props.onDiscardQueue}
        />
				{/if} -->
		</div>
	</div>
</div>

<style>
	.dropper-container {
		position: relative;
	}
</style>
