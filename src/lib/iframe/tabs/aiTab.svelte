<!-- $lib/iframe/tabs/AiTab.svelte -->
<script lang="ts">
  import { FileCode, Loader2, ThumbsUp, AlertCircle, ArrowDown, ArrowUp, Trash2 } from 'lucide-svelte';
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { onMount } from 'svelte';
  import { fade, slide } from "svelte/transition";
  import AiPromptDropdown from "../components/AiPromptDropdown.svelte";
  import AiCodeBlock from "../components/AiCodeBlock.svelte";
  import { promptStore, activePrompt } from '../stores/promptStore';
  import { cn } from "$lib/utils";

  let isProcessing = false;
  let status: StatusUpdate | null = null;
  let generatedCode: string | null = null;
  let showCodeBlock = false;

  interface StatusUpdate {
    type: 'success' | 'error' | 'processing';
    message: string;
    executionTime?: number;
  }

  async function handleAction(position: 'start' | 'end') {
    if (isProcessing) return;
    
    isProcessing = true;
    updateStatus({
      type: 'processing',
      message: 'Converting...'
    });

    try {
      // Only include prompt if usePrompt is true in the store
      const promptPayload = $promptStore.usePrompt && $activePrompt 
        ? { prompt: $activePrompt.content }
        : {};

      const response = await window.parent.postMessage(JSON.stringify({
        action: 'doc2html',
        payload: {
          position,
          ...promptPayload
        }
      }), '*');
      
      if (response.success) {
        updateStatus({
          type: 'success',
          message: 'Conversion complete!',
          executionTime: response.executionTime
        });
        if (response.generatedCode) {
          generatedCode = response.generatedCode;
          showCodeBlock = true;
        }
      } else {
        throw new Error(response.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Failed to convert:', error);
      updateStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Conversion failed'
      });
    } finally {
      isProcessing = false;
    }
  }

  async function handleDeleteTags() {
    if (isProcessing) return;
    
    try {
      const response = await window.parent.postMessage(JSON.stringify({
        action: 'deleteHTMLtags',
        payload: {}
      }), '*');

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete tags');
      }
      updateStatus({
        type: 'success',
        message: 'Tags deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete tags:', error);
      updateStatus({
        type: 'error',
        message: 'Failed to delete tags'
      });
    }
  }

  function updateStatus(newStatus: StatusUpdate) {
    status = newStatus;
    if (newStatus.type !== 'processing') {
      setTimeout(() => status = null, 3000);
    }
  }

  function handleCodeClose() {
    showCodeBlock = false;
  }

  $: statusClass = status && {
    success: "bg-green-500/5 border-green-500/10 text-green-700 dark:text-green-300",
    error: "bg-red-500/5 border-red-500/10 text-red-700 dark:text-red-300",
    processing: "bg-blue-500/5 border-blue-500/10 text-blue-700 dark:text-blue-300"
  }[status.type];

  $: convertButtonClass = cn(
    "h-9 w-9",
    $activePrompt && $promptStore.usePrompt && "border-primary"
  );
</script>

<div class="w-full">
  <!-- Code Block (floating above) -->
  {#if showCodeBlock && generatedCode}
    <div 
      class="absolute bottom-full left-0 right-0 mb-2 z-50"
      transition:slide={{ duration: 200, axis: 'y' }}
    >
      <AiCodeBlock 
        code={generatedCode}
        title="Generated HTML"
        onClose={handleCodeClose}
      />
    </div>
  {/if}

  <!-- Main Controls -->
  <div class="space-y-2">
    <!-- AI Prompt Dropdown -->
    <AiPromptDropdown disabled={isProcessing} />

    <!-- Action Buttons -->
    <div class="flex items-center gap-2">
      <Button 
        variant="outline" 
        class="flex-1 justify-start gap-2 h-9 text-sm"
        on:click={handleDeleteTags}
        disabled={isProcessing}
      >
        <Trash2 class="h-4 w-4" />
        Delete Tags
      </Button>

      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button 
            variant="outline"
            size="sm"
            class={convertButtonClass}
            on:click={() => handleAction('start')}
            disabled={isProcessing}
          >
            <ArrowUp class="h-4 w-4" />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom">
          <p class="text-xs">Insert at document start</p>
        </Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button 
            variant="outline"
            size="sm"  
            class={convertButtonClass}
            on:click={() => handleAction('end')}
            disabled={isProcessing}
          >
            <ArrowDown class="h-4 w-4" />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom">
          <p class="text-xs">Insert at document end</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  </div>

  <!-- Status Overlay -->
  {#if status}
    <div 
      class="absolute inset-0 z-50 flex items-center justify-center rounded-lg border backdrop-blur-[0.2em] transition-all duration-200 {statusClass}"
      transition:fade={{ duration: 200 }}
    >
      <div class="flex items-center gap-2 px-4 py-2">
        {#if status.type === 'processing'}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else if status.type === 'success'}
          <ThumbsUp class="h-4 w-4" />
        {:else if status.type === 'error'}
          <AlertCircle class="h-4 w-4" />
        {/if}
        <span class="text-sm font-medium">{status.message}</span>
        {#if status.executionTime}
          <span class="text-xs text-muted-foreground">
            ({status.executionTime}ms)
          </span>
        {/if}
      </div>
    </div>
  {/if}
</div>