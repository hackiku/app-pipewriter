<!-- Fixed src/lib/features/addon/features/ai/AiTab.svelte -->
<script lang="ts">
  import PromptDropdown from "./PromptDropdown.svelte";
  import DropCode from "./DropCode.svelte";
  import StripCode from "./StripCode.svelte";

  // FIXED: Accept server data as props instead of contexts
  const props = $props<{
    context: any;
    prompts: Record<string, any[]>; // Server-provided prompts by category
    features: any; // User features from server
    onStatusUpdate: (status: any) => void;
    onProcessingStart: () => void;
    onProcessingEnd: () => void;
  }>();

  // State
  let isProcessing = $state(false);
  let activePrompt = $state(null);
  let promptOpen = $state(false);

  // This function will be called by the DropCode and StripCode components
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
</script>

<div class="flex flex-col items-stretch w-full gap-2">
  <!-- Prompt Dropdown on top -->
  <div class="relative">
    <PromptDropdown
      prompts={props.prompts}
      features={props.features}
      isOpen={promptOpen}
      isProcessing={isProcessing}
      activePrompt={activePrompt}
      onPromptSelect={handlePromptSelect}
      onToggleOpen={() => promptOpen = !promptOpen}
    />
  </div>

  <!-- Drop Code Control -->
  <DropCode
    disabled={isProcessing}
    activePrompt={activePrompt}
    onStatusUpdate={handleStatusUpdate}
    onProcessingStart={handleProcessingStart}
    onProcessingEnd={handleProcessingEnd}
  />
  
  <!-- Strip Code Control -->
  <StripCode
    disabled={isProcessing}
    onStatusUpdate={handleStatusUpdate}
    onProcessingStart={handleProcessingStart}
    onProcessingEnd={handleProcessingEnd}
  />
</div>