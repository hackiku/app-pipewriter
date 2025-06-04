<!-- src/lib/features/addon/features/dropper/DropperQueue.svelte -->
<script lang="ts">
	import { X } from '@lucide/svelte';
	import QueueCard from './QueueCard.svelte';
	import type { ElementWithAccess, ElementTheme } from '$lib/types/elements';
	import { elementsService } from '$lib/services/firestore/elements';
	import { useSortable, reorder } from './useSortable.svelte';

	// Props
	const props = $props<{
		queuedElements: string[];
		theme: ElementTheme;
		isProcessing: boolean;
		onRemoveFromQueue: (elementId: string) => void;
		onApplyQueue: () => void;
		onDiscardQueue: () => void;
		onReorderQueue?: (newOrder: string[]) => void;
	}>();

	// State
	let queuedElementDetails = $state<ElementWithAccess[]>([]);
	let loading = $state(false);
	let containerElement = $state<HTMLElement | null>(null);

	// SortableJS setup using the clean hook
	useSortable(() => containerElement, {
		animation: 150,
		ghostClass: 'queue-ghost',
		chosenClass: 'queue-chosen',
		dragClass: 'queue-drag',
		// Better iframe compatibility
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
			document.body.classList.add('sortable-dragging');
		},
		onEnd: (evt) => {
			document.body.classList.remove('sortable-dragging');
			
			if (props.onReorderQueue) {
				const newOrder = reorder(props.queuedElements, evt);
				props.onReorderQueue(newOrder);
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
			const elementPromises = elementIds.map(id => 
				elementsService.getElementById(id, 'trial')
			);
			
			const elements = await Promise.all(elementPromises);
			queuedElementDetails = elements.filter(Boolean) as ElementWithAccess[];
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
			props.onRemoveFromQueue(elementId);
		}
	}
</script>

<div class="flex h-full flex-col">
	<!-- Queue Content with matching scrollbar style -->
	<div class="flex-1 p-3 space-y-3">
		<!-- Draggable Pad Container -->
		<div class="flex-1 rounded-2xl border-2 border-dashed border-muted bg-muted/20 p-3">
			{#if props.queuedElements.length === 0}
				<!-- Empty State -->
				<div class="flex h-full items-center justify-center text-center">
					<p class="text-sm text-muted-foreground">No elements queued</p>
				</div>
			{:else if loading}
				<!-- Loading State -->
				<div class="flex h-full items-center justify-center">
					<div class="h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
				</div>
			{:else}
				<!-- SortableJS Grid Container - matching Dropper scroll style -->
				<div class="h-full overflow-y-auto scrollbar-none pb-4">
					<div 
						bind:this={containerElement}
						class="grid grid-cols-3 gap-2 auto-rows-max"
					>
						{#each queuedElementDetails as element (element.id)}
							<!-- Sortable Item - simplified -->
							<div 
								class="queue-item relative select-none touch-none transition-transform duration-150"
								class:cursor-grab={!props.isProcessing}
								class:opacity-50={props.isProcessing}
								data-id={element.id}
							>
								<!-- QueueCard -->
								<QueueCard 
									element={element} 
									theme={props.theme} 
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

								<!-- Element Name -->
								<p class="mt-0.5 w-full truncate text-center text-[0.5rem] text-muted-foreground pointer-events-none">
									{element.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
								</p>
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

	/* SortableJS drag feedback classes */
	:global(.queue-ghost) {
		opacity: 0.3;
		background: var(--muted);
		border: 2px dashed var(--border);
	}

	:global(.queue-chosen) {
		transform: scale(1.02);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		z-index: 1000;
	}

	:global(.queue-drag) {
		transform: rotate(2deg) scale(1.05);
		z-index: 1001;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
	}

	:global(.queue-fallback) {
		opacity: 0.8;
		transform: scale(0.98);
	}

	/* Prevent text selection during drag */
	:global(.sortable-dragging) {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		cursor: grabbing !important;
	}

	/* Hover effects */
	.queue-item:not(.opacity-50):hover {
		cursor: grab;
		transform: translateY(-1px);
	}
	
	.queue-item:not(.opacity-50):active {
		cursor: grabbing;
	}

	/* Hidden class for Tailwind compilation */
	:global(.opacity-0) {
		opacity: 0;
	}
</style>