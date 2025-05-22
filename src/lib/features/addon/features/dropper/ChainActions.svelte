<!-- $lib/iframe/features/dropper/ChainActions.svelte -->
<script lang="ts">
	import { X, Plus } from '@lucide/svelte';
	import type { ElementTheme } from '$lib/data/addon/types';

	// Simplified props - only what we actually need
	const props = $props<{
		queuedElements?: string[];
		isProcessing?: boolean;
		onApplyQueue: () => void;
		onDiscardQueue: () => void;
	}>();

	// Safe access with defaults
	const queuedElements = props.queuedElements || [];
	const isProcessing = props.isProcessing || false;
</script>

<!-- Action Buttons -->
<div class="flex items-center gap-2">
	<!-- Clear/Reset Button -->
	<button
		class="h-6 w-6 rounded-full border-2 border-border/60
		       bg-background/80 backdrop-blur-sm
		       hover:bg-destructive/10 hover:border-destructive/60
		       hover:shadow-sm active:scale-95
		       text-muted-foreground hover:text-destructive
		       transition-all duration-150
		       disabled:opacity-50 disabled:cursor-not-allowed"
		onclick={props.onDiscardQueue}
		disabled={isProcessing || queuedElements.length === 0}
		title="Clear queue"
	>
		<X size={12} class="mx-auto" />
	</button>

	<!-- Drop Button -->
	<button
		class="h-6 w-6 rounded-full border-2 border-primary/60
		       bg-primary/10 backdrop-blur-sm
		       hover:bg-primary/20 hover:border-primary
		       hover:shadow-sm active:scale-95
		       text-primary hover:text-primary
		       transition-all duration-150
		       disabled:opacity-50 disabled:cursor-not-allowed"
		onclick={props.onApplyQueue}
		disabled={props.isProcessing || props.queuedElements.length === 0}
		title={`Drop ${props.queuedElements.length} elements`}
	>
		<Plus size={12} class="mx-auto" />
	</button>
</div>