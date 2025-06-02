<!-- src/lib/features/addon/features/ai/AiTab.svelte - FIXED FINAL -->
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
  let currentPrompts = $state(props.prompts);

  // Debug logs
  $effect(() => {
    console.log('🔍 AiTab received props:', {
      promptsExists: !!props.prompts,
      promptsType: typeof props.prompts,
      promptsKeys: Object.keys(props.prompts || {}),
      sampleCategory: Object.values(props.prompts || {})[0]
    });
  });

  // Debug prompts state
  $effect(() => {
    console.log('🔍 AiTab prompts state:', {
      propsPrompts: Object.keys(props.prompts || {}),
      currentPrompts: Object.keys(currentPrompts || {}),
      totalPrompts: Object.values(currentPrompts || {}).flat().length,
      activePrompt: activePrompt?.title || 'none'
    });
  });

  $effect(() => {
    if (activePrompt) {
      console.log('🎯 AiTab: Active prompt set to:', activePrompt.title);
    } else {
      console.log('🎯 AiTab: Active prompt set to: none');
    }
  });

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
    console.log('📝 AiTab: Prompt selected:', prompt?.title || 'cleared');
  }

  function handlePromptClear() {
    activePrompt = null;
    console.log('🧹 AiTab: Prompt cleared');
  }

  // FIXED: Actual refresh implementation
  async function refreshPrompts() {
    try {
      console.log('🔄 AiTab: Starting prompts refresh...');
      
      handleStatusUpdate({
        type: 'processing',
        message: 'Refreshing prompts...'
      });

      const response = await fetch('/api/prompts');
      const result = await response.json();
      
      if (result.success) {
        currentPrompts = result.prompts;
        
        console.log('✅ AiTab: Prompts refreshed:', {
          categories: Object.keys(currentPrompts).length,
          total: Object.values(currentPrompts).flat().length,
          breakdown: Object.entries(currentPrompts).map(([cat, prompts]) => `${cat}:${prompts.length}`).join(', ')
        });
        
        // Clear active prompt if it was deleted
        if (activePrompt && !findPromptById(activePrompt.id)) {
          activePrompt = null;
        }

        handleStatusUpdate({
          type: 'success',
          message: 'Prompts updated',
          executionTime: 200
        });
      } else {
        throw new Error(result.error || 'Failed to refresh prompts');
      }
    } catch (error) {
      console.error('❌ AiTab: Prompts refresh failed:', error);
      handleStatusUpdate({
        type: 'error',
        message: 'Failed to refresh prompts',
        error: error
      });
    }
  }

  // Helper to find prompt by ID across all categories
  function findPromptById(id: string) {
    for (const category of Object.values(currentPrompts)) {
      const prompt = category.find(p => p.id === id);
      if (prompt) return prompt;
    }
    return null;
  }

  // Update current prompts when props change (initial load)
  $effect(() => {
    currentPrompts = props.prompts;
    console.log('🔄 AiTab: Props prompts updated:', Object.keys(props.prompts || {}).length, 'categories');
  });
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
      onPromptClear={handlePromptClear}
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