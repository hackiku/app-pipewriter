<!-- src/lib/features/addon/features/dropper/DropperQueue.svelte -->
<script lang="ts">
	import { X } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';
	import Sortable from 'sortablejs';
	import QueueCard from './QueueCard.svelte';
	import type { ElementWithAccess, ElementTheme } from '$lib/types/elements';
	import { elementsService } from '$lib/services/firestore/elements';

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

	// Get element details for queued items
	let queuedElementDetails = $state<ElementWithAccess[]>([]);
	let loading = $state(false);
	
	// SortableJS instance and container element
	let sortableInstance: Sortable | null = null;
	let containerElement: HTMLElement; // No $state needed for bind:this

	// Load element details when queue changes
	$effect(async () => {
		if (props.queuedElements.length === 0) {
			queuedElementDetails = [];
			return;
		}

		loading = true;
		const elementPromises = props.queuedElements.map(id => 
			elementsService.getElementById(id, 'trial')
		);

		try {
			const elements = await Promise.all(elementPromises);
			queuedElementDetails = elements.filter(Boolean) as ElementWithAccess[];
		} catch (error) {
			console.error('Error loading queued elements:', error);
			queuedElementDetails = [];
		} finally {
			loading = false;
		}
	});

	// Initialize SortableJS in onMount (cleaner pattern)
	onMount(() => {
		if (containerElement) {
			sortableInstance = new Sortable(containerElement, {
				animation: 150,
				ghostClass: 'queue-ghost',
				chosenClass: 'queue-chosen', 
				dragClass: 'queue-drag',
				forceFallback: true, // Better iframe compatibility
				fallbackClass: 'queue-fallback',
				fallbackOnBody: true,
				swapThreshold: 0.65,
				onEnd: (evt) => {
					const { oldIndex, newIndex } = evt;
					
					if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
						// Create new order based on the drag result
						const newOrder = [...props.queuedElements];
						const movedElement = newOrder.splice(oldIndex, 1)[0];
						newOrder.splice(newIndex, 0, movedElement);
						
						// Call reorder callback
						if (props.onReorderQueue) {
							props.onReorderQueue(newOrder);
						}
					}
				}
			});
		}
	});

	// Cleanup SortableJS on destroy
	onDestroy(() => {
		if (sortableInstance) {
			sortableInstance.destroy();
		}
	});

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
	<!-- Queue Content -->
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
				<!-- SortableJS Grid Container -->
				<div class="h-full overflow-y-auto queue-scroll">
					<div 
						bind:this={containerElement}
						class="grid grid-cols-3 gap-2 auto-rows-max pb-4"
					>
						{#each queuedElementDetails as element (element.id)}
							<!-- Sortable Item -->
							<div 
								class="queue-item relative cursor-grab active:cursor-grabbing"
								data-id={element.id}
							>
								<!-- QueueCard - Clean and Simple -->
								<QueueCard 
									element={element} 
									theme={props.theme} 
								/>

								<!-- Remove Button - Outside the card -->
								<button
									class="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground
									       hover:bg-destructive/90 transition-colors z-20 shadow-sm flex items-center justify-center"
									onclick={(e) => handleRemove(element.id, e)}
									disabled={props.isProcessing}
									title="Remove from queue"
								>
									<X size={10} />
								</button>

								<!-- Element Name -->
								<p class="mt-0.5 w-full truncate text-center text-[0.5rem] text-muted-foreground">
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
	/* Hide scrollbar */
	.queue-scroll {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	
	.queue-scroll::-webkit-scrollbar {
		display: none;
	}

	/* SortableJS classes for drag feedback */
	:global(.queue-ghost) {
		opacity: 0.4;
	}

	:global(.queue-chosen) {
		transform: scale(1.05);
	}

	:global(.queue-drag) {
		transform: rotate(5deg);
		z-index: 1000;
	}

	:global(.queue-fallback) {
		opacity: 0.7;
		transform: scale(0.95);
	}

	/* Cursor feedback */
	.cursor-grab:hover {
		cursor: grab;
	}
	
	.cursor-grab:active {
		cursor: grabbing;
	}
</style>