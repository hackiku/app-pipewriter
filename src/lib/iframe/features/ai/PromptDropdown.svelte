<!-- $lib/iframe/features/ai/PromptDropdown.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import * as Checkbox from "$lib/components/ui/checkbox";
  import { cn } from "$lib/utils";
  import { ChevronDown, X, Trash2 } from "lucide-svelte";
  
  // Props
  const props = $props<{
    isProcessing?: boolean;
    isOpen?: boolean;
  }>();

  // State
  let isOpen = $state(props.isOpen || false);
  let activePrompt = $state(null); // Simulated for scaffolding
  let useMasterPrompt = $state(true);
  let promptTitle = $state("Prompt title...");
  let promptContent = $state("Enter your prompt...");
  let promptEdited = $state(false);
  
  // For scaffolding - would normally come from a store
  const availablePrompts = [
    { id: "1", title: "Prompt 1", content: "This is the first prompt" },
    { id: "2", title: "Prompt 2", content: "This is the second prompt" },
    { id: "3", title: "Prompt 3", content: "This is the third prompt" }
  ];

  // Derived values with $derived instead of $:
  let buttonClass = $derived(cn(
    "w-full justify-between px-3 h-9 font-normal",
    activePrompt && "border-2 border-black bg-primary/5 hover:bg-primary/10"
  ));

  let clearButtonClass = $derived(cn(
    "w-full justify-between px-3 h-9 font-normal",
    "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    "dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-800"
  ));

  function toggleDropdown() {
    if (props.isProcessing) return;
    isOpen = !isOpen;
  }

  function clearPrompt() {
    activePrompt = null;
    promptTitle = "Prompt title...";
    promptContent = "Enter your prompt...";
    isOpen = false;
  }

  function toggleMasterPrompt() {
    useMasterPrompt = !useMasterPrompt;
  }
  
  function selectPrompt(id) {
    const prompt = availablePrompts.find(p => p.id === id);
    if (prompt) {
      activePrompt = prompt;
      promptTitle = prompt.title;
      promptContent = prompt.content;
    }
  }
  
  function handleSave() {
    if (activePrompt) {
      // Would normally update store
      promptEdited = false;
    }
  }
  
  function handleReset() {
    if (activePrompt) {
      // Would normally reset from store
      promptTitle = activePrompt.title;
      promptContent = activePrompt.content;
      promptEdited = false;
    }
  }
</script>

<div class="space-y-2">
  {#if isOpen}
    <div
      class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border"
      transition:slide={{ duration: 150 }}
    >
      <!-- Prompt Title -->
      <input
        type="text"
        bind:value={promptTitle}
        class="w-full px-2 py-1 text-sm font-medium bg-transparent focus:outline-none"
        placeholder="Prompt title..."
        disabled={props.isProcessing}
        on:input={() => promptEdited = true}
      />
      
      <!-- Prompt Content Area -->
      <div class="w-full rounded-md border mt-1.5">
        <textarea
          bind:value={promptContent}
          class="w-full h-[100px] p-2 text-sm bg-transparent resize-none focus:outline-none"
          placeholder="Enter your prompt..."
          disabled={props.isProcessing}
          on:input={() => promptEdited = true}
        />
      </div>

      <!-- Bottom Controls -->
      <div class="flex items-center justify-between pt-2">
        <!-- Prompt Selection Buttons -->
        <div class="flex gap-1">
          {#each availablePrompts as prompt}
            <Button
              variant="ghost"
              size="sm"
              class={cn(
                "h-6 w-6 rounded-full p-0 text-xs",
                activePrompt?.id === prompt.id && "bg-primary text-primary-foreground"
              )}
              onclick={() => selectPrompt(prompt.id)}
              disabled={props.isProcessing}
            >
              {prompt.id}
            </Button>
          {/each}
        </div>

        <!-- Save/Reset Buttons -->
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            class="h-6"
            onclick={handleSave}
            disabled={props.isProcessing || !promptEdited}
          >
            Save
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            class="h-6 w-6"
            onclick={handleReset}
            disabled={props.isProcessing || !promptEdited}
          >
            <X class="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <!-- Include Layout Context Checkbox -->
      <div class="flex items-center space-x-2 border-t mt-3 pt-2">
        <Checkbox.Root
          checked={useMasterPrompt}
          onCheckedChange={toggleMasterPrompt}
          disabled={props.isProcessing}
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

    <!-- Clear Prompt Button -->
    <Button
      variant="outline"
      class={clearButtonClass}
      onclick={clearPrompt}
      disabled={props.isProcessing || !activePrompt}
    >
      <div class="flex items-center gap-2">
        <Trash2 class="h-4 w-4" />
        <span>Clear prompt</span>
      </div>
      <X class="h-4 w-4" />
    </Button>
  {/if}
  
  <!-- Main Toggle Button -->
  <Button
    variant="outline"
    class={buttonClass}
    onclick={toggleDropdown}
    disabled={props.isProcessing}
  >
    {#if activePrompt}
      <span class="font-medium text-black dark:text-white">{activePrompt.title}</span>
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