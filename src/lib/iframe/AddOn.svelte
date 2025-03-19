<!-- $lib/iframe/AddOn.svelte -->
<script lang="ts">
	import { fade, slide } from "svelte/transition";
	import { getContext } from "svelte";
	import * as Resizable from "$lib/components/ui/resizable";
	import { browser } from "$app/environment";

	import TopBar from "./layout/TopBar.svelte";
	import BottomBar from "./layout/BottomBar.svelte";
	import Dropper from "./features/Dropper.svelte";
	import Tabs from "./features/Tabs.svelte";
	import { GoogleAppsService } from "$lib/services/google/client";

	// Component state with Runes
	let zenMode = $state(false);
	let activeTab = $state(false);
	let showAboutModal = $state(false);

	// Google Apps Service client
	let googleService = $state<any>(null);

	// Initialize Google Apps Service client
	$effect(() => {
		if (browser) {
			googleService = GoogleAppsService.getInstance(5000);
		}
	});

	// Create context for child components
	let context = $derived(() => ({
		googleService,
	}));

	// Cleanup on destroy
	$effect(() => {
		return () => {
			if (browser && googleService) {
				googleService.destroy();
			}
		};
	});

	// Toggle modal visibility
	function toggleAboutModal() {
		showAboutModal = !showAboutModal;
	}

	// Toggle zen mode
	function toggleZenMode() {
		zenMode = !zenMode;
	}
</script>

<main class="flex flex-col h-full overflow-hidden">
	<section class="flex-none px-2">
		<TopBar {zenMode} onToggleZenMode={toggleZenMode} />
	</section>
	<hr />

	<div class="flex-1 overflow-hidden">
		<Resizable.PaneGroup
			direction="vertical"
			class="h-full {activeTab ? 'z-0' : 'z-10'}"
		>
			<Resizable.Pane defaultSize={55} minSize={30} maxSize={80}>
				<!-- Only render Dropper if googleService is available -->
				{#if googleService}
					<Dropper {context} />
				{:else}
					<div class="h-full flex items-center justify-center text-gray-400">
						<p>Loading Dropper component...</p>
					</div>
				{/if}
			</Resizable.Pane>

			{#if !zenMode}
				<Resizable.Handle
					withHandle
					class={activeTab || showAboutModal ? "z-0" : ""}
				/>
				<Resizable.Pane defaultSize={30} minSize={0}>
					<!-- Placeholder for future pane content -->
				</Resizable.Pane>
			{/if}
		</Resizable.PaneGroup>
	</div>

	<div class="mb-2 px-2">
		<Tabs {context} />
	</div>

	<div class="px-2 border-t border-gray-200 dark:border-gray-700">
		<BottomBar onToggleAboutModal={toggleAboutModal} />
	</div>
</main>

<style>
	:global(.resizable-handle) {
		margin-bottom: 4rem;
	}
</style>