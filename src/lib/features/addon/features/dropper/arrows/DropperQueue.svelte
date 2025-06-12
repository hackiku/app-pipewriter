<!-- src/lib/features/addon/features/dropper/DropperQueue.svelte -->

<script lang="ts">
	import { X, ChevronUp, ChevronDown } from '@lucide/svelte';
	import QueueCard from './QueueCard.svelte';
	import type { ElementWithAccess, ElementTheme } from '$lib/types/elements';
	import { elementsService } from '$lib/services/data/elements';

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
	let selectedElementId = $state<string | null>(null); // NEW: Track selected element

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
			selectedElementId = null; // Clear selection when queue empties
			return;
		}

		// Set loading immediately
		loading = true;
		
		// Load elements asynchronously but don't await in effect
		loadElements(elements);
	});

	// Clear selection if selected element is removed
	$effect(() => {
		if (selectedElementId && !props.queuedElements.includes(selectedElementId)) {
			selectedElementId = null;
		}
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

	// Handle element selection for reordering
	function handleElementSelect(elementId: string) {
		if (props.isProcessing) return;
		
		// Toggle selection
		selectedElementId = selectedElementId === elementId ? null : elementId;
	}

	// Handle remove element from queue
	function handleRemove(elementId: string, event?: MouseEvent) {
		if (event) {
			event.stopPropagation();
			event.preventDefault();
		}
		if (!props.isProcessing) {
			// Clear selection if removing selected item
			if (selectedElementId === elementId) {
				selectedElementId = null;
			}
			
			// Also remove frozen theme
			frozenThemes.delete(elementId);
			props.onRemoveFromQueue(elementId);
		}
	}

	// Reorder functions
	function moveUp(elementId: string) {
		if (!props.onReorderQueue) return;
		
		const currentIndex = props.queuedElements.indexOf(elementId);
		if (currentIndex <= 0) return; // Already at top or not found
		
		const newOrder = [...props.queuedElements];
		[newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
		
		props.onReorderQueue(newOrder);
	}

	function moveDown(elementId: string) {
		if (!props.onReorderQueue) return;
		
		const currentIndex = props.queuedElements.indexOf(elementId);
		if (currentIndex >= props.queuedElements.length - 1 || currentIndex === -1) return; // Already at bottom or not found
		
		const newOrder = [...props.queuedElements];
		[newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
		
		props.onReorderQueue(newOrder);
	}

	// Check if element can move up/down
	function canMoveUp(elementId: string): boolean {
		return props.queuedElements.indexOf(elementId) > 0;
	}

	function canMoveDown(elementId: string): boolean {
		const index = props.queuedElements.indexOf(elementId);
		return index !== -1 && index < props.queuedElements.length - 1;
	}
</script>

<div class="flex h-full flex-col">
	<!-- Queue Content with matching scrollbar style -->
	<div class="flex-1 p-3 space-y-3">
		<!-- Touch-Friendly Queue Container -->
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
				<!-- Touch-Friendly Grid Container -->
				<div class="h-full overflow-y-auto scrollbar-none pb-4">
					<div class="grid grid-cols-3 gap-2 auto-rows-max">
						{#each queuedElementDetails as element (element.id)}
							{@const isSelected = selectedElementId === element.id}
							
							<!-- Touch-Friendly Queue Item -->
							<div 
								class="relative transition-all duration-200 ease-out"
								class:transform={isSelected}
								class:scale-105={isSelected}
								class:z-10={isSelected}
								class:shadow-lg={isSelected}
								class:cursor-pointer={!props.isProcessing}
								class:opacity-50={props.isProcessing}
								data-id={element.id}
								onclick={() => handleElementSelect(element.id)}
							>
								<!-- Selection Glow Effect -->
								{#if isSelected}
									<div class="absolute -inset-1 bg-primary/20 rounded-lg blur-sm"></div>
								{/if}

								<!-- QueueCard with FROZEN theme -->
								<div class="relative">
									<QueueCard 
										element={element} 
										theme={element.frozenTheme}
									/>

									<!-- Selection Border -->
									{#if isSelected}
										<div class="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"></div>
									{/if}
								</div>

								<!-- Remove Button - Enhanced when selected -->
								<button
									class="absolute transition-all duration-200 rounded-full bg-destructive text-destructive-foreground
									       hover:bg-destructive/90 shadow-sm flex items-center justify-center
									       disabled:pointer-events-none disabled:opacity-50"
									class:top-0.5={!isSelected}
									class:right-0.5={!isSelected}
									class:h-4={!isSelected}
									class:w-4={!isSelected}
									class:-top-1={isSelected}
									class:-right-1={isSelected}
									class:h-6={isSelected}
									class:w-6={isSelected}
									class:z-20={isSelected}
									onclick={(e) => handleRemove(element.id, e)}
									disabled={props.isProcessing}
									title="Remove from queue"
								>
									<X size={isSelected ? 14 : 10} />
								</button>

								<!-- Reorder Controls - Only show when selected -->
								{#if isSelected}
									<div class="absolute -left-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
										<!-- Move Up -->
										<button
											class="h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-md
											       hover:bg-primary/90 transition-all duration-200 flex items-center justify-center
											       disabled:opacity-50 disabled:cursor-not-allowed"
											onclick={(e) => { e.stopPropagation(); moveUp(element.id); }}
											disabled={props.isProcessing || !canMoveUp(element.id)}
											title="Move up in queue"
										>
											<ChevronUp size={12} />
										</button>

										<!-- Move Down -->
										<button
											class="h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-md
											       hover:bg-primary/90 transition-all duration-200 flex items-center justify-center
											       disabled:opacity-50 disabled:cursor-not-allowed"
											onclick={(e) => { e.stopPropagation(); moveDown(element.id); }}
											disabled={props.isProcessing || !canMoveDown(element.id)}
											title="Move down in queue"
										>
											<ChevronDown size={12} />
										</button>
									</div>
								{/if}

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

		<!-- Instructions (only show when items exist) -->
		{#if queuedElementDetails.length > 0 && !loading}
			<div class="text-center">
				<p class="text-xs text-muted-foreground">
					{selectedElementId ? 'Use arrows to reorder • Tap elsewhere to deselect' : 'Tap element to reorder'}
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

	/* Smooth hover effects for queue items */
	.cursor-pointer:not(.opacity-50):hover {
		transform: translateY(-1px);
	}

	/* Ensure selected item stays on top */
	.z-10 {
		z-index: 10;
	}

	.z-20 {
		z-index: 20;
	}
</style>