<!-- $lib/features/addon/layout/TopBar.svelte -->
<script lang="ts">
	import { Info, Minimize2 } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import ModeToggle from '$lib/components/ui/mode-toggle.svelte';

	// Props instead of context - same UI state
	const props = $props<{
		zenMode: boolean;
		showInfo: boolean;
		onToggleZenMode: () => void;
		onToggleShowInfo: () => void;
	}>();
</script>

<div class="flex items-center justify-between py-2">
	<!-- Zen Mode Button -->
	<img src="/logos/pipewriter/pipewriter-square-logo.svg" alt=""
				class="w-5 h-5 ml-1">
	<div class="justify-middle flex items-center gap-2">
		<!-- Info Button -->
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 rounded-full p-1.5 {props.zenMode
				? 'bg-primary/10 text-primary'
				: 'text-muted-foreground'}"
			onclick={props.onToggleZenMode}
		>
			<Minimize2 class="h-4 w-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 rounded-full p-1.5 {props.showInfo
				? 'bg-primary/10 text-primary'
				: 'text-muted-foreground'}"
			onclick={props.onToggleShowInfo}
		>
			<Info class="h-4 w-4" />
		</Button>

		<!-- Mode Toggle -->
		<ModeToggle />
	</div>
</div>
