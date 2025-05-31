<!-- src/lib/features/addon/AddOn.svelte -->
<script lang="ts">
	import * as Resizable from "$lib/components/ui/resizable";
	import { browser } from "$app/environment";
	
	import TopBar from "./layout/TopBar.svelte";
	import BottomBar from "./layout/BottomBar.svelte";
	// import Dropper from "./features/Dropper.svelte";          // TEMPORARILY COMMENTED
	// import DropperQueue from "./features/dropper/DropperQueue.svelte"; // TEMPORARILY COMMENTED
	// import Tabs from "./features/Tabs.svelte";                // TEMPORARILY COMMENTED
	import TrialBanner from "$lib/components/pricing/TrialBanner.svelte";
	
	import { getGoogleService } from "$lib/services/google/client";
	import { signOut } from '$lib/services/auth'; // Clean auth service
	
	// Accept server data as prop
	const { data } = $props();

	// SECURITY: Basic checks only
	if (!data.user || !data.showApp) {
		throw new Error('AddOn component rendered without proper authentication');
	}
	
	// Component state - SAME AS BEFORE
	let zenMode = $state(false);
	let showInfo = $state(false);
	let activeTab = $state(false);
	let showAboutModal = $state(false);
	let googleService = $state<any>(null);
	let dropperRef = $state<any>(null);
	let chainModeState = $state({ chainMode: false, queuedElements: [], queueCount: 0 });
	
	// Google service - same as before
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
	
	// Chain mode tracking - same as before
	$effect(() => {
		if (dropperRef && typeof dropperRef.getChainModeState === 'function') {
			chainModeState = dropperRef.getChainModeState();
		}
	});
	
	// Service context - same as before
	let serviceContext = $derived(() => ({ googleService }));
	
	// UI control functions - same as before
	function toggleShowInfo() {
		showInfo = !showInfo;
	}
	
	function toggleZenMode() {
		zenMode = !zenMode;
	}
	
	function toggleAboutModal() {
		showAboutModal = !showAboutModal;
	}
</script>

<main class="flex flex-col h-full overflow-hidden">
	<!-- TopBar with props -->
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
				<!-- TEMPORARILY PLACEHOLDER FOR DROPPER -->
				<div class="h-full flex flex-col items-center justify-center p-8 space-y-6">
					<div class="text-center space-y-4">
						<h2 class="text-xl font-semibold">Welcome, {data.user.displayName || data.user.email}</h2>
						
						{#if data.isPro}
							<div class="px-4 py-2 bg-primary/10 text-primary rounded-lg">
								✨ Pro User - All features unlocked
							</div>
						{:else if data.trialActive}
							<div class="px-4 py-2 bg-amber-500/10 text-amber-700 rounded-lg">
								🚀 Trial Active - {data.trialDaysLeft} days remaining
							</div>
						{:else}
							<div class="px-4 py-2 bg-muted text-muted-foreground rounded-lg">
								Free User - Limited features
							</div>
						{/if}
					</div>

					<div class="text-center space-y-2 text-sm text-muted-foreground">
						<p>Google service: {googleService ? '✅ Connected' : '⏳ Loading...'}</p>
						<p>Zen mode: {zenMode ? 'On' : 'Off'}</p>
						<p>Show info: {showInfo ? 'On' : 'Off'}</p>
					</div>

					<!-- PLACEHOLDER for Dropper -->
					<div class="border-2 border-dashed border-muted rounded-lg p-8 text-center">
						<p class="text-muted-foreground">Dropper component will be restored here</p>
						<p class="text-xs text-muted-foreground mt-2">
							After auth cleanup is complete
						</p>
					</div>
				</div>

				<!-- ORIGINAL DROPPER CODE (commented out)
				{#if googleService}
					<Dropper bind:this={dropperRef} context={serviceContext} />
				{:else}
					<div class="h-full flex items-center justify-center text-gray-400">
						<p>Loading Dropper...</p>
					</div>
				{/if}
				-->
			</Resizable.Pane>

			{#if !zenMode}
				<Resizable.Handle withHandle />
				<Resizable.Pane defaultSize={35} minSize={0}>
					<!-- PLACEHOLDER for DropperQueue -->
					<div class="h-full flex items-center justify-center border-t">
						<p class="text-sm text-muted-foreground">DropperQueue placeholder</p>
					</div>

					<!-- ORIGINAL QUEUE CODE (commented out)
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
					-->
				</Resizable.Pane>
			{/if}
		</Resizable.PaneGroup>
	</div>

	<!-- PLACEHOLDER for Tabs -->
	<div class="mb-2 px-2">
		<div class="h-12 border border-dashed border-muted rounded flex items-center justify-center">
			<span class="text-sm text-muted-foreground">Tabs component placeholder</span>
		</div>
	</div>

	<!-- ORIGINAL TABS CODE (commented out)
	<div class="mb-2 px-2">
		<Tabs context={serviceContext} />
	</div>
	-->

	<!-- TrialBanner with props -->
	<TrialBanner 
		isPro={data.isPro}
		trialActive={data.trialActive} 
		trialDaysLeft={data.trialDaysLeft}
	/>

	<!-- BottomBar with props -->
	<div class="px-2 border-t border-gray-200 dark:border-gray-700">
		<BottomBar 
			onToggleAboutModal={toggleAboutModal}
			user={data.user}
			isPro={data.isPro}
			trialActive={data.trialActive}
			trialDaysLeft={data.trialDaysLeft}
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