<!-- $lib/iframe/AddOn.svelte -->
<script lang="ts">
	import { fade, slide } from "svelte/transition";
	import { setContext } from "svelte";
	import * as Resizable from "$lib/components/ui/resizable";
	import { browser } from "$app/environment";

	import TopBar from "./layout/TopBar.svelte";
	import BottomBar from "./layout/BottomBar.svelte";
	import Dropper from "./features/Dropper.svelte";
	// import TableProperties from "./features/TableProperties.svelte";
	import Tabs from "./features/Tabs.svelte";
	import { getGoogleService } from "$lib/services/google/client";
	import type { GoogleAppsService } from "$lib/services/google/client";
	
	// Component state with Runes
	let zenMode = $state(false);
	let showInfo = $state(false);
	let activeTab = $state(false);
	let showAboutModal = $state(false);

	// Google service client
	let googleService = $state<any>(null);

	// Initialize Google service client
	$effect(() => {
		if (browser) {
			try {
				googleService = getGoogleService(5000);
				console.log("Google service initialized");
			} catch (error) {
				console.error("Failed to initialize Google service:", error);
			}
		}
	});

	// Set up context for UI state access by all child components
	setContext('uiState', {
		// Getter functions allow accessing the latest state
		get showInfo() { return showInfo; },
		get zenMode() { return zenMode; },
		// Methods to modify state
		toggleShowInfo: () => { 
			showInfo = !showInfo; 
			console.log('showInfo toggled to:', showInfo);
		},
		toggleZenMode: () => { 
			zenMode = !zenMode; 
			console.log('zenMode toggled to:', zenMode);
		}
	});

	// Create context for service instances
	let serviceContext = $derived(() => ({
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
</script>

<main class="flex flex-col h-full overflow-hidden">
	<section class="flex-none px-2">
		<TopBar />
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
					<Dropper context={serviceContext} />
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
					<!-- <TableProperties /> -->
				</Resizable.Pane>
			{/if}
		</Resizable.PaneGroup>
	</div>

	<!-- <TableProperties /> -->

	<div class="mb-2 px-2">
		<Tabs context={serviceContext} />
	</div>

	<div class="px-2 border-t border-gray-200 dark:border-gray-700">
		<BottomBar onToggleAboutModal={toggleAboutModal} />
	</div>
</main>

<style>
	:global(.resizable-handle) {
		margin-bottom: 4rem;
	}

	:global(.firebase-emulator-warning) {
			display: none !important;
		}
</style>