<!-- src/lib/features/addon/features/ai/PromptList.svelte - Bulletproof Version -->
<script lang="ts">
  const props = $props<{
    prompts: any[];
    selectedPrompt?: any;
    onPromptSelect: (prompt: any) => void;
  }>();

  function getCategoryColor(category: string) {
    const colors = {
      writing: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
      ux: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950", 
      marketing: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
      structure: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950",
      technical: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950"
    };
    return colors[category] || "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950";
  }

  function truncateContent(content: string, maxLength: number = 80): string {
    if (!content || content.length <= maxLength) return content || '';
    return content.substring(0, maxLength).trim() + '...';
  }

  // Debug the props
  $effect(() => {
    console.log('🔍 PromptList received:', {
      promptsCount: props.prompts?.length || 0,
      promptsArray: Array.isArray(props.prompts),
      firstPrompt: props.prompts?.[0],
      selectedPrompt: props.selectedPrompt?.title
    });
  });
</script>

<!-- 3 Prompts Visible, Scrollable -->
<div class="h-[180px] overflow-y-auto scrollbar-hide">
  {#if !props.prompts || props.prompts.length === 0}
    <div class="p-4 text-center">
      <p class="text-muted-foreground text-sm mb-2">No prompts in this category</p>
      <div class="text-xs text-left bg-gray-100 p-2 rounded">
        <strong>Debug:</strong><br>
        Props exists: {!!props.prompts}<br>
        Is array: {Array.isArray(props.prompts)}<br>
        Length: {props.prompts?.length || 0}<br>
        Raw: {JSON.stringify(props.prompts?.slice(0, 2), null, 2)}
      </div>
    </div>
  {:else}
    {#each props.prompts as prompt, index (prompt?.id || index)}
      <button
        class="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0
          {props.selectedPrompt?.id === prompt?.id ? 'bg-primary/10 border-primary/30' : ''}
          {prompt?.isLocked ? 'opacity-60' : ''}"
        onclick={() => !prompt?.isLocked && props.onPromptSelect(prompt)}
        disabled={prompt?.isLocked}
        title={prompt?.isLocked ? 'Upgrade to access this prompt' : ''}
      >
        <div class="flex items-start justify-between gap-3">
          <!-- Left: Title + Content Preview -->
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm mb-1 truncate">
              {prompt?.title || `Prompt ${index + 1}`}
            </h4>
            <p class="text-xs text-muted-foreground leading-relaxed">
              {truncateContent(prompt?.content || prompt?.description || 'No content')}
            </p>
          </div>
          
          <!-- Right: Category + Badges -->
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            <span class="text-[0.6rem] px-1.5 py-0.5 rounded font-medium {getCategoryColor(prompt?.category || 'writing')}">
              {prompt?.category || 'uncategorized'}
            </span>
            
            <div class="flex gap-1">
              {#if prompt?.isLocked}
                <span class="text-xs bg-muted text-muted-foreground px-1 py-0.5 rounded">
                  {prompt?.metadata?.tier === 'pro' ? 'Pro' : 'Trial'}
                </span>
              {/if}
              {#if prompt?.isUserCustom}
                <span class="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">Custom</span>
              {/if}
            </div>
          </div>
        </div>
      </button>
    {/each}
  {/if}
</div>

<style>
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>