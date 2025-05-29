<!-- Fixed src/lib/features/addon/features/dropper/DropperQueue.svelte -->
<script lang="ts">
	import { X, Play, XCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
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
	}>();

	// Get element details for queued items - now using the new service
	let queuedElementDetails = $state<ElementWithAccess[]>([]);
	let loading = $state(false);

	// Load element details when queue changes
	$effect(async () => {
		if (props.queuedElements.length === 0) {
			queuedElementDetails = [];
			return;
		}

		loading = true;
		const elementPromises = props.queuedElements.map(id => 
			elementsService.getElementById(id, 'trial') // Use trial tier for queue display
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
		// Use the svgPath from the element (calculated by service)
		return element.svgPath;
	}

	// Handle remove element from queue
	function handleRemove(elementId: string) {
		if (!props.isProcessing) {
			props.onRemoveFromQueue(elementId);
		}
	}
</script>

<div class="flex h-full flex-col bg-background">
	<!-- Queue Content -->
	<div class="flex-1 p-2 space-y-3">
		<!-- Draggable Pad Container -->
		<div class="flex h-20 flex-col rounded-2xl border-2 border-dashed border-muted bg-muted/20 p-4">
			{#if props.queuedElements.length === 0}
				<!-- Empty State -->
				<div class="flex flex-1 items-center justify-center text-center">
					<p class="text-sm text-muted-foreground">No elements queued</p>
				</div>
			{:else if loading}
				<!-- Loading State -->
				<div class="flex flex-1 items-center justify-center">
					<div class="h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
				</div>
			{:else}
				<!-- Queued Elements -->
				<div class="flex flex-1 flex-col">
					<!-- Scrollable Elements Container -->
					<div class="flex-1 overflow-x-auto overflow-y-hidden py-2">
						<div class="flex gap-3 pb-2" style="min-width: max-content;">
							{#each queuedElementDetails as element (element.id)}
								<div class="group relative flex-none">
									<!-- Scaled Element Card -->
									<div
										class="relative h-14 w-20 overflow-hidden rounded-lg border border-border bg-background transition-all duration-200 hover:shadow-md"
									>
										<img
											src={getSvgUrl(element)}
											alt={element.description}
											class="h-full w-full object-cover"
											loading="lazy"
										/>

										<!-- Tier Badge -->
										<div class="absolute right-0.5 top-0.5">
											<div
												class="rounded-sm px-0.5 text-[0.35rem] font-medium opacity-80 {element
													.metadata?.tier === 'pro'
													? 'bg-primary/80 text-white'
													: 'bg-neutral-200/80 text-neutral-700 dark:bg-neutral-700/80 dark:text-neutral-200'}"
											>
												{element.metadata?.tier === 'pro' ? 'Pro' : element.metadata?.tier || 'Free'}
											</div>
										</div>

										<!-- Delete Button on Hover -->
										<button
											class="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground
                             opacity-0 transition-opacity duration-200 hover:bg-destructive/90
                             active:scale-95 group-hover:opacity-100"
											onclick={() => handleRemove(element.id)}
											disabled={props.isProcessing}
											title="Remove from queue"
										>
											<X size={10} class="mx-auto" />
										</button>
									</div>

									<!-- Element Name -->
									<p class="mt-1 w-20 truncate text-center text-[0.6rem] text-muted-foreground">
										{element.id.replace(/-/g, ' ')}
									</p>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar for horizontal scroll */
	.overflow-x-auto::-webkit-scrollbar {
		height: 4px;
	}

	.overflow-x-auto::-webkit-scrollbar-track {
		background: transparent;
	}

	.overflow-x-auto::-webkit-scrollbar-thumb {
		background: hsl(var(--muted-foreground) / 0.3);
		border-radius: 2px;
	}

	.overflow-x-auto::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground) / 0.5);
	}
</style>