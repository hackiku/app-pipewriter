<!-- $lib/iframe/features/Tabs.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Palette, Type, Code, X } from "lucide-svelte";
  import type { StatusUpdate } from "../types/status";
  import StatusBar from "../components/StatusBar.svelte";
  
  // Import tab components
  import ColorTab from "./colors/ColorTab.svelte";
  import TextTab from "./text/TextTab.svelte";
  import AiTab from "./ai/AiTab.svelte";
  
  // Props
  const { context } = $props();
  
  // State
  let activeTab = $state<string | null>(null);
  let showInfo = $state(true);
  let isProcessing = $state(false);
  let status = $state<StatusUpdate | null>(null);
  let statusTimeout = $state<number | null>(null);
  
  const BG_STYLE = 'bg-gray-50 dark:bg-slate-950';

  // Tab definitions
  const tabs = {
    color: { 
      icon: Palette, 
      title: "Background Color",
      description: "Change document background color",
      component: ColorTab
    },
    ai: { 
      icon: Code, 
      title: "AI Assistant",
      description: "Convert formats and generate content",
      component: AiTab
    },
    text: { 
      icon: Type, 
      title: "Text Formatting",
      description: "Format text and update styles",
      component: TextTab
    }
  };

  // Handle status updates from tab components
  function handleStatus(event: CustomEvent<StatusUpdate>) {
    status = event.detail;
    
    if (status.type !== "processing") {
      clearStatusTimeout();
      statusTimeout = setTimeout(() => {
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

  // Computed values
  let getButtonClass = $derived((tab: string) => `
    transition-all duration-200 relative z-10
    ${activeTab === tab 
      ? `w-10 h-[calc(3rem+1px)] rounded-b-full ${BG_STYLE}
         border-b border-l border-r border-gray-300 dark:border-gray-600
         after:content-[''] after:absolute after:top-[-1px] 
         after:left-0 after:right-0 after:h-[1px] after:bg-inherit`
      : "w-10 h-10 rounded-full mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
    }
  `);
  
  let activeTabData = $derived(() => activeTab ? tabs[activeTab] : null);

  // Cleanup on destroy
  // onDestroy(() => {
  //   clearStatusTimeout();
  // });
</script>

<div class="flex flex-col w-full relative">
  <!-- Status Bar -->
  {#if status}
    <StatusBar {status} />
  {/if}

  <!-- Active Tab Content -->
  {#if activeTab && activeTabData}
    <div
      class="absolute bottom-full w-full rounded-t-lg border border-gray-300 
             dark:border-gray-600 {BG_STYLE} overflow-hidden"
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
        <svelte:component
          this={activeTabData.component}
          {context}
          onstatus={handleStatus}
          onprocessingStart={() => isProcessing = true}
          onprocessingEnd={() => isProcessing = false}
        />
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

      {#if activeTab}
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full opacity-40 hover:opacity-100 hover:bg-transparent"
          onclick={() => activeTab = null}
          disabled={isProcessing}
        >
          <X class="w-4 h-4 mt-4" />
        </Button>
      {/if}
    </div>

    {#if showInfo && !activeTab}
      <h2 class="text-xs uppercase tracking-wide text-muted-foreground/60">
        Styles
      </h2>
    {/if}
  </div>
</div>