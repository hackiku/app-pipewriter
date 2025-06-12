// src/lib/features/addon/features/dropper/useNativeDrag.svelte.ts
// Native HTML5 Drag & Drop replacement for SortableJS

interface DragOptions {
	animation?: number;
	ghostClass?: string;
	chosenClass?: string;
	dragClass?: string;
	forceFallback?: boolean;
	fallbackClass?: string;
	fallbackOnBody?: boolean;
	swapThreshold?: number;
	scroll?: boolean;
	scrollSensitivity?: number;
	scrollSpeed?: number;
	bubbleScroll?: boolean;
	disabled?: boolean;
	handle?: string;
	onStart?: (evt: DragEvent & { oldIndex?: number }) => void;
	onEnd?: (evt: DragEvent & { oldIndex?: number; newIndex?: number }) => void;
}

interface DragState {
	draggedElement: HTMLElement | null;
	draggedIndex: number;
	containerElement: HTMLElement | null;
	placeholder: HTMLElement | null;
}

export const useNativeDrag = (
	getter: () => HTMLElement | null,
	options: DragOptions = {}
) => {
	let dragState = $state<DragState>({
		draggedElement: null,
		draggedIndex: -1,
		containerElement: null,
		placeholder: null
	});

	let lastElement: HTMLElement | null = null;
	let isDestroyed = false;

	// Setup drag listeners on container element
	$effect(() => {
		const currentElement = getter();

		if (isDestroyed || currentElement === lastElement) return;

		// Cleanup previous listeners
		cleanup();

		if (currentElement) {
			lastElement = currentElement;
			dragState.containerElement = currentElement;
			setupDragListeners(currentElement);
		} else {
			lastElement = null;
			dragState.containerElement = null;
		}
	});

	function setupDragListeners(container: HTMLElement) {
		// Make all queue items draggable
		const updateDraggableItems = () => {
			const items = container.querySelectorAll('.queue-item');
			items.forEach((item: HTMLElement, index) => {
				item.draggable = !options.disabled;
				item.dataset.dragIndex = index.toString();

				// Remove existing listeners to avoid duplicates
				item.removeEventListener('dragstart', handleDragStart);
				item.removeEventListener('dragend', handleDragEnd);

				// Add drag listeners
				item.addEventListener('dragstart', handleDragStart);
				item.addEventListener('dragend', handleDragEnd);
			});
		};

		// Setup drop zone listeners on container
		container.addEventListener('dragover', handleDragOver);
		container.addEventListener('dragenter', handleDragEnter);
		container.addEventListener('drop', handleDrop);
		container.addEventListener('dragleave', handleDragLeave);

		// Initial setup and observe for changes
		updateDraggableItems();

		// Watch for DOM changes (new items added/removed)
		const observer = new MutationObserver(updateDraggableItems);
		observer.observe(container, { childList: true, subtree: true });

		// Store cleanup function
		container._dragCleanup = () => {
			observer.disconnect();
			container.removeEventListener('dragover', handleDragOver);
			container.removeEventListener('dragenter', handleDragEnter);
			container.removeEventListener('drop', handleDrop);
			container.removeEventListener('dragleave', handleDragLeave);

			// Clean up item listeners
			const items = container.querySelectorAll('.queue-item');
			items.forEach((item: HTMLElement) => {
				item.removeEventListener('dragstart', handleDragStart);
				item.removeEventListener('dragend', handleDragEnd);
			});
		};
	}

	function handleDragStart(e: DragEvent) {
		if (options.disabled) {
			e.preventDefault();
			return;
		}

		const target = e.currentTarget as HTMLElement;
		const index = parseInt(target.dataset.dragIndex || '0');

		dragState.draggedElement = target;
		dragState.draggedIndex = index;

		// Set drag data
		e.dataTransfer!.effectAllowed = 'move';
		e.dataTransfer!.setData('text/html', target.outerHTML);
		e.dataTransfer!.setData('text/plain', index.toString());

		// Apply visual states
		target.classList.add(options.chosenClass || 'drag-chosen');
		document.body.classList.add('native-dragging');

		// Create drag image (optional - browser default is usually fine)
		if (options.dragClass) {
			target.classList.add(options.dragClass);
			setTimeout(() => target.classList.remove(options.dragClass!), 0);
		}

		// Call onStart callback
		options.onStart?.(e as any);

		console.log('🎯 Drag started:', { index, element: target.dataset.id });
	}

	function handleDragOver(e: DragEvent) {
		if (!dragState.draggedElement) return;

		e.preventDefault();
		e.dataTransfer!.dropEffect = 'move';

		const container = dragState.containerElement!;
		const afterElement = getDragAfterElement(container, e.clientY);

		// Create or move placeholder
		if (!dragState.placeholder) {
			dragState.placeholder = createPlaceholder();
		}

		if (afterElement == null) {
			container.appendChild(dragState.placeholder);
		} else {
			container.insertBefore(dragState.placeholder, afterElement);
		}
	}

	function handleDragEnter(e: DragEvent) {
		if (!dragState.draggedElement) return;
		e.preventDefault();
	}

	function handleDragLeave(e: DragEvent) {
		// Only remove placeholder if we're leaving the container entirely
		const container = dragState.containerElement!;
		if (!container.contains(e.relatedTarget as Node)) {
			dragState.placeholder?.remove();
			dragState.placeholder = null;
		}
	}

	function handleDrop(e: DragEvent) {
		if (!dragState.draggedElement || !dragState.placeholder) return;

		e.preventDefault();

		const container = dragState.containerElement!;
		const items = Array.from(container.querySelectorAll('.queue-item:not(.drag-placeholder)'));
		const placeholderIndex = Array.from(container.children).indexOf(dragState.placeholder);

		// Calculate new index (account for placeholder position)
		let newIndex = placeholderIndex;
		if (placeholderIndex > dragState.draggedIndex) {
			newIndex--; // Adjust for removed original element
		}

		console.log('🎯 Drop:', {
			oldIndex: dragState.draggedIndex,
			newIndex,
			placeholderIndex
		});

		// Call onEnd callback with indices
		const dragEndEvent = e as any;
		dragEndEvent.oldIndex = dragState.draggedIndex;
		dragEndEvent.newIndex = newIndex;
		options.onEnd?.(dragEndEvent);

		// Cleanup
		cleanupDrag();
	}

	function handleDragEnd(e: DragEvent) {
		console.log('🎯 Drag ended');
		cleanupDrag();
	}

	function getDragAfterElement(container: HTMLElement, y: number): Element | null {
		const draggableElements = Array.from(
			container.querySelectorAll('.queue-item:not(.drag-chosen):not(.drag-placeholder)')
		);

		return draggableElements.reduce((closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;

			if (offset < 0 && offset > closest.offset) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
		}, { offset: Number.NEGATIVE_INFINITY, element: null as Element | null }).element;
	}

	function createPlaceholder(): HTMLElement {
		const placeholder = document.createElement('div');
		placeholder.className = `drag-placeholder ${options.ghostClass || 'queue-ghost'}`;
		placeholder.style.height = dragState.draggedElement?.offsetHeight + 'px';
		placeholder.style.margin = '0.5rem';
		placeholder.style.opacity = '0.3';
		placeholder.style.border = '2px dashed var(--border)';
		placeholder.style.borderRadius = '0.5rem';
		placeholder.style.backgroundColor = 'var(--muted)';
		return placeholder;
	}

	function cleanupDrag() {
		// Remove visual states
		dragState.draggedElement?.classList.remove(
			options.chosenClass || 'drag-chosen',
			options.dragClass || 'drag-drag'
		);

		// Remove placeholder
		dragState.placeholder?.remove();

		// Remove body class
		document.body.classList.remove('native-dragging');

		// Reset state
		dragState.draggedElement = null;
		dragState.draggedIndex = -1;
		dragState.placeholder = null;
	}

	function cleanup() {
		if (lastElement && lastElement._dragCleanup) {
			lastElement._dragCleanup();
			delete lastElement._dragCleanup;
		}
		cleanupDrag();
	}

	// Return cleanup function
	return () => {
		isDestroyed = true;
		cleanup();
	};
};

// Reorder function - same interface as SortableJS version
export function reorder<T>(
	array: T[],
	evt: { oldIndex?: number; newIndex?: number }
): T[] {
	const { oldIndex, newIndex } = evt;

	if (oldIndex === undefined || newIndex === undefined) {
		return [...array];
	}
	if (newIndex === oldIndex) {
		return [...array];
	}

	// Create a copy and reorder
	const workArray = [...array];
	const [movedItem] = workArray.splice(oldIndex, 1);
	workArray.splice(newIndex, 0, movedItem);

	return workArray;
}

// TypeScript module augmentation for cleanup function
declare global {
	interface HTMLElement {
		_dragCleanup?: () => void;
	}
}