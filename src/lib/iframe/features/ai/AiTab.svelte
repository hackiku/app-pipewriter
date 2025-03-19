<!-- $lib/iframe/features/ai/AiTab.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ArrowDown, ArrowUp, Trash2, Code, Clipboard } from 'lucide-svelte';
  import { Button } from "$lib/components/ui/button";
  import HtmlButton from './HtmlButton.svelte';
  import PromptDropdown from './PromptDropdown.svelte';
  import { insertHtml, stripHtml } from '$lib/services/google/html';

  // Props
  const { context } = $props();
  
  // State
  let isProcessing = $state(false);
  let activePrompt = $state(null);
  let useMasterPrompt = $state(true);
  
  const dispatch = createEventDispatcher();

  async function handleHtmlAction(action: string, params = {}) {
    if (isProcessing) return;

    isProcessing = true;
    dispatch('processingStart');
    dispatch('status', {
      type: 'processing',
      message: 'Processing...'
    });

    try {
      if (action === 'dropHtml') {
        const payload = {
          ...params,
          ...(activePrompt ? {
            prompt: activePrompt.content
          } : {})
        };

        const response = await insertHtml(payload, (status) => {
          dispatch('status', status);
        });
        
        if (!response.success) {
          throw new Error(response.error);
        }

        if (response.clipboardContent) {
          await navigator.clipboard.writeText(response.clipboardContent);
          dispatch('status', {
            type: 'success',
            message: 'Copied to clipboard',
            executionTime: response.executionTime
          });
        } else {
          dispatch('status', {
            type: 'success',
            message: 'HTML inserted successfully',
            executionTime: response.executionTime
          });
        }
      } else if (action === 'stripHtml') {
        const response = await stripHtml(params, (status) => {
          dispatch('status', status);
        });
        
        if (!response.success) {
          throw new Error(response.error);
        }

        dispatch('status', {
          type: 'success',
          message: params.all ? 'All HTML removed' : 'HTML tags removed',
          executionTime: response.executionTime
        });
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      dispatch('status', {
        type: 'error',
        message: error instanceof Error ? error.message : `Failed to ${action}`
      });
    } finally {
      isProcessing = false;
      dispatch('processingEnd');
    }
  }

  const dropHtmlActions = [
    { 
      label: 'Start',
      icon: ArrowUp,
      onClick: () => handleHtmlAction('dropHtml', { position: 'start' })
    },
    {
      label: 'End',
      icon: ArrowDown,
      onClick: () => handleHtmlAction('dropHtml', { position: 'end' })
    },
    {
      label: 'Copy',
      icon: Clipboard,
      onClick: () => handleHtmlAction('dropHtml', { copyToClipboard: true })
    }
  ];

  const stripHtmlActions = [
    { 
      label: 'Tags',
      onClick: () => handleHtmlAction('stripHtml', { all: false })
    },
    { 
      label: 'All',
      onClick: () => handleHtmlAction('stripHtml', { all: true })
    }
  ];
  
  function setActivePrompt(prompt) {
    activePrompt = prompt;
  }
  
  function toggleMasterPrompt() {
    useMasterPrompt = !useMasterPrompt;
  }
</script>

<div class="flex flex-col items-stretch w-full gap-3">
  <div class="relative">
    <PromptDropdown 
      {activePrompt}
      {useMasterPrompt}
      on:promptSelect={e => setActivePrompt(e.detail)}
      on:toggleMasterPrompt={toggleMasterPrompt}
      disabled={isProcessing} 
    />
  </div>

  <HtmlButton
    icon={Code}
    label="Drop HTML"
    variant="icon-only"
    actions={dropHtmlActions}
    disabled={isProcessing}
  />

  <HtmlButton
    icon={Trash2}
    label="Strip HTML"
    variant="text"
    actions={stripHtmlActions}
    disabled={isProcessing}
  />
</div>