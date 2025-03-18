<!-- $lib/iframe/AddOn.svelte -->
<script lang="ts">
	import { fade, slide } from "svelte/transition";
	import * as Resizable from "$lib/components/ui/resizable";
	import { browser } from "$app/environment";

	import TopBar from "./layout/TopBar.svelte";
	import BottomBar from "./layout/BottomBar.svelte";
	import AppAbout from "./layout/AppAbout.svelte";
	import Dropper from "./features/Dropper.svelte";
	import Tabs from "./features/Tabs.svelte";
	import { AppsScriptClient } from "./utils/appsScript";

	// Component state with Runes
	let zenMode = $state(false);
	let activeTab = $state(false);
	let showAboutModal = $state(false);

	// AppsScript client
	let appsScript = $state<any>(null);

	// Initialize AppsScript client
	$effect(() => {
		if (browser) {
			appsScript = AppsScriptClient.getInstance(5000);
		}
	});

	// Create context for child components
	let context = $derived(() => ({
		appsScript,
	}));

	// Cleanup on destroy
	$effect(() => {
		return () => {
			if (browser && appsScript) {
				appsScript.destroy();
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
				<!-- Only render Dropper if appsScript is available -->
				{#if appsScript}
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
