<!-- $lib/iframe/features/ai/PromptDropdown.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import * as Checkbox from "$lib/components/ui/checkbox";
  import { cn } from "$lib/utils";
  import { ChevronDown, X, Trash2 } from "lucide-svelte";
  import PromptEditor from "./PromptEditor.svelte";
  import { promptStore, activePrompt } from '../../stores/promptStore';

  export let isProcessing = false;
  export let isOpen = false;

  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen && !$activePrompt) {
      $promptStore.setActivePrompt("1");
    }
  }

  function clearPrompt() {
    $promptStore.removeActivePrompt();
    isOpen = false;
  }

  $: buttonClass = cn(
    "w-full justify-between px-3 h-9 font-normal",
    $activePrompt && "border-2 border-black bg-primary/5 hover:bg-primary/10"
  );

  $: clearButtonClass = cn(
    "w-full justify-between px-3 h-9 font-normal",
    "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    "dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-800"
  );
</script>

<div class="space-y-2">
  {#if isOpen}
    <div
      class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border"
      transition:slide={{ duration: 150 }}
    >
      <PromptEditor
        disabled={isProcessing}
      />

      <div class="flex items-center space-x-2 border-t mt-3 pt-2">
        <Checkbox.Root
          checked={$promptStore.useMasterPrompt}
          onCheckedChange={() => $promptStore.toggleMasterPrompt()}
          disabled={isProcessing}
          class="h-4 w-4"
        >
          <Checkbox.Indicator>
            <div class="h-4 w-4 bg-primary"></div>
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label class="text-sm">
          Include layout context
        </label>
      </div>
    </div>

    <Button
      variant="outline"
      class={clearButtonClass}
      on:click={clearPrompt}
      disabled={isProcessing || !$activePrompt}
    >
      <div class="flex items-center gap-2">
        <Trash2 class="h-4 w-4" />
        <span>Clear prompt</span>
      </div>
      <X class="h-4 w-4" />
    </Button>
  {/if}
  <Button
    variant="outline"
    class={buttonClass}
    on:click={toggleDropdown}
    disabled={isProcessing}
  >
    {#if $activePrompt}
      <span class="font-medium text-black dark:text-white">{$activePrompt.title}</span>
    {:else}
      <span class="text-muted-foreground">Select prompt...</span>
    {/if}
    <ChevronDown
      class={cn(
        "h-4 w-4 transition-transform duration-200",
        isOpen && "rotate-180"
      )}
    />
  </Button>
</div>