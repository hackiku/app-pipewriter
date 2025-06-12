<!-- src/lib/features/addon/features/dropper/DropperQueue.svelte - CLICK-TO-SELECT VERSION -->
<script lang="ts">
	import { X } from '@lucide/svelte';
	import QueueCard from './QueueCard.svelte';
	import type { ElementWithAccess, ElementTheme } from '$lib/types/elements';
	import { elementsService } from '$lib/services/data/elements';

	// Enhanced interface for queue items with themes
	interface QueueItem {
		id: string;
		theme: ElementTheme;
	}

	interface ElementWithFrozenTheme extends ElementWithAccess {
		frozenTheme: ElementTheme;
		queueIndex: number;
	}

	// Props
	const props = $props<{
		queuedElements: string[];
		queuedItems?: QueueItem[];
		theme: ElementTheme;
		isProcessing: boolean;
		onRemoveFromQueue: (elementId: string) => void;
		onApplyQueue: () => void;
		onDiscardQueue: () => void;
		onReorderQueue?: (newOrder: string[]) => void;
	}>();

	// State
	let queuedElementDetails = $state<ElementWithFrozenTheme[]>([]);
	let loading = $state(false);
	
	// CLICK-TO-SELECT: New state for selection-based reordering
	let selectedElement = $state<string | null>(null);

	// Map to store frozen themes for each element
	let frozenThemes = $state<Map<string, ElementTheme>>(new Map());

	// Update frozen themes when queuedItems changes
	$effect(() => {
		if (props.queuedItems) {
			for (const item of props.queuedItems) {
				if (!frozenThemes.has(item.id)) {
					frozenThemes.set(item.id, item.theme);
				}
			}
		}
	});

	// Load element details when queue changes
	$effect(() => {
		const elements = props.queuedElements;
		
		if (elements.length === 0) {
			queuedElementDetails = [];
			loading = false;
			selectedElement = null; // Clear selection when queue is empty
			return;
		}

		loading = true;
		loadElements(elements);
	});

	// Clear selection if selected element is removed from queue
	$effect(() => {
		if (selectedElement && !props.queuedElements.includes(selectedElement)) {
			selectedElement = null;
		}
	});

	// Separate async function for loading elements
	async function loadElements(elementIds: string[]) {
		try {
			const elementPromises = elementIds.map(async (id, index) => {
				const element = await elementsService.getElementById(id, 'trial');
				if (element) {
					return {
						...element,
						frozenTheme: frozenThemes.get(id) || props.theme,
						queueIndex: index
					} as ElementWithFrozenTheme;
				}
				return null;
			});
			
			const elements = await Promise.all(elementPromises);
			queuedElementDetails = elements.filter(Boolean) as ElementWithFrozenTheme[];
		} catch (error) {
			console.error('Error loading queued elements:', error);
			queuedElementDetails = [];
		} finally {
			loading = false;
		}
	}

	// CLICK-TO-SELECT: Handle card clicks for selection and reordering
	function handleCardClick(elementId: string, event: MouseEvent) {
		if (props.isProcessing) return;
		
		// Prevent event from bubbling to avoid conflicts
		event.stopPropagation();

		if (selectedElement === null) {
			// First click: select this element
			selectedElement = elementId;
			console.log('🎯 Selected element:', elementId);
		} else if (selectedElement === elementId) {
			// Click on selected element: deselect (abort)
			selectedElement = null;
			console.log('🎯 Deselected element:', elementId);
		} else {
			// Click on different element: move selected element to this position
			handleMoveElement(selectedElement, elementId);
			selectedElement = null; // Clear selection after move
		}
	}

	// CLICK-TO-SELECT: Handle moving elements
	function handleMoveElement(fromElementId: string, toElementId: string) {
		if (!props.onReorderQueue) return;

		const fromIndex = props.queuedElements.indexOf(fromElementId);
		const toIndex = props.queuedElements.indexOf(toElementId);
		
		if (fromIndex === -1 || toIndex === -1) return;

		console.log('🎯 Moving element:', { 
			from: fromElementId, 
			to: toElementId, 
			fromIndex, 
			toIndex 
		});

		// Reorder: move selected element to target position
		const newOrder = [...props.queuedElements];
		const [movedItem] = newOrder.splice(fromIndex, 1);
		newOrder.splice(toIndex, 0, movedItem);

		props.onReorderQueue(newOrder);
	}

	// Handle remove element from queue
	function handleRemove(elementId: string, event?: MouseEvent) {
		if (event) {
			event.stopPropagation();
			event.preventDefault();
		}
		if (!props.isProcessing) {
			// Clear selection if removing selected element
			if (selectedElement === elementId) {
				selectedElement = null;
			}
			frozenThemes.delete(elementId);
			props.onRemoveFromQueue(elementId);
		}
	}

	// Get card styling based on selection state
	function getCardStyle(elementId: string): string {
		if (selectedElement === elementId) {
			// Selected: thick solid border
			return "border-2 border-primary bg-primary/5 cursor-pointer";
		} else if (selectedElement !== null) {
			// Other elements when something is selected: dashed border, can be targets
			return "border-2 border-dashed border-border/60 cursor-pointer hover:border-primary/60 hover:bg-primary/5";
		} else {
			// Normal state: no special border, clickable to select
			return "cursor-pointer hover:bg-accent/30";
		}
	}

	// Get instruction text based on current state
	function getInstructionText(): string {
		if (selectedElement === null) {
			return "Click any element to select it";
		} else {
			const selectedName = selectedElement.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
			return `Click another element to move "${selectedName}" there, or click "${selectedName}" again to cancel`;
		}
	}
</script>

<div class="flex h-full flex-col">
	<!-- IMPROVED: Container with scrolling -->
	<div class="flex-1 p-3">
		<!-- IMPROVED: Tighter dashed container -->
		<div class="rounded-2xl border border-dashed border-foreground/20 bg-muted/20 p-2 h-36 overflow-hidden">
			{#if props.queuedElements.length === 0}
				<!-- Empty State -->
				<div class="flex h-full items-center justify-center text-center min-h-24">
					<p class="text-[0.75em] text-muted-foreground">No elements queued</p>
				</div>
			{:else if loading}
				<!-- Loading State -->
				<div class="flex h-full items-center justify-center min-h-24">
					<div class="h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
				</div>
			{:else}
				<!-- CLICK-TO-SELECT: Scrollable grid with click interactions -->
				<div class="h-full overflow-y-auto scrollbar-none">
					<div class="grid grid-cols-3 gap-2 auto-rows-max pb-2">
						{#each queuedElementDetails as element (element.id)}
							<!-- CLICK-TO-SELECT: Wrapper with click handling -->
							<div class="queue-item-wrapper relative group">
								
								<!-- CLICK-TO-SELECT: Clickable area with visual state -->
								<div 
									class="queue-item-card relative select-none transition-all duration-200 rounded-lg p-0.5 {getCardStyle(element.id)}"
									class:opacity-50={props.isProcessing}
									onclick={(e) => handleCardClick(element.id, e)}
									data-id={element.id}
								>
									<!-- QueueCard with FROZEN theme -->
									<QueueCard 
										element={element} 
										theme={element.frozenTheme}
									/>
								</div>

								<!-- X button OUTSIDE clickable area, appears on hover -->
								<button
									class="absolute right-0 top-0 h-4 w-4 rounded-full bg-destructive text-destructive-foreground
									       hover:bg-destructive/90 transition-all duration-200 z-50 shadow-sm flex items-center justify-center
									       opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100
									       disabled:pointer-events-none disabled:opacity-50"
									onclick={(e) => handleRemove(element.id, e)}
									disabled={props.isProcessing}
									title="Remove from queue"
								>
									<X size={10} />
								</button>

								<!-- Element Name with frozen theme indicator -->
								<div class="mt-0.5 w-full flex items-center justify-center gap-1 pointer-events-none">
									<p class="truncate text-center text-[0.5rem] text-muted-foreground">
										{element.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
									</p>
									<!-- Theme indicator dot -->
									<div 
										class="w-1.5 h-1.5 rounded-full {element.frozenTheme === 'dark' ? 'bg-foreground' : 'border border-foreground/30'}"
										title="{element.frozenTheme} theme (frozen)"
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- CLICK-TO-SELECT: Instructions -->
		{#if queuedElementDetails.length > 0 && !loading}
			<div class="mt-0 text-center">
				<p class="text-[0.6em] text-muted-foreground">
					{getInstructionText()}
				</p>
			</div>
			<!-- <div class="mt-1 text-center bg-slate-400 border-t rounded-t-full w-44 mx-auto z-50">
				<p class="text-[0.6em] text-muted-foreground">
					{getInstructionText()}
				</p>
			</div> -->
		{/if}
	</div>
</div>

<style>
	/* Hide scrollbars */
	.scrollbar-none {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	
	.scrollbar-none::-webkit-scrollbar {
		display: none;
	}

	/* CLICK-TO-SELECT: Smooth click interactions */
	.queue-item-card {
		/* Ensure clickable area is well-defined */
	}

	.queue-item-card:active {
		transform: scale(0.98);
	}

	/* Selection state transitions */
	.queue-item-card {
		transition: all 0.2s ease;
	}
</style>