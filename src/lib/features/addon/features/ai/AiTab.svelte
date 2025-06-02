<!-- src/lib/features/addon/features/ai/AiTab.svelte - FINAL WORKING VERSION -->
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
  let activePrompt = $state<any>(null);
  let promptOpen = $state(false);

  // Status handlers
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

  // Prompt handlers
  function handlePromptSelect(prompt: any) {
    activePrompt = prompt;
    console.log(`🎯 AiTab: Active prompt set to: ${prompt?.title || 'none'}`);
  }

  function handleToggleOpen() {
    promptOpen = !promptOpen;
  }

  // Refresh prompts after CRUD operations
  async function refreshPrompts() {
    console.log('🔄 AiTab: Prompts refresh requested (TODO: implement)');
    // TODO: This will eventually call the API for user CRUD operations
  }

  // Debug server props
  $effect(() => {
    console.log('🔍 AiTab received props:', {
      promptsExists: !!props.prompts,
      promptsType: typeof props.prompts,
      promptsKeys: props.prompts ? Object.keys(props.prompts) : [],
      sampleCategory: props.prompts ? Object.entries(props.prompts)[0] : null
    });
  });
</script>

<div class="flex flex-col items-stretch w-full gap-2">
  <!-- Working Prompt Dropdown - Uses EXACT same pattern as dropper -->
  <div class="relative">
    <PromptDropdown
      prompts={props.prompts}
      features={props.features}
      isOpen={promptOpen}
      isProcessing={isProcessing}
      activePrompt={activePrompt}
      onPromptSelect={handlePromptSelect}
      onToggleOpen={handleToggleOpen}
      onPromptsUpdate={refreshPrompts}
    />
  </div>

  <!-- Code Actions -->
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