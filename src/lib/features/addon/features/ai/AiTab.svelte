<!-- src/lib/features/addon/features/ai/AiTab.svelte -->
<script lang="ts">
  import PromptDropdown from "./PromptDropdown.svelte";
  import DropCode from "./DropCode.svelte";
  import StripCode from "./StripCode.svelte";

  const props = $props<{
    context: any;
    prompts: Record<string, any[]>;
    features: any;
    onStatusUpdate: (status: any) => void;
    onProcessingStart: () => void;
    onProcessingEnd: () => void;
  }>();

  // State
  let isProcessing = $state(false);
  let activePrompt = $state(null);
  let promptOpen = $state(false);
  let currentPrompts = $state(props.prompts); // Local state for updates

  function handleStatusUpdate(status: any) {
    props.onStatusUpdate(status);
  }

  function handleProcessingStart() {
    isProcessing = true;
    props.onProcessingStart();
  }

  function handleProcessingEnd() {
    isProcessing = false;
    props.onProcessingEnd();
  }

  function handlePromptSelect(prompt: any) {
    activePrompt = prompt;
    promptOpen = false;
  }

  // Refresh prompts after CRUD operations
  async function refreshPrompts() {
    try {
      const response = await fetch('/api/prompts');
      const result = await response.json();
      
      if (result.success) {
        currentPrompts = result.prompts;
        handleStatusUpdate({
          type: 'success',
          message: 'Prompts updated',
          executionTime: 200
        });
      }
    } catch (error) {
      handleStatusUpdate({
        type: 'error',
        message: 'Failed to refresh prompts'
      });
    }
  }
</script>

<div class="flex flex-col items-stretch w-full gap-2">
  <div class="relative">
    <PromptDropdown
      prompts={currentPrompts}
      features={props.features}
      isOpen={promptOpen}
      isProcessing={isProcessing}
      activePrompt={activePrompt}
      onPromptSelect={handlePromptSelect}
      onToggleOpen={() => promptOpen = !promptOpen}
      onPromptsUpdate={refreshPrompts}
    />
  </div>

  <DropCode
    disabled={isProcessing}
    activePrompt={activePrompt}
    onStatusUpdate={handleStatusUpdate}
    onProcessingStart={handleProcessingStart}
    onProcessingEnd={handleProcessingEnd}
  />
  
  <StripCode
    disabled={isProcessing}
    onStatusUpdate={handleStatusUpdate}
    onProcessingStart={handleProcessingStart}
    onProcessingEnd={handleProcessingEnd}
  />
</div>