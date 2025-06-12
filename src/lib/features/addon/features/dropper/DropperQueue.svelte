<!-- src/lib/features/addon/features/dropper/DropperQueue.svelte - SVELTEDND VERSION -->
<script lang="ts">
	import { X } from '@lucide/svelte';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
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
		queueIndex: number; // Add index for drag data
	}

	// Props - keep it simple but add frozen themes
	const props = $props<{
		queuedElements: string[]; // For backward compatibility
		queuedItems?: QueueItem[]; // Enhanced queue with individual themes
		theme: ElementTheme; // Current dropper theme
		isProcessing: boolean;
		onRemoveFromQueue: (elementId: string) => void;
		onApplyQueue: () => void;
		onDiscardQueue: () => void;
		onReorderQueue?: (newOrder: string[]) => void;
	}>();

	// State
	let queuedElementDetails = $state<ElementWithFrozenTheme[]>([]);
	let loading = $state(false);

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
			return;
		}

		// Set loading immediately
		loading = true;
		
		// Load elements asynchronously but don't await in effect
		loadElements(elements);
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
						queueIndex: index // Store original queue position
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

	// Handle drop reordering with SvelteDnD
	function handleDrop(state: DragDropState<ElementWithFrozenTheme>) {
		if (!props.onReorderQueue) return;
		
		const { draggedItem } = state;
		console.log('🎯 SvelteDnD Drop:', { draggedItem: draggedItem.id });

		// Get current order from DOM (SvelteDnD handles the visual reordering)
		const currentOrder = queuedElementDetails.map(el => el.id);
		
		// Call parent's reorder function
		props.onReorderQueue(currentOrder);
	}

	// Handle remove element from queue
	function handleRemove(elementId: string, event?: MouseEvent) {
		if (event) {
			event.stopPropagation();
			event.preventDefault();
		}
		if (!props.isProcessing) {
			// Also remove frozen theme
			frozenThemes.delete(elementId);
			props.onRemoveFromQueue(elementId);
		}
	}
</script>

<div class="flex h-full flex-col">
	<!-- Queue Content with matching scrollbar style -->
	<div class="flex-1 p-3 space-y-3">
		<!-- SvelteDnD Queue Container -->
		<div 
			class="flex-1 rounded-2xl border border-dashed border-foreground/20 bg-muted/20 p-3"
			use:droppable={{
				container: 'queue',
				callbacks: { onDrop: handleDrop }
			}}
		>
			{#if props.queuedElements.length === 0}
				<!-- Empty State -->
				<div class="flex h-full items-center justify-center text-center">
					<p class="text-[0.75em] text-muted-foreground">No elements queued</p>
				</div>
			{:else if loading}
				<!-- Loading State -->
				<div class="flex h-full items-center justify-center">
					<div class="h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
				</div>
			{:else}
				<!-- SvelteDnD Grid Container -->
				<div class="h-full overflow-y-auto scrollbar-none pb-4">
					<div class="grid grid-cols-3 gap-2 auto-rows-max">
						{#each queuedElementDetails as element (element.id)}
							<!-- SvelteDnD Draggable Item -->
							<div 
								class="queue-item relative select-none transition-transform duration-150"
								class:cursor-grab={!props.isProcessing}
								class:opacity-50={props.isProcessing}
								data-id={element.id}
								use:draggable={{
									container: 'queue',
									dragData: element,
									disabled: props.isProcessing
								}}
							>
								<!-- QueueCard with FROZEN theme (doesn't change when user toggles) -->
								<QueueCard 
									element={element} 
									theme={element.frozenTheme}
								/>

								<!-- Remove Button -->
								<button
									class="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground
									       hover:bg-destructive/90 transition-colors z-20 shadow-sm flex items-center justify-center
									       disabled:pointer-events-none disabled:opacity-50"
									onclick={(e) => handleRemove(element.id, e)}
									disabled={props.isProcessing}
									title="Remove from queue"
								>
									<X size={10} />
								</button>

								<!-- Element Name with frozen theme indicator -->
								<div class="mt-0.5 w-full flex items-center justify-center gap-1">
									<p class="truncate text-center text-[0.5rem] text-muted-foreground pointer-events-none">
										{element.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
									</p>
									<!-- Theme indicator dot - shows frozen theme -->
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

		<!-- Instructions -->
		{#if queuedElementDetails.length > 0 && !loading}
			<div class="text-center">
				<p class="text-xs text-muted-foreground">
					Drag elements to reorder • Remove with X button
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Match Dropper scrollbar hiding */
	.scrollbar-none {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	
	.scrollbar-none::-webkit-scrollbar {
		display: none;
	}

	/* SvelteDnD styling - customize the drag states */
	:global(.svelte-dnd-dragging) {
		opacity: 0.6 !important;
		transform: scale(1.05) rotate(2deg) !important;
		z-index: 1000 !important;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
	}

	:global(.svelte-dnd-drop-target) {
		background: var(--muted) !important;
		border: 2px dashed var(--primary) !important;
		border-radius: 0.5rem !important;
	}

	/* Hover effects */
	.queue-item:not(.opacity-50):hover {
		transform: translateY(-2px);
		cursor: grab;
	}
	
	.queue-item:not(.opacity-50):active {
		cursor: grabbing;
	}

	/* Ensure proper cursor states */
	:global([data-svelte-dnd-draggable]) {
		cursor: grab;
	}

	:global([data-svelte-dnd-draggable]:active) {
		cursor: grabbing;
	}
</style>