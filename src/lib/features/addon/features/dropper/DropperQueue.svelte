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
	
	// Drag state
	let draggedIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

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

	// Handle remove element from queue
	function handleRemove(elementId: string, event?: MouseEvent) {
		if (event) {
			event.stopPropagation();
		}
		if (!props.isProcessing) {
			props.onRemoveFromQueue(elementId);
		}
	}

	// Drag and drop handlers
	function handleDragStart(event: DragEvent, index: number) {
		if (!event.dataTransfer) return;
		
		draggedIndex = index;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', index.toString());
	}

	function handleDragEnd(event: DragEvent) {
		draggedIndex = null;
		dragOverIndex = null;
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		dragOverIndex = index;
	}

	function handleDragLeave() {
		dragOverIndex = null;
	}

	function handleDrop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		
		if (draggedIndex === null || draggedIndex === dropIndex) {
			draggedIndex = null;
			dragOverIndex = null;
			return;
		}

		// Reorder the elements
		const newOrder = [...props.queuedElements];
		const draggedElement = newOrder[draggedIndex];
		
		// Remove dragged element
		newOrder.splice(draggedIndex, 1);
		
		// Insert at new position
		const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
		newOrder.splice(insertIndex, 0, draggedElement);

		// Call the reorder callback if provided
		if (props.onReorderQueue) {
			props.onReorderQueue(newOrder);
		}

		draggedIndex = null;
		dragOverIndex = null;
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
				<!-- Queued Elements Grid with Vertical Scroll -->
				<div class="h-full overflow-y-auto queue-scroll">
					<div class="grid grid-cols-3 gap-2 auto-rows-max pb-4">
						{#each queuedElementDetails as element, index (element.id)}
							{@const isBeingDragged = draggedIndex === index}
							{@const isDragTarget = dragOverIndex === index}
							
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								draggable="true"
								ondragstart={(e) => handleDragStart(e, index)}
								ondragend={handleDragEnd}
								ondragover={(e) => handleDragOver(e, index)}
								ondragleave={handleDragLeave}
								ondrop={(e) => handleDrop(e, index)}
								class={cn(
									"group relative flex-none cursor-grab active:cursor-grabbing",
									"transition-all duration-200 hover:scale-105",
									isBeingDragged && "opacity-50 scale-95",
									isDragTarget && "scale-110 z-10"
								)}
							>
								<!-- Scaled Element Card -->
								<div
									class="relative aspect-[4/2] overflow-hidden rounded-lg border border-border bg-background transition-all duration-200 hover:shadow-md"
								>
									<img
										src={getSvgUrl(element)}
										alt={element.description}
										class="h-full w-full object-cover"
										loading="lazy"
									/>


								<!-- Delete Button - High Z-Index -->
								</div>
								<button
									class="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground
																 hover:bg-destructive/90 active:scale-95 transition-all z-10 shadow-sm
																 flex items-center justify-center"
									onclick={(e) => handleRemove(element.id, e)}
									disabled={props.isProcessing}
									title="Remove from queue"
								>
									<X size={10} />
								</button>

								<!-- Element Name - Capitalized -->
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
		-ms-overflow-style: none;  /* Internet Explorer 10+ */
		scrollbar-width: none;  /* Firefox */
	}
	
	.queue-scroll::-webkit-scrollbar {
		display: none;  /* Safari and Chrome */
	}

	/* Smooth drag transitions */
	[draggable="true"] {
		transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
	}
	
	/* Cursor styles for drag feedback */
	.cursor-grab:hover {
		cursor: grab;
	}
	
	.cursor-grab:active {
		cursor: grabbing;
	}
</style>