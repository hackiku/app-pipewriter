// src/lib/features/addon/features/dropper/useSortable.svelte.ts - STABLE VERSION

import Sortable from 'sortablejs';

export const useSortable = (
	getter: () => HTMLElement | null,
	options?: Sortable.Options
) => {
	let sortableInstance: Sortable | null = null;
	let lastElement: HTMLElement | null = null;
	let isDestroyed = false;

	// STABLE: Only recreate when the actual DOM element changes, not on every reactive update
	$effect(() => {
		const currentElement = getter();

		// Skip if we're in the middle of destruction
		if (isDestroyed) return;

		// Only recreate if the actual DOM element changed
		if (currentElement === lastElement) return;

		// Clean up previous instance
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}

		// Create new instance if we have an element
		if (currentElement) {
			lastElement = currentElement;

			// CRITICAL: Add delay to ensure DOM is stable
			const timeoutId = setTimeout(() => {
				if (!isDestroyed && currentElement === lastElement) {
					sortableInstance = Sortable.create(currentElement, {
						...options,
						// ENHANCED: Better drag prevention during loading
						onStart: (evt) => {
							// Check if parent component is in loading state
							const queueContainer = currentElement.closest('[data-queue-loading]');
							if (queueContainer?.getAttribute('data-queue-loading') === 'true') {
								evt.preventDefault();
								return false;
							}
							options?.onStart?.(evt);
						}
					});
				}
			}, 50); // Small delay for DOM stability

			// Cleanup timeout if effect runs again
			return () => {
				clearTimeout(timeoutId);
			};
		} else {
			lastElement = null;
		}
	});

	// ENHANCED: Cleanup on component destroy
	return () => {
		isDestroyed = true;
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}
		lastElement = null;
	};
};

export function reorder<T>(
	array: T[],
	evt: Sortable.SortableEvent
): T[] {
	// STABLE: Create a plain array copy, not reactive snapshot
	const workArray = [...array];

	// Get changes
	const { oldIndex, newIndex } = evt;

	if (oldIndex === undefined || newIndex === undefined) {
		return workArray;
	}
	if (newIndex === oldIndex) {
		return workArray;
	}

	// OPTIMIZED: Use splice for better performance
	const [movedItem] = workArray.splice(oldIndex, 1);
	workArray.splice(newIndex, 0, movedItem);

	return workArray;
}