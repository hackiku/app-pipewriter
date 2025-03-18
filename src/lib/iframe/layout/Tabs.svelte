<script lang="ts">
  import { fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { Table, Type, Palette, Code, Settings, Loader2, ThumbsUp, AlertCircle, X } from "lucide-svelte";
  import { activeTab, showInfo } from "../stores";
  import { isProcessing } from "../utils";
  import type { StatusUpdate } from "../types/status";

  // Import tab components
  import TableTab from "../features/table/TableTab.svelte";
  import TextTab from "../features/text/TextTab.svelte";
  import ColorTab from "../features/colors/ColorTab.svelte";
  import AiTab from "../features/ai/AiTab.svelte";
  
  const BG_STYLE = 'bg-red-200 dark:bg-red-900';

  const tabs = {
    ai: { 
      icon: Code, 
      tooltip: "AI Assistant",
      title: "AI Assistant",
      description: "Convert formats and generate content",
      component: AiTab
    },
    text: { 
      icon: Type, 
      tooltip: "Text Styles",
      title: "Text Formatting",
      description: "Format text and update styles",
      component: TextTab
    },
    color: { 
      icon: Palette, 
      tooltip: "Color Picker",
      title: "Background Color",
      description: "Change document background color",
      component: ColorTab
    }
  };

  // Status handling
  let status: StatusUpdate | null = null;
  let statusTimeout: number;

  function handleStatus(event: CustomEvent<StatusUpdate>) {
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
      ? `w-10 h-[calc(3rem+1px)] ${BG_STYLE}
         border-b border-l border-r border-gray-300 dark:border-gray-600
         ${tab === 'color' ? 'rounded-bl-none' : 'rounded-bl-lg'} rounded-br-lg rounded-t-lg
         after:content-[''] after:absolute after:top-[-1px] 
         after:left-0 after:right-0 after:h-[1px] after:bg-inherit`
      : "w-10 h-10 rounded-full mt-2 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
    }
  `;
  
  $: activeTabData = $activeTab ? tabs[$activeTab] : null;

  // Cleanup on destroy
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (statusTimeout) clearTimeout(statusTimeout);
  });
</script>

<div class="flex flex-col w-full relative">
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
          on:status={handleStatus}
          on:processingStart={() => isProcessing.set(true)}
          on:processingEnd={() => isProcessing.set(false)}
        />
      </div>

      <!-- Status Bar -->
      
			{#if status}
        <div
          class="h-8 px-4 flex items-center border-t border-gray-200 dark:border-gray-700"
          transition:fade={{ duration: 150 }}
        >
          <div class="flex items-center gap-2" 
               class:text-green-600={status.type === 'success'}
               class:text-red-600={status.type === 'error'}
               class:text-blue-600={status.type === 'processing'}>
            {#if status.type === 'processing'}
              <Loader2 class="h-4 w-4 animate-spin" />
            {:else if status.type === 'success'}
              <ThumbsUp class="h-4 w-4" />
            {:else if status.type === 'error'}
              <AlertCircle class="h-4 w-4" />
            {/if}
            <span class="text-sm">{status.message}</span>
            {#if status.executionTime}
              <span class="text-xs opacity-60">({status.executionTime}ms)</span>
            {/if}
          </div>
        </div>
      {/if}
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
          class="rounded-full opacity-80 hover:opacity-100 hover:bg-transparent"
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