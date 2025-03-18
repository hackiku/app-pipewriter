<!-- $lib/iframe/features/ai/AiTab.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ArrowDown, ArrowUp, Trash2, Code, Clipboard } from 'lucide-svelte';
  import { promptStore, activePrompt } from '../../stores/promptStore';
  import PromptDropdown from './PromptDropdown.svelte';
  import HtmlButton from './HtmlButton.svelte';

	import ComingSoon from "../../components/ComingSoon.svelte";


  export let appsScript: any;
  const dispatch = createEventDispatcher();
  let isProcessing = false;

  async function handleHtmlAction(action: string, params = {}) {
    if (isProcessing) return;

    isProcessing = true;
    dispatch('processingStart');
    dispatch('status', {
      type: 'processing',
      message: 'Processing...'
    });

    try {
      const payload = {
        ...params,
        ...(action === 'dropHtml' && $activePrompt ? {
          prompt: $activePrompt.content
        } : {})
      };

      const response = await appsScript.sendMessage(action, payload);
      
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
          message: 'Operation completed',
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
      onClick: () => handleHtmlAction('stripHtml', { tags: true })
    },
    { 
      label: 'All',
      onClick: () => handleHtmlAction('stripHtml', { all: true })
    }
  ];
</script>

<div class="flex flex-col items-stretch w-full gap-3">
  <div class="relative">
    <PromptDropdown disabled={isProcessing} />
			
		<!-- <ComingSoon /> -->
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