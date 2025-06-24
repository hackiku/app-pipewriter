<!-- $lib/features/addon/layout/TopBar.svelte -->
<script lang="ts">
	import { Info, Minimize2 } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import ModeToggle from '$lib/components/ui/mode-toggle.svelte';
	import AppAbout from './AppAbout.svelte';

	// Props - now includes about modal functionality
	const props = $props<{
		zenMode: boolean;
		showInfo: boolean;
		onToggleZenMode: () => void;
		onToggleShowInfo: () => void;
	}>();

	// Local state for about modal
	let showAboutModal = $state(false);
	
	function toggleAboutModal() {
		showAboutModal = !showAboutModal;
	}
</script>

<div class="flex items-center justify-between py-2">
	<!-- Clickable Logo -->
	<button
		class="flex items-center justify-center p-1 rounded-md ml-0.5 
		       transition-all duration-200 ease-out
		       hover:bg-accent/50 hover:scale-105 
		       active:scale-95 active:bg-accent/70
		       focus:outline-none focus:ring-2 focus:ring-primary/20"
		onclick={toggleAboutModal}
		title="About Pipewriter"
	>
		<img 
			src="/logos/pipewriter/pipewriter-square-logo.svg" 
			alt="Pipewriter"
			class="w-5 h-5 transition-opacity duration-200 hover:opacity-80"
		>
	</button>

	<div class="justify-middle flex items-center gap-1">
		<!-- Zen Mode Button -->
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 rounded-full p-1.5 {props.zenMode
				? 'bg-primary/10 text-primary'
				: 'text-muted-foreground'}"
			onclick={props.onToggleZenMode}
			title="Zen mode"
		>
			<Minimize2 class="h-4 w-4" />
		</Button>

		<!-- Info Toggle Button -->
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 rounded-full p-1.5 {props.showInfo
				? 'bg-primary/10 text-primary'
				: 'text-muted-foreground'}"
			onclick={props.onToggleShowInfo}
			title="Show element info"
		>
			<Info class="h-4 w-4" />
		</Button>

		<!-- Mode Toggle -->
		<ModeToggle />
	</div>

	<!-- AppAbout Modal (moved from BottomBar) -->
	<AppAbout 
		showAboutModal={showAboutModal}
		onToggleAboutModal={toggleAboutModal}
	/>
</div>