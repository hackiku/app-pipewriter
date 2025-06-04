<!-- src/lib/features/addon/AddOn.svelte -->
<script lang="ts">
	import * as Resizable from "$lib/components/ui/resizable";
	import { browser } from "$app/environment";
	
	import TopBar from "./layout/TopBar.svelte";
	import BottomBar from "./layout/BottomBar.svelte";
	import Dropper from "./features/Dropper.svelte";
	import DropperQueue from "./features/dropper/DropperQueue.svelte";
	import Tabs from "./features/Tabs.svelte";
	import TrialBanner from "$lib/components/pricing/TrialBanner.svelte";
	
	import { getGoogleService } from "$lib/services/google/client";
	import { signOut } from '$lib/services/auth';

	// Enhanced interface for queue items
	interface QueueItem {
		id: string;
		theme: 'light' | 'dark';
	}

	// Accept server data as prop - NO CONTEXTS
	const { data } = $props();

	// SECURITY: Basic checks only
	if (!data.user || !data.showApp) {
		throw new Error('AddOn component rendered without proper authentication');
	}
	
	// Component state - ENHANCED with individual queue themes
	let zenMode = $state(false);
	let showInfo = $state(false);
	let googleService = $state<any>(null);
	let dropperRef = $state<any>(null);
	let chainModeState = $state<{ 
		chainMode: boolean; 
		queuedElements: string[];
		queuedItems?: QueueItem[];
		queueCount: number;
		theme: string;
	}>({ 
		chainMode: false, 
		queuedElements: [], 
		queuedItems: [],
		queueCount: 0,
		theme: 'light'
	});
	
	// Google service initialization
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
	
	// Chain mode tracking - ENHANCED to get queue items with themes
	$effect(() => {
		if (dropperRef && typeof dropperRef.getChainModeState === 'function') {
			const state = dropperRef.getChainModeState();
			const theme = dropperRef.getTheme ? dropperRef.getTheme() : 'light';
			chainModeState = { ...state, theme };
		}
	});
	
	// Service context for components that need Google service
	let serviceContext = $derived(() => ({ googleService }));
	
	// UI control functions
	function toggleShowInfo() {
		showInfo = !showInfo;
	}
	
	function toggleZenMode() {
		zenMode = !zenMode;
	}
	
	// Queue management functions - pass through to Dropper
	function handleRemoveFromQueue(elementId: string) {
		if (dropperRef && typeof dropperRef.removeFromQueue === 'function') {
			dropperRef.removeFromQueue(elementId);
		}
	}
	
	function handleApplyQueue() {
		if (dropperRef && typeof dropperRef.applyQueue === 'function') {
			dropperRef.applyQueue();
		}
	}
	
	function handleDiscardQueue() {
		if (dropperRef && typeof dropperRef.discardQueue === 'function') {
			dropperRef.discardQueue();
		}
	}
	
	function handleReorderQueue(newOrder: string[]) {
		if (dropperRef && typeof dropperRef.reorderQueue === 'function') {
			dropperRef.reorderQueue(newOrder);
		}
	}
</script>

<main class="flex flex-col h-full overflow-hidden">
	<!-- TopBar -->
	<section class="flex-none px-2">
		<TopBar 
			zenMode={zenMode}
			showInfo={showInfo}
			onToggleZenMode={toggleZenMode}
			onToggleShowInfo={toggleShowInfo}
		/>
	</section>
	<hr />

	<!-- FIXED: Isolated stacking context for resizable area -->
	<div class="flex-1 overflow-hidden resizable-container">
		<Resizable.PaneGroup direction="vertical" class="h-full">
			<Resizable.Pane defaultSize={55} minSize={30} maxSize={80}>
				<!-- Dropper with server data -->
				{#if googleService}
					<Dropper 
						bind:this={dropperRef} 
						context={serviceContext}
						elements={data.elements}
						userTier={data.userFeatures.tier}
						features={data.userFeatures.features}
						showInfo={showInfo}
					/>
				{:else}
					<div class="h-full flex items-center justify-center text-gray-400">
						<p>Loading Dropper...</p>
					</div>
				{/if}
			</Resizable.Pane>

			{#if !zenMode}
				<Resizable.Handle withHandle />
				<Resizable.Pane defaultSize={35} minSize={20} maxSize={60}>
					<!-- DropperQueue - ENHANCED with individual themes -->
					{#if chainModeState.chainMode}
						<DropperQueue 
							queuedElements={chainModeState.queuedElements}
							queuedItems={chainModeState.queuedItems}
							theme={chainModeState.theme}
							isProcessing={false}
							onRemoveFromQueue={handleRemoveFromQueue}
							onApplyQueue={handleApplyQueue}
							onDiscardQueue={handleDiscardQueue}
							onReorderQueue={handleReorderQueue}
						/>
					{/if}
				</Resizable.Pane>
			{/if}
		</Resizable.PaneGroup>
	</div>

	<!-- Tabs -->
	<div class="mb-2 px-2">
		<Tabs 
			context={serviceContext} 
			prompts={data.prompts}
			features={data.userFeatures.features}
		/>
	</div>

	<!-- TrialBanner -->
	<!-- <TrialBanner 
		isPro={data.userFeatures.isPro}
		trialActive={data.userFeatures.trialActive} 
		trialDaysLeft={data.userFeatures.trialDaysLeft}
	/> -->

	<!-- BottomBar -->
	<div class="px-2 border-t border-gray-200 dark:border-gray-700">
		<BottomBar 
			onToggleAboutModal={() => {}}
			user={data.user}
			isPro={data.userFeatures.isPro}
			trialActive={data.userFeatures.trialActive}
			trialDaysLeft={data.userFeatures.trialDaysLeft}
			onSignOut={signOut}
		/>
	</div>
</main>

<style>
	/* FIXED: Create isolated stacking context for resizable area */
	.resizable-container {
		/* Create new stacking context - isolates z-index within this container */
		isolation: isolate;
		position: relative;
		z-index: 0;
	}

	/* FIXED: Constrain resizable handle z-index to local context */
	:global(.resizable-container .resizable-handle) {
		/* Keep it above resizable content but below global UI */
		z-index: 10 !important;
		/* Remove global positioning conflicts */
		margin-bottom: 4rem;
	}

	/* Ensure resizable panes stay in local context */
	:global(.resizable-container [data-panel]) {
		z-index: 1;
	}

	/* Keep existing firebase warning hidden */
	:global(.firebase-emulator-warning) {
		display: none !important;
	}

	/* Optional: Debug stacking context boundaries in dev */
	/* .resizable-container {
		border: 1px dashed rgba(255, 0, 0, 0.2);
	} */
</style>