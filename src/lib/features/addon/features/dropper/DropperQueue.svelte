<!-- src/lib/features/addon/features/dropper/DropperQueue.svelte -->
<script lang="ts">
	import { X } from '@lucide/svelte';
	import { cn } from '$lib/utils';
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
	
	// Simplified drag state - just track what's being dragged
	let draggedElementId = $state<string | null>(null);

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

	// Function to get the correct image path
	function getSvgUrl(element: ElementWithAccess): string {
		return element.svgPath;
	}

	// Handle remove element from queue - simplified
	function handleRemove(elementId: string) {
		if (!props.isProcessing) {
			props.onRemoveFromQueue(elementId);
		}
	}

	// Simplified drag handlers
	function handleDragStart(event: DragEvent, elementId: string) {
		if (!event.dataTransfer) return;
		
		draggedElementId = elementId;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', elementId);
		
		// Simple visual feedback
		if (event.target instanceof HTMLElement) {
			event.target.style.opacity = '0.5';
		}
	}

	function handleDragEnd(event: DragEvent) {
		draggedElementId = null;
		
		// Reset visual feedback
		if (event.target instanceof HTMLElement) {
			event.target.style.opacity = '';
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault(); // Allow drop
	}

	function handleDrop(event: DragEvent, dropElementId: string) {
		event.preventDefault();
		
		if (!draggedElementId || draggedElementId === dropElementId) {
			return;
		}

		// Find current positions
		const draggedIndex = props.queuedElements.indexOf(draggedElementId);
		const dropIndex = props.queuedElements.indexOf(dropElementId);
		
		if (draggedIndex === -1 || dropIndex === -1) return;

		// Create new order
		const newOrder = [...props.queuedElements];
		
		// Remove dragged element
		newOrder.splice(draggedIndex, 1);
		
		// Insert at new position
		const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
		newOrder.splice(insertIndex, 0, draggedElementId);

		// Call reorder callback
		if (props.onReorderQueue) {
			props.onReorderQueue(newOrder);
		}

		draggedElementId = null;
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
				<!-- Simplified Grid with Scroll -->
				<div class="h-full overflow-y-auto queue-scroll">
					<div class="grid grid-cols-3 gap-2 auto-rows-max pb-4">
						{#each queuedElementDetails as element (element.id)}
							<!-- Single draggable wrapper - no complex nesting -->
							<div
								class="relative group cursor-grab active:cursor-grabbing"
								draggable="true"
								ondragstart={(e) => handleDragStart(e, element.id)}
								ondragend={handleDragEnd}
								ondragover={handleDragOver}
								ondrop={(e) => handleDrop(e, element.id)}
							>
								<!-- Element Card -->
								<div class="relative aspect-[4/2] overflow-hidden rounded-lg border border-border bg-background hover:shadow-md transition-shadow">
									<img
										src={getSvgUrl(element)}
										alt={element.description}
										class="h-full w-full object-cover"
										loading="lazy"
									/>
								</div>

								<!-- Remove Button - Outside the card -->
								<button
									class="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground
									       hover:bg-destructive/90 transition-colors z-10 shadow-sm flex items-center justify-center"
									onclick={() => handleRemove(element.id)}
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
	/* Hide scrollbar completely */
	.queue-scroll {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	
	.queue-scroll::-webkit-scrollbar {
		display: none;
	}

	/* Simple cursor feedback */
	.cursor-grab:hover {
		cursor: grab;
	}
	
	.cursor-grab:active {
		cursor: grabbing;
	}
</style>