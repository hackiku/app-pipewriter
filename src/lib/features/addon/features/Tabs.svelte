<!-- $lib/iframe/features/Tabs.svelte -->
<script lang="ts">
	import { fade } from "svelte/transition";
	import { getContext } from "svelte";
	// Import components
	import { Button } from "$lib/components/ui/button";
	import {
		Table,
		Palette,
		Type,
		Code,
		X,
		Loader2,
		ThumbsUp,
		AlertCircle,
	} from "lucide-svelte";
	// import { cn } from "$lib/utils";

	// Import tab components
	import TableTab from "./table/TableTab.svelte";
	import ColorTab from "./colors/ColorTab.svelte";
	import TextTab from "./text/TextTab.svelte";
	import AiTab from "./ai/AiTab.svelte";

	// Props
	const { context } = $props<{ context: any }>();

	// Get UI state from context
	const uiState = getContext("uiState");

	// Local state
	let activeTab = $state<string | null>(null);
	let isProcessing = $state(false);
	let status = $state<{
		type: "processing" | "success" | "error";
		message: string;
		details?: string;
		executionTime?: number;
		error?: any;
	} | null>(null);
	let statusTimeout = $state<number | null>(null);

	const BG_STYLE = "bg-neutral-50 dark:bg-neutral-900";

	// Tab definitions
	const tabs = {
		table: {
			icon: Table,
			title: "Table Editor",
			description: "Edit currently selected table",
			component: TableTab,
		},
		color: {
			icon: Palette,
			title: "Background Color",
			description: "Change document background color",
			component: ColorTab,
		},
		ai: {
			icon: Code,
			title: "AI Assistant",
			description: "Convert formats and generate content",
			component: AiTab,
		},
		text: {
			icon: Type,
			title: "Text Formatting",
			description: "Format text and update styles",
			component: TextTab,
		},
	};

	// Handle status updates
	function handleStatus(newStatus: typeof status) {
		status = newStatus;

		if (status && status.type !== "processing") {
			clearStatusTimeout();
			statusTimeout = window.setTimeout(() => {
				status = null;
			}, 3000) as unknown as number;
		}
	}

	// Toggle active tab
	function toggleTab(tab: string) {
		activeTab = activeTab === tab ? null : tab;
	}

	// Clean up timeouts
	function clearStatusTimeout() {
		if (statusTimeout) {
			clearTimeout(statusTimeout);
			statusTimeout = null;
		}
	}

	// Use $effect for cleanup instead of onDestroy
	$effect(() => {
		// Cleanup when component is destroyed
		return () => {
			clearStatusTimeout();
		};
	});

	// Function to generate button class based on active state
	function getButtonClass(tab: string) {
		return activeTab === tab
			? `transition-all duration-200 relative z-10 w-10 h-11 __h-[calc(3rem+1px)] rounded-b-full ${BG_STYLE}
         border-b border-l border-r border-neutral-300 dark:border-neutral-700
         after:content-[''] after:absolute after:top-[-1px] 
         after:left-0 after:right-0 after:h-[1px] after:bg-inherit`
			: "transition-all duration-200 relative z-10 w-10 h-10 rounded-full mt-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600";
	}

	let activeTabData = $derived(activeTab ? tabs[activeTab] : null);

	function handleProcessingStart() {
		isProcessing = true;
	}

	function handleProcessingEnd() {
		isProcessing = false;
	}
</script>

<div class="flex flex-col w-full relative">
	<!-- Status Bar -->
	{#if status}
		<div
			class="absolute top-0 left-0 right-0 z-50"
			transition:fade={{ duration: 150 }}
		>
			<div
				class="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 shadow-sm"
			>
				<div class="h-8 px-4 flex items-center justify-between">
					<div
						class="flex items-center gap-2 {status.type === 'processing'
							? 'text-blue-600 dark:text-blue-400'
							: status.type === 'success'
								? 'text-green-600 dark:text-green-400'
								: 'text-red-600 dark:text-red-400'}"
					>
						{#if status.type === "processing"}
							<Loader2 class="h-4 w-4 animate-spin" />
						{:else if status.type === "success"}
							<ThumbsUp class="h-4 w-4" />
						{:else if status.type === "error"}
							<AlertCircle class="h-4 w-4" />
						{/if}
						<span class="text-sm">{status.message}</span>
						{#if status.executionTime}
							<span class="text-xs opacity-60">({status.executionTime}ms)</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Active Tab Content -->
	{#if activeTab && activeTabData}
		<div
			class="absolute bottom-full w-full rounded-t-lg border border-neutral-300
             dark:border-neutral-700 {BG_STYLE}"
			transition:fade={{ duration: 200 }}
		>
			<!-- Tab Header -->
			{#if uiState.showInfo}
				<div class="px-4 pt-3">
					<h3 class="text-xs font-medium text-muted-foreground/60">
						{activeTabData.title}
					</h3>
				</div>
			{/if}

			<!-- Tab Content -->
			<div class="relative px-4 py-4">
				{#if activeTab === "table"}
					<TableTab
						{context}
						onStatusUpdate={handleStatus}
						onProcessingStart={handleProcessingStart}
						onProcessingEnd={handleProcessingEnd}
					/>

				{:else if activeTab === "color"}
				<!-- {#if activeTab === "color"} -->
					<ColorTab
						{context}
						onStatusUpdate={handleStatus}
						onProcessingStart={handleProcessingStart}
						onProcessingEnd={handleProcessingEnd}
					/>
				{:else if activeTab === "ai"}
					<AiTab
						{context}
						onStatusUpdate={handleStatus}
						onProcessingStart={handleProcessingStart}
						onProcessingEnd={handleProcessingEnd}
					/>
				{:else if activeTab === "text"}
					<TextTab
						{context}
						onStatusUpdate={handleStatus}
						onProcessingStart={handleProcessingStart}
						onProcessingEnd={handleProcessingEnd}
					/>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Tab Buttons -->
	<div class="flex justify-between items-center">
		<div class="flex relative gap-2">
			{#each Object.entries(tabs) as [tabKey, tabData]}
				<Button
					variant="ghost"
					size="icon"
					class={getButtonClass(tabKey)}
					onclick={() => toggleTab(tabKey)}
					disabled={isProcessing}
				>
					<svelte:component this={tabData.icon} class="h-4 w-4" />
				</Button>
			{/each}
		</div>
		{#if activeTab}
			<Button
				variant="ghost"
				size="sm"
				class="rounded-lg border border-foreground/60 flex items-center gap-1.5 px-2 py-1 opacity-40 hover:opacity-100 hover:bg-transparent h-7"
				onclick={() => (activeTab = null)}
				disabled={isProcessing}
				title="Close tab (Esc)"
			>
				<span class="text-xs font-mono">ESC</span>
				<X class="w-3.5 h-3.5" />
			</Button>
		{/if}
	</div>
</div>
