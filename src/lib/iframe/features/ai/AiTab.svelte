<!-- $lib/iframe/features/ai/AiTab.svelte -->
<script lang="ts">
  import PromptDropdown from "./PromptDropdown.svelte";
  import DropCode from "./DropCode.svelte";
  import StripCode from "./StripCode.svelte";

  // Props with modern SvelteKit 5 syntax
  const props = $props<{
    context: any;
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
</script>

<div class="flex flex-col items-stretch w-full gap-3">
  <!-- Prompt Dropdown on top -->
  <div class="relative">
    <PromptDropdown
      isOpen={promptOpen}
      isProcessing={isProcessing}
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