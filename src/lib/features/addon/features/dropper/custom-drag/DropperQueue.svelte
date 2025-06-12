<!-- src/lib/features/addon/features/dropper/DropperQueue.svelte - UPDATED -->
<script lang="ts">
	import { X } from '@lucide/svelte';
	import QueueCard from './QueueCard.svelte';
	import type { ElementWithAccess, ElementTheme } from '$lib/types/elements';
	import { elementsService } from '$lib/services/data/elements';
	import { useNativeDrag, reorder } from './useNativeDrag.svelte'; // CHANGED: Import native drag

	// Enhanced interface for queue items with themes
	interface QueueItem {
		id: string;
		theme: ElementTheme;
	}

	interface ElementWithFrozenTheme extends ElementWithAccess {
		frozenTheme: ElementTheme; // The theme this element was created with
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
	let containerElement = $state<HTMLElement | null>(null);

	// Map to store frozen themes for each element
	let frozenThemes = $state<Map<string, ElementTheme>>(new Map());

	// CHANGED: Native drag setup using the clean hook
	useNativeDrag(() => containerElement, {
		animation: 150,
		ghostClass: 'queue-ghost',
		chosenClass: 'queue-chosen',
		dragClass: 'queue-drag',
		forceFallback: true,
		fallbackClass: 'queue-fallback',
		fallbackOnBody: true,
		swapThreshold: 0.65,
		scroll: true,
		scrollSensitivity: 100,
		scrollSpeed: 10,
		bubbleScroll: true,
		disabled: props.isProcessing,
		handle: '.queue-item',
		onStart: () => {
			document.body.classList.add('native-dragging'); // CHANGED: Updated class name
		},
		onEnd: (evt) => {
			document.body.classList.remove('native-dragging'); // CHANGED: Updated class name
			
			if (props.onReorderQueue) {
				const newOrder = reorder(props.queuedElements, evt);
				props.onReorderQueue(newOrder);
			}
		}
	});

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

	// Load element details when queue changes - simplified, non-async effect
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
			const elementPromises = elementIds.map(async (id) => {
				const element = await elementsService.getElementById(id, 'trial');
				if (element) {
					return {
						...element,
						frozenTheme: frozenThemes.get(id) || props.theme // Use frozen theme or fallback
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
		<!-- Draggable Pad Container -->
		<div class="flex-1 rounded-2xl border border-dashed border-foreground/20 bg-muted/20 p-3">
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
				<!-- Native Drag Grid Container - matching Dropper scroll style -->
				<div class="h-full overflow-y-auto scrollbar-none pb-4">
					<div 
						bind:this={containerElement}
						class="grid grid-cols-3 gap-2 auto-rows-max"
					>
						{#each queuedElementDetails as element (element.id)}
							<!-- Draggable Item - with frozen theme -->
							<div 
								class="queue-item relative select-none touch-none transition-transform duration-150"
								class:cursor-grab={!props.isProcessing}
								class:opacity-50={props.isProcessing}
								data-id={element.id}
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

	/* Native drag feedback classes - same as SortableJS */
	:global(.queue-ghost) {
		opacity: 0.3;
		background: var(--muted);
		border: 2px dashed var(--border);
	}

	:global(.queue-chosen) {
		transform: scale(1.02);
		z-index: 1000;
		opacity: 0.8;
	}

	:global(.queue-drag) {
		transform: rotate(2deg) scale(1.05);
		z-index: 1001;
	}

	:global(.queue-fallback) {
		opacity: 0.8;
		transform: scale(0.98);
	}

	/* NEW: Native drag placeholder styling */
	:global(.drag-placeholder) {
		background: var(--muted);
		border: 2px dashed var(--border);
		border-radius: 0.5rem;
		opacity: 0.3;
		margin: 0.5rem;
		transition: all 0.2s ease;
	}

	/* Prevent text selection during drag */
	:global(.native-dragging) {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		cursor: grabbing !important;
	}

	/* Hover effects */
	.queue-item:not(.opacity-50):hover {
		cursor: grab;
		transform: translateY(-2px);
	}
	
	.queue-item:not(.opacity-50):active {
		cursor: grabbing;
	}

	/* FIXED: Ensure draggable items have proper cursor */
	:global(.queue-item[draggable="true"]) {
		cursor: grab;
	}

	:global(.queue-item[draggable="true"]:active) {
		cursor: grabbing;
	}
</style>