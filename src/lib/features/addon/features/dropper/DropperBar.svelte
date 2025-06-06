<!-- src/lib/features/addon/features/dropper/DropperBar.svelte -->
<script lang="ts">
	import { Link2, X, Plus, Sun, Moon, Grid3X3, Grid2X2, Square } from '@lucide/svelte';
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import type { ElementTheme } from '$lib/types/elements';

	// Props
	const props = $props<{
		isProcessing: boolean;
		theme: ElementTheme;
		selectedElements: string[];
		chainMode: boolean;
		queuedElements?: string[];
		gridColumns: number; // FIXED: Added this prop
		onToggleTheme: () => void;
		onGridChange: (cols: number) => void;
		onToggleChainMode: () => void;
		onApplyQueue?: () => void;
		onDiscardQueue?: () => void;
	}>();

	// Grid size options with proper icons
	const gridSizes = [
		{ value: 3, label: '3 Columns', icon: Grid3X3 },
		{ value: 2, label: '2 Columns', icon: Grid2X2 },
		{ value: 1, label: '1 Column', icon: Square }
	];

	// Themes configuration with icons
	const themes: Array<{ id: ElementTheme; icon: any; label: string }> = [
		{ id: 'light', icon: Sun, label: 'Light' },
		{ id: 'dark', icon: Moon, label: 'Dark' }
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

	// FIXED: Use props.gridColumns instead of local state
	let currentGridSize = $derived(() => {
		return gridSizes.find((s) => s.value === props.gridColumns) || gridSizes[0];
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

		const newColumns = nextColumns[props.gridColumns];
		props.onGridChange(newColumns);
	}
</script>

<Tooltip.Provider>
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
					<Tooltip.Root>
						<Tooltip.Trigger
							class="h-8 w-8 rounded-full border-2 transition-all duration-150 active:scale-95 backdrop-blur-sm
							 {props.chainMode
								? 'border-primary bg-primary text-primary-foreground shadow-md'
								: 'border-border bg-background/90 hover:border-primary/60 hover:bg-accent hover:shadow-sm'}"
							disabled={props.isProcessing}
							onclick={props.onToggleChainMode}
						>
							<Link2
								size={16}
								class="mx-auto {props.chainMode
									? 'text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground'}"
							/>
							<span class="sr-only">{props.chainMode ? 'Exit chain mode' : 'Enter chain mode'}</span>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>{props.chainMode ? 'Exit chain mode' : 'Enter chain mode - queue elements before inserting'}</p>
						</Tooltip.Content>
					</Tooltip.Root>
					
					<!-- FIXED: Theme Toggle Button with Sun/Moon Icons -->
					<Tooltip.Root>
						<Tooltip.Trigger
							class="h-8 w-8 rounded-full border-2 border-border bg-background/90 backdrop-blur-sm
							transition-all duration-150 hover:border-primary/60 hover:bg-accent hover:shadow-sm active:scale-95"
							disabled={props.isProcessing}
							onclick={props.onToggleTheme}
						>
							<div class="mx-auto flex items-center justify-center">
								{#if props.theme === 'light'}
									<Sun class="h-4 w-4 text-muted-foreground hover:text-foreground" />
								{:else}
									<Moon class="h-4 w-4 text-muted-foreground hover:text-foreground" />
								{/if}
							</div>
							<span class="sr-only">Switch to {nextTheme.label} theme</span>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Switch to {nextTheme.label} theme</p>
						</Tooltip.Content>
					</Tooltip.Root>

					<!-- FIXED: Grid Size Button with Icons -->
					<!-- <Tooltip.Root>
						<Tooltip.Trigger
							class="h-8 w-8 rounded-full border-2 border-border bg-background/90 backdrop-blur-sm
							transition-all duration-150 hover:border-primary/60 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-95"
							disabled={props.isProcessing}
							onclick={cycleGridColumns}
						>
							<svelte:component this={currentGridSize.icon} class="h-4 w-4 mx-auto text-muted-foreground hover:text-foreground" />
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Switch to {nextGridSize.label}</p>
						</Tooltip.Content>
					</Tooltip.Root> -->
				</div>

				<!-- Chain Mode Actions -->
				{#if props.chainMode}
					<div class="flex items-center gap-2">
						<!-- Clear Button -->
						<Tooltip.Root>
							<Tooltip.Trigger
								class="h-7 w-7 rounded-full border-2 border-border bg-background/90 backdrop-blur-sm
								   text-muted-foreground transition-all duration-150 hover:border-destructive/60
								   hover:bg-destructive/10 hover:text-destructive hover:shadow-sm active:scale-95
								   disabled:cursor-not-allowed disabled:opacity-50"
								onclick={props.onDiscardQueue}
								disabled={props.isProcessing || !props.queuedElements?.length}
							>
								<X size={14} class="mx-auto" />
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Clear queue and exit chain mode</p>
							</Tooltip.Content>
						</Tooltip.Root>

						<!-- Drop Button with text -->
						<Tooltip.Root>
							<Tooltip.Trigger
								class="h-7 px-3 rounded-full border-2 border-primary bg-primary/10 backdrop-blur-sm
								   text-primary transition-all duration-150 hover:border-primary hover:bg-primary/20
								   hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50
								   flex items-center gap-1 text-xs font-medium"
								onclick={props.onApplyQueue}
								disabled={props.isProcessing || !props.queuedElements?.length}
							>
								<Plus size={12} />
								<span>Drop</span>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Drop {props.queuedElements?.length || 0} elements</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</div>
				{/if}
			</div>
		</div>
	</div>
</Tooltip.Provider>

<style>
	.dropper-container {
		position: relative;
	}
</style>