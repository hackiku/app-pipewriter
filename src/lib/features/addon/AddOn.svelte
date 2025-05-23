<!-- $lib/iframe/AddOn.svelte -->
<script lang="ts">
	import { fade, slide } from "svelte/transition";
	import { setContext } from "svelte";
	import * as Resizable from "$lib/components/ui/resizable";
	import { browser } from "$app/environment";

	import TopBar from "./layout/TopBar.svelte";
	import BottomBar from "./layout/BottomBar.svelte";
	import Dropper from "./features/Dropper.svelte";
	import DropperQueue from "./features/dropper/DropperQueue.svelte";
	import Tabs from "./features/Tabs.svelte"; 
	
	import TableTab from "./features/table/TableTab.svelte";
	
	import { getGoogleService } from "$lib/services/google/client";
	import type { GoogleAppsService } from "$lib/services/google/client";
	import TrialBanner from "$lib/components/trial/TrialBanner.svelte";
	
	// Component state with Runes
	let zenMode = $state(false);
	let showInfo = $state(false);
	let activeTab = $state(false);
	let showAboutModal = $state(false);

	// Google service client
	let googleService = $state<any>(null);

	// Dropper reference for accessing chain mode state
	let dropperRef = $state<any>(null);
	let chainModeState = $state({ chainMode: false, queuedElements: [], queueCount: 0 });

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

	// Watch for chain mode changes from Dropper
	$effect(() => {
		if (dropperRef && typeof dropperRef.getChainModeState === 'function') {
			chainModeState = dropperRef.getChainModeState();
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

	// Handle queue actions - pass through to Dropper
	function handleRemoveFromQueue(elementId: string) {
		// This will be handled by the DropperQueue component which communicates back to Dropper
	}

	function handleApplyQueue() {
		// This will be handled by the DropperQueue component which communicates back to Dropper  
	}

	function handleDiscardQueue() {
		// This will be handled by the DropperQueue component which communicates back to Dropper
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
			<Resizable.Pane defaultSize={chainModeState.chainMode ? 55 : 55} minSize={30} maxSize={80}>
				<!-- Only render Dropper if googleService is available -->
				{#if googleService}
					<Dropper bind:this={dropperRef} context={serviceContext} />
				{:else}
					<div class="h-full flex items-center justify-center text-gray-400">
						<p>Loading Dropper...</p>
					</div>
				{/if}
			</Resizable.Pane>

			{#if !zenMode}
				<Resizable.Handle
					withHandle
					class={activeTab || showAboutModal ? "z-0" : ""}
				/>
				<Resizable.Pane defaultSize={chainModeState.chainMode ? 35 : 35} minSize={0}>
					<div class="m-2 p-4 border">
						<TableTab />
					</div>
					{#if chainModeState.chainMode}
					<!-- TODO: stopped displaying when chainmode on. display nothing when offm but load back the TableTab commented out ) -->
					<!-- Show DropperQueue when chain mode is active -->
						<DropperQueue 
							queuedElements={chainModeState.queuedElements}
							theme="light"
							isProcessing={false}
							onRemoveFromQueue={handleRemoveFromQueue}
							onApplyQueue={handleApplyQueue}
							onDiscardQueue={handleDiscardQueue}
						/>
					{/if}
				</Resizable.Pane>
			{/if}
		</Resizable.PaneGroup>
	</div>

	<div class="mb-2 px-2">
		<Tabs context={serviceContext} />
	</div>

	<TrialBanner />

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