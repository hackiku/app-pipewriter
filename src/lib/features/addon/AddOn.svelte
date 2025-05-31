<!-- src/lib/features/addon/AddOn.svelte -->
<script lang="ts">
	import { setContext } from "svelte";
	import * as Resizable from "$lib/components/ui/resizable";
	import { browser } from "$app/environment";
	
	import TopBar from "./layout/TopBar.svelte";
	import BottomBar from "./layout/BottomBar.svelte";
	import Dropper from "./features/Dropper.svelte";
	import DropperQueue from "./features/dropper/DropperQueue.svelte";
	import Tabs from "./features/Tabs.svelte";
	import TrialBanner from "$lib/components/pricing/TrialBanner.svelte";
	
	import { getGoogleService } from "$lib/services/google/client";
	import { createUserContext } from "$lib/context/user.svelte";
	
	// Accept server data as prop
	const { data } = $props();

	// SECURITY: Double-check authentication at component level
	if (!data.user || !data.showApp) {
		throw new Error('AddOn component rendered without proper authentication');
	}
	
	// SECURITY: Verify required data exists (match actual data structure)
	if (!data.features || typeof data.isPro !== 'boolean' || typeof data.trialActive !== 'boolean') {
		console.error('AddOn: Missing required user data', data);
		throw new Error('AddOn component missing required user data');
	}
	
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
	
	// Create user context from server data (now guaranteed to be valid)
	const userContext = createUserContext(data);
	
	// Set context for child components
	setContext('userContext', userContext);
	
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
		get showInfo() { return showInfo; },
		get zenMode() { return zenMode; },
		toggleShowInfo: () => { 
			showInfo = !showInfo; 
		},
		toggleZenMode: () => { 
			zenMode = !zenMode; 
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
		// This will be handled by the DropperQueue component
	}
	
	function handleApplyQueue() {
		// This will be handled by the DropperQueue component  
	}
	
	function handleDiscardQueue() {
		// This will be handled by the DropperQueue component
	}
</script>

<!-- Only render if we have valid data -->
{#if data.user && data.features}
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
						{#if chainModeState.chainMode}
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
{:else}
	<!-- This should never render due to server guards, but just in case -->
	<div class="h-full flex items-center justify-center">
		<div class="text-red-500 text-sm">
			Security Error: Invalid app state
		</div>
	</div>
{/if}

<style>
	:global(.resizable-handle) {
		margin-bottom: 4rem;
	}

	:global(.firebase-emulator-warning) {
		display: none !important;
	}
</style>