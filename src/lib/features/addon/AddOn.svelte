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
	import { iframeSignOut } from '$lib/services/firebase/iframe-auth';
	
	// Accept server data as prop
	const { data } = $props();

	// SECURITY: Basic checks only
	if (!data.user || !data.showApp) {
		throw new Error('AddOn component rendered without proper authentication');
	}
	
	// Component state
	let zenMode = $state(false);
	let showInfo = $state(false);
	let activeTab = $state(false);
	let showAboutModal = $state(false);
	let googleService = $state<any>(null);
	let dropperRef = $state<any>(null);
	let chainModeState = $state({ chainMode: false, queuedElements: [], queueCount: 0 });
	
	// SIMPLE context - just hold server data, no complex reactivity
	setContext('userData', {
		user: data.user,
		isPro: data.isPro,
		trialActive: data.trialActive,
		trialDaysLeft: data.trialDaysLeft,
		features: data.features,
		signOut: iframeSignOut // Simple logout function
	});
	
	// UI state context
	setContext('uiState', {
		get showInfo() { return showInfo; },
		get zenMode() { return zenMode; },
		toggleShowInfo: () => { showInfo = !showInfo; },
		toggleZenMode: () => { zenMode = !zenMode; }
	});
	
	// Google service
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
	
	// Chain mode tracking
	$effect(() => {
		if (dropperRef && typeof dropperRef.getChainModeState === 'function') {
			chainModeState = dropperRef.getChainModeState();
		}
	});
	
	// Service context
	let serviceContext = $derived(() => ({ googleService }));
	
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
		<Resizable.PaneGroup direction="vertical" class="h-full">
			<Resizable.Pane defaultSize={55} minSize={30} maxSize={80}>
				{#if googleService}
					<Dropper bind:this={dropperRef} context={serviceContext} />
				{:else}
					<div class="h-full flex items-center justify-center text-gray-400">
						<p>Loading Dropper...</p>
					</div>
				{/if}
			</Resizable.Pane>

			{#if !zenMode}
				<Resizable.Handle withHandle />
				<Resizable.Pane defaultSize={35} minSize={0}>
					{#if chainModeState.chainMode}
						<DropperQueue 
							queuedElements={chainModeState.queuedElements}
							theme="light"
							isProcessing={false}
							onRemoveFromQueue={() => {}}
							onApplyQueue={() => {}}
							onDiscardQueue={() => {}}
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