<!-- $lib/iframe/features/ai/PromptSelect.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { ChevronUp, RotateCcw, X } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { promptStore, activePrompt, type Prompt } from "../../stores/promptStore";

  export let isOpen = false;
  export let isProcessing = false;

  // Live updates for active prompt
  function updatePromptTitle(value: string) {
    if ($activePrompt) {
      promptStore.updatePrompt({
        ...$activePrompt,
        title: value
      });
    }
  }

  function updatePromptContent(value: string) {
    if ($activePrompt) {
      promptStore.updatePrompt({
        ...$activePrompt,
        content: value
      });
    }
  }

  function handlePromptSelect(prompt: Prompt) {
    promptStore.setActivePrompt(prompt.id);
  }

  function handleReset() {
    if ($activePrompt) {
      // Reset to original content - you'll need to store these defaults somewhere
      const defaultContent = "Default prompt content here";
      const defaultTitle = "Default title";
      promptStore.updatePrompt({
        ...$activePrompt,
        content: defaultContent,
        title: defaultTitle
      });
    }
  }

  function truncateText(text: string, length = 60) {
    return text.length > length ? text.slice(0, length) + "..." : text;
  }

  $: buttonClass = cn(
    "w-full justify-between h-9",
    isOpen && "border-red-200 bg-red-50 hover:bg-red-100"
  );
</script>

<div class="w-full space-y-2">
  <!-- Main Button -->

  <!-- Prompt Cards -->
  {#if isOpen}
    <div
      class="w-full space-y-2"
      transition:slide={{ duration: 150, axis: "y" }}
    >
      {#each $promptStore.prompts as prompt (prompt.id)}
        <div class={cn(
          "rounded-lg border transition-colors",
          $activePrompt?.id === prompt.id
            ? "bg-gray-50 dark:bg-gray-800 border-primary"
            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300"
        )}>
          <div class="p-3">
            {#if $activePrompt?.id === prompt.id}
              <!-- Editor Mode -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <input
                    type="text"
                    value={prompt.title}
                    on:input={(e) => updatePromptTitle(e.currentTarget.value)}
                    class="w-full text-sm font-medium bg-transparent border-b border-gray-200 
                           dark:border-gray-700 focus:outline-none focus:border-primary px-1 py-0.5"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    on:click={handleReset}
                    class="h-8 w-8 ml-2"
                    title="Reset to default"
                  >
                    <RotateCcw class="h-4 w-4" />
                  </Button>
                </div>
                <textarea
                  value={prompt.content}
                  on:input={(e) => updatePromptContent(e.currentTarget.value)}
                  class="w-full h-24 p-2 text-sm bg-white/50 dark:bg-gray-900/50 rounded 
                         border border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-primary"
                  placeholder="Enter your prompt..."
                />
              </div>
            {:else}
              <!-- Preview Mode -->
              <button
                class="w-full text-left group"
                on:click={() => handlePromptSelect(prompt)}
              >
                <div class="text-sm font-medium mb-1">{prompt.title}</div>
                <div class="text-xs text-muted-foreground truncate">
                  {truncateText(prompt.content)}
                </div>
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
	<Button
    variant="outline"
    class={buttonClass}
    on:click={() => (isOpen = !isOpen)}
    disabled={isProcessing}
  >
    <span class="text-sm truncate">
      {isOpen ? "Don't drop prompt" : ($activePrompt ? $activePrompt.title : "No AI prompt")}
    </span>
    <ChevronUp
      class={cn(
        "h-4 w-4 transition-transform duration-200",
        !isOpen && "rotate-180"
      )}
    />
  </Button>

</div>