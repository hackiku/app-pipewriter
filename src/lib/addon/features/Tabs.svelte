<!-- src/lib/iframe/features/Tabs.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { Table, Type, Palette, Code, X } from "lucide-svelte";
  import { getContext } from "svelte";
  import type { AppsScriptClient } from "../utils/appsScript";
  import type { TabStatus } from "../types/status";
  import StatusBar from "../components/StatusBar.svelte";
  
  import { activeTab, showInfo } from "../stores";
  import { isProcessing } from "../utils";
  
  // Import tab components
  import TableTab from "./table/TableTab.svelte";
  // import TextTab from "./text/TextTab.svelte";
  import ColorTab from "./colors/ColorTab.svelte";
  import AiTab from "./ai/AiTab.svelte";
  
  // const BG_STYLE = 'bg-gray-100 dark:bg-slate-900';
  const BG_STYLE = 'bg-gray-50 dark:bg-slate-950';

  // Get AppsScript client from context
  const appsScript = getContext<AppsScriptClient>('appsScript');
  let status: TabStatus | null = null;
  let statusTimeout: number;

  const tabs = {
		color: { 
			icon: Palette, 
			tooltip: "Color Picker",
			title: "Background Color",
			description: "Change document background color",
			component: ColorTab
		},
    ai: { 
      icon: Code, 
      tooltip: "AI Assistant",
      title: "AI Assistant",
      description: "Convert formats and generate content",
      component: AiTab
    },
		// text: { 
    //   icon: Type, 
    //   tooltip: "Text Styles",
    //   title: "Text Formatting",
    //   description: "Format text and update styles",
    //   component: TextTab
    // },
  };

  function handleStatus(event: CustomEvent<TabStatus>) {
    status = event.detail;
    
    if (status.type !== "processing") {
      if (statusTimeout) clearTimeout(statusTimeout);
      statusTimeout = setTimeout(() => {
        status = null;
      }, 3000);
    }
  }

  function toggleTab(tab: string) {
    activeTab.update((current) => (current === tab ? null : tab));
  }

  $: getButtonClass = (tab: string) => `
    transition-all duration-200 relative z-10
    ${$activeTab === tab 
      ? `w-10 h-[calc(3rem+1px)] rounded-b-full ${BG_STYLE}
         border-b border-l border-r border-gray-300 dark:border-gray-600
         after:content-[''] after:absolute after:top-[-1px] 
         after:left-0 after:right-0 after:h-[1px] after:bg-inherit`
      : "w-10 h-10 rounded-full mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
    }
  `;
  
  $: activeTabData = $activeTab ? tabs[$activeTab] : null;

  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (statusTimeout) clearTimeout(statusTimeout);
  });
</script>

<div class="flex flex-col w-full relative">
  <!-- Status Bar -->
  {#if status}
    <StatusBar {status} />
  {/if}

  <!-- Active Tab Content -->
  {#if $activeTab && activeTabData}
    <div
      class="absolute bottom-full w-full rounded-t-lg border border-gray-300 
             dark:border-gray-600 {BG_STYLE} overflow-hidden"
      transition:fade={{ duration: 200 }}
    >
      <!-- Tab Header -->
      {#if $showInfo}
        <div class="px-4 pt-3">
          <h3 class="text-xs font-medium text-muted-foreground/60">
            {activeTabData.title}
          </h3>
        </div>
      {/if}

      <!-- Tab Content -->
      <div class="relative px-4 py-4">
        <svelte:component
          this={activeTabData.component}
          {appsScript}
          on:status={handleStatus}
          on:processingStart={() => isProcessing.set(true)}
          on:processingEnd={() => isProcessing.set(false)}
        />
      </div>
    </div>
  {/if}

  <!-- Tab Buttons -->
  <div class="flex justify-between items-center">
    <div class="flex relative gap-2">
      {#each Object.entries(tabs) as [tabKey, tabData]}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              class={getButtonClass(tabKey)}
              on:click={() => toggleTab(tabKey)}
              disabled={$isProcessing}
            >
              <svelte:component this={tabData.icon} class="h-4 w-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>{tabData.tooltip}</p>
          </Tooltip.Content>
        </Tooltip.Root>
      {/each}

      {#if $activeTab}
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full opacity-40 hover:opacity-100 hover:bg-transparent"
          on:click={() => activeTab.set(null)}
          disabled={$isProcessing}
        >
          <X class="w-4 h-4 mt-4" />
        </Button>
      {/if}
    </div>

    {#if $showInfo && !$activeTab}
      <h2 class="text-xs uppercase tracking-wide text-muted-foreground/60">
        Styles
      </h2>
    {/if}
  </div>
</div>