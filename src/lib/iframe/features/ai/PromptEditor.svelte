<!-- $lib/iframe/features/ai/PromptEditor.svelte -->
<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Button } from "$lib/components/ui/button";
  import { RotateCw } from 'lucide-svelte';
  import { cn } from "$lib/utils";
  import { promptStore, activePrompt, type Prompt } from '../../stores/promptStore';

  export let disabled: boolean = false;

  let currentPrompt: Prompt;
  let isEdited = false;

  $: {
    if ($activePrompt) {
      currentPrompt = { ...$activePrompt };
    } else {
      currentPrompt = { id: "", title: "", content: "" };
    }
  }

  $: isEdited = $activePrompt && (currentPrompt.title !== $activePrompt.title || currentPrompt.content !== $activePrompt.content);

  function handleReset() {
    if ($activePrompt) {
      $promptStore.resetPrompt($activePrompt.id);
      isEdited = false;
    }
  }

  function handleSave() {
    if ($activePrompt) {
      $promptStore.updatePrompt(currentPrompt);
      isEdited = false;
    }
  }

  function selectPrompt(id: string) {
    $promptStore.setActivePrompt(id);
    isEdited = false;
  }

  function handleInput() {
    isEdited = true;
  }

  $: numberButtonClass = (id: string) => cn(
    "h-6 w-6 rounded-full p-0 text-xs",
    $activePrompt?.id === id && "bg-primary text-primary-foreground"
  );

  $: combinedPromptContent = $promptStore.useMasterPrompt && $activePrompt
    ? `${currentPrompt.content}\n\n–––––––––\n\n${$promptStore.masterPrompt}`
    : currentPrompt.content;
</script>

<div class="space-y-1.5">
  <input
    type="text"
    bind:value={currentPrompt.title}
    class="w-full px-2 py-1 text-sm font-medium bg-transparent focus:outline-none"
    placeholder="Prompt title..."
    {disabled}
    on:input={handleInput}
  />
  
  <ScrollArea class="w-full rounded-md border">
    <textarea
      bind:value={combinedPromptContent}
      class="w-full h-[100px] p-2 text-sm bg-transparent resize-none focus:outline-none"
      placeholder="Enter your prompt..."
      {disabled}
      on:input={handleInput}
    />
  </ScrollArea>

  <div class="flex items-center justify-between pt-1">
    <div class="flex gap-1">
      {#each $promptStore.prompts as prompt}
        <Button
          variant="ghost"
          size="sm"
          class={numberButtonClass(prompt.id)}
          on:click={() => selectPrompt(prompt.id)}
          {disabled}
        >
          {prompt.id}
        </Button>
      {/each}
    </div>

    <div class="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        class="h-6"
        on:click={handleSave}
        disabled={disabled || !isEdited}
      >
        Save
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        class="h-6 w-6"
        on:click={handleReset}
        disabled={disabled || !isEdited}
      >
        <RotateCw class="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
</div>