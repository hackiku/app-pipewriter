<!-- Updated src/lib/features/addon/features/Tabs.svelte -->
<script lang="ts">
	import { fade } from "svelte/transition";
	import { Button } from "$lib/components/ui/button";
	import {
		Table,
		Palette,
		Type,
		Code,
		X,
	} from "@lucide/svelte";

	// Import tab components
	import TableTab from "./table/TableTab.svelte";
	import ColorTab from "./colors/ColorTab.svelte";
	import TextTab from "./text/TextTab.svelte";
	import AiTab from "./ai/AiTab.svelte";
	import CompactStatus from "../components/CompactStatus.svelte";

	// Props
	const { 
		context, 
		prompts,
		features,
		userAccess,
		showInfo = false
	} = $props<{ 
		context: any;
		prompts: any;
		features: any;
		userAccess: any;
		showInfo?: boolean;
	}>();

	// Local state
	let activeTab = $state<string | null>(null);
	let isProcessing = $state(false);
	let isHovering = $state(false);
	
	// LOCAL status state for CompactStatus
	let status = $state<{
		type: "processing" | "success" | "error";
		message: string;
		details?: string;
		executionTime?: number;
		error?: any;
	} | null>(null);

	const BG_STYLE = "bg-neutral-50 dark:bg-neutral-900";

	// Tab definitions with keyboard shortcuts
	const tabs = {
		color: {
			icon: Palette,
			title: "Background Color", 
			description: "Change document background color",
			component: ColorTab,
			shortcut: "1"
		},
		table: {
			icon: Table,
			title: "Table Editor",
			description: "Edit currently selected table",
			component: TableTab,
			shortcut: "2"
		},
		ai: {
			icon: Code,
			title: "AI Assistant",
			description: "Convert formats and generate content",
			component: AiTab,
			shortcut: "3"
		},
		text: {
			icon: Type,
			title: "Text Formatting",
			description: "Format text and update styles", 
			component: TextTab,
			shortcut: "4"
		},
	};

	// Handle status updates from child tabs
	function handleStatus(newStatus: typeof status) {
		status = newStatus;
	}

	// Handle status close
	function handleStatusClose() {
		status = null;
	}

	// Toggle active tab
	function toggleTab(tab: string) {
		activeTab = activeTab === tab ? null : tab;
	}

	// Keyboard event handler
	function handleKeydown(event: KeyboardEvent) {
		// ESC to close tab
		if (event.key === 'Escape' && activeTab) {
			activeTab = null;
			event.preventDefault();
			return;
		}

		// Number keys 1-4 for tab shortcuts
		if (['1', '2', '3', '4'].includes(event.key)) {
			const tabEntries = Object.entries(tabs);
			const tabIndex = parseInt(event.key) - 1;
			if (tabIndex >= 0 && tabIndex < tabEntries.length) {
				const [tabKey] = tabEntries[tabIndex];
				toggleTab(tabKey);
				event.preventDefault();
			}
		}
	}

	// Mouse enter/leave handlers
	function handleMouseEnter() {
		isHovering = true;
	}

	function handleMouseLeave() {
		isHovering = false;
	}

	// Add keyboard listeners
	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeydown);
			return () => {
				window.removeEventListener('keydown', handleKeydown);
			};
		}
	});

	// Function to generate button class based on active state
	function getButtonClass(tab: string) {
		return activeTab === tab
			? `transition-all duration-200 relative z-10 w-10 h-11 rounded-b-full ${BG_STYLE}
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

	// Get tab shortcut for display
	function getTabShortcut(tabKey: string): string {
		return tabs[tabKey]?.shortcut || '';
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
	class="flex flex-col w-full relative"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<!-- Active Tab Content -->
	{#if activeTab && activeTabData}
		<div
			class="absolute bottom-full w-full rounded-t-lg border border-neutral-300
             dark:border-neutral-700 {BG_STYLE}"
			transition:fade={{ duration: 200 }}
		>
			<!-- Tab Header -->
			{#if showInfo}
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
						userAccess={userAccess}
						onStatusUpdate={handleStatus}
						onProcessingStart={handleProcessingStart}
						onProcessingEnd={handleProcessingEnd}
					/>
				{:else if activeTab === "color"}
					<ColorTab
						{context}
						userAccess={userAccess}
						onProcessingStart={handleProcessingStart}
						onProcessingEnd={handleProcessingEnd}
					/>
				{:else if activeTab === "ai"}
					<AiTab
						{context}
						{prompts}
						{features}
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
				{@const IconComponent = tabData.icon}
				<Button
					variant="ghost"
					size="icon"
					class={getButtonClass(tabKey)}
					onclick={() => toggleTab(tabKey)}
					disabled={isProcessing}
				>
					<div class="relative">
						<IconComponent class="h-4 w-4" />
						
						<!-- Keyboard shortcut indicator on hover -->
						{#if isHovering && !activeTab}
							<div 
								class="absolute -bottom-3 -right-2 border border-border bg-background/50
								       text-muted-foreground rounded-sm px-1
								       text-[0.5em] font-medium leading-none min-w-[12px] h-3 
								       flex items-center justify-center"
								transition:fade={{ duration: 150 }}
							>
								{getTabShortcut(tabKey)}
							</div>
						{/if}
					</div>
				</Button>
			{/each}
		</div>
		
		{#if activeTab}
			<Button
				variant="ghost"
				size="sm"
				class="mt-1 rounded-lg border border-foreground/60 flex items-center gap-1.5 px-2 py-1 opacity-40 hover:opacity-100 hover:bg-transparent h-7"
				onclick={() => (activeTab = null)}
				disabled={isProcessing}
				title="Close tab (Esc)"
			>
				<span class="text-[0.65em] font-mono">ESC</span>
				<X class="w-3 h-3" />
			</Button>
		{/if}
	</div>

	<!-- SELF-CONTAINED: CompactStatus for tab operations -->
	<CompactStatus status={status} onStatusClose={handleStatusClose} />
</div>