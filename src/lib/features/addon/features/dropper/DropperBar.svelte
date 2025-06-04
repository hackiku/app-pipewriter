<!-- src/lib/features/addon/features/dropper/DropperBar.svelte -->
<script lang="ts">
	import { Link2, X, Plus } from '@lucide/svelte';
	import type { ElementTheme } from '$lib/types/elements';

	// Props
	const props = $props<{
		isProcessing: boolean;
		theme: ElementTheme;
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

	// Themes configuration
	const themes: Array<{ id: ElementTheme; symbol: string; label: string }> = [
		{ id: 'light', symbol: '○', label: 'Light' },
		{ id: 'dark', symbol: '●', label: 'Dark' }
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
	<div class="absolute bottom-2 -left-1 right-0 z-20 px-5 pb-0">
		<div class="flex items-center justify-between">
			<!-- Left Side Controls -->
			<div class="flex items-center gap-2">
				<!-- Chain Mode Toggle Button -->
				<button
					class="h-8 w-8 rounded-full border-2 transition-all duration-150 active:scale-95 backdrop-blur-sm
                 {props.chainMode
						? 'border-primary bg-primary text-primary-foreground shadow-md'
						: 'border-border bg-background/90 hover:border-primary/60 hover:bg-accent hover:shadow-sm'}"
					disabled={props.isProcessing}
					onclick={props.onToggleChainMode}
					title={props.chainMode
						? 'Exit chain mode'
						: 'Enter chain mode - queue elements before inserting'}
				>
					<Link2
						size={16}
						class="mx-auto {props.chainMode
							? 'text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
					/>
					<span class="sr-only">{props.chainMode ? 'Exit chain mode' : 'Enter chain mode'}</span>
				</button>
				
				<!-- Theme Toggle Button with Yin-Yang -->
				<button
					class="h-8 w-8 rounded-full border-2 border-border bg-background/90 backdrop-blur-sm
					transition-all duration-150 hover:border-primary/60 hover:bg-accent hover:shadow-sm active:scale-95"
					disabled={props.isProcessing}
					onclick={props.onToggleTheme}
					title={`Switch to ${nextTheme.label} theme`}
				>
					<div class="mx-auto flex items-center justify-center">
						{#if props.theme === 'light'}
							<!-- Light theme: white circle with black dot -->
							<div class="relative">
								<div class="w-4 h-4 rounded-full bg-foreground/10 border border-foreground/20"></div>
								<div class="absolute top-1 left-1 w-2 h-2 rounded-full bg-foreground/80"></div>
							</div>
						{:else}
							<!-- Dark theme: black circle with white dot -->
							<div class="relative">
								<div class="w-4 h-4 rounded-full bg-foreground/80 border border-foreground/60"></div>
								<div class="absolute top-1 left-1 w-2 h-2 rounded-full bg-background"></div>
							</div>
						{/if}
					</div>
					<span class="sr-only">Switch to {nextTheme.label} theme</span>
				</button>

				<!-- Grid Size Button -->
				<button
					class="h-7 w-7 rounded-full border-2 border-border bg-background/90 backdrop-blur-sm
					text-xs font-medium text-muted-foreground transition-all duration-150
					hover:border-primary/60 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-95"
					disabled={props.isProcessing}
					title={`Switch to ${nextGridSize.label} grid`}
					onclick={cycleGridColumns}
				>
					{currentGridSize.label}
				</button>
			</div>

			<!-- Chain Mode Actions -->
			{#if props.chainMode}
				<div class="flex items-center gap-2">
					<!-- Clear Button -->
					<button
						class="h-7 w-7 rounded-full border-2 border-border bg-background/90 backdrop-blur-sm
		       text-muted-foreground transition-all duration-150 hover:border-destructive/60
		       hover:bg-destructive/10 hover:text-destructive hover:shadow-sm active:scale-95
		       disabled:cursor-not-allowed disabled:opacity-50"
						onclick={props.onDiscardQueue}
						disabled={props.isProcessing || !props.queuedElements?.length}
						title="Clear queue and exit chain mode"
					>
						<X size={14} class="mx-auto" />
					</button>

					<!-- Drop Button with text -->
					<button
						class="h-7 px-3 rounded-full border-2 border-primary bg-primary/10 backdrop-blur-sm
		       text-primary transition-all duration-150 hover:border-primary hover:bg-primary/20
		       hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50
		       flex items-center gap-1 text-xs font-medium"
						onclick={props.onApplyQueue}
						disabled={props.isProcessing || !props.queuedElements?.length}
						title={`Drop ${props.queuedElements?.length || 0} elements`}
					>
						<Plus size={12} />
						<span>Drop</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.dropper-container {
		position: relative;
	}
</style>