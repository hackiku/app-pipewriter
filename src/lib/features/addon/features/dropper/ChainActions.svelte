<!-- $lib/iframe/features/dropper/ChainActions.svelte -->

<script lang="ts">
	import { X, Play, XCircle } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import type { Element, ElementTheme } from '$lib/data/addon/types';
	// import { elementManager } from '$lib/data/addon/utils';

	const props = $props<{
		queuedElements: string[];
		theme: ElementTheme;
		isProcessing: boolean;
		onRemoveFromQueue: (elementId: string) => void;
		onApplyQueue: () => void;
		onDiscardQueue: () => void;
	}>();

</script>

		<!-- Action Buttons -->
		<div
			class="flex flex-none items-center justify-end gap-2"
		>
			<Button
				variant="outline"
				size="sm"
				onclick={props.onDiscardQueue}
				disabled={props.isProcessing || props.queuedElements.length === 0}
				class="h-7 text-xs"
			>
				<XCircle size={12} class="mr-1" />
				Clear
			</Button>

			<Button
				size="sm"
				onclick={props.onApplyQueue}
				disabled={props.isProcessing || props.queuedElements.length === 0}
				class="h-7 text-xs"
			>
				<Play size={12} class="mr-1" />
				Drop ({props.queuedElements.length})
			</Button>
		</div>
