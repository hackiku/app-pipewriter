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

	// Accept server data as prop - NO CONTEXTS
	const { data } = $props();

	// SECURITY: Basic checks only
	if (!data.user || !data.showApp) {
		throw new Error('AddOn component rendered without proper authentication');
	}
	
	// Component state - simple local state, no reactive stores
	let zenMode = $state(false);
	let showInfo = $state(false);
	let googleService = $state<any>(null);
	let dropperRef = $state<any>(null);
	let chainModeState = $state({ chainMode: false, queuedElements: [], queueCount: 0 });
	
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
	
	// Chain mode tracking
	$effect(() => {
		if (dropperRef && typeof dropperRef.getChainModeState === 'function') {
			chainModeState = dropperRef.getChainModeState();
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

	<div class="flex-1 overflow-hidden">
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
				<Resizable.Pane defaultSize={35} minSize={0}>
					<!-- DropperQueue -->
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

	<!-- Tabs -->
	<div class="mb-2 px-2">
		<Tabs 
			context={serviceContext} 
			prompts={data.prompts}
			features={data.userFeatures.features}
		/>
	</div>

	<!-- TrialBanner -->
	<TrialBanner 
		isPro={data.userFeatures.isPro}
		trialActive={data.userFeatures.trialActive} 
		trialDaysLeft={data.userFeatures.trialDaysLeft}
	/>

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
	:global(.resizable-handle) {
		margin-bottom: 4rem;
	}

	:global(.firebase-emulator-warning) {
		display: none !important;
	}
</style>