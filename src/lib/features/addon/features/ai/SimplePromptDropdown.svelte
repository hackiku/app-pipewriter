<!-- src/lib/features/addon/features/ai/SimplePromptDropdown.svelte -->
<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { 
    ChevronDown, 
    X, 
    Edit, 
    Play, 
    Copy,
    Trash2,
    Plus
  } from "lucide-svelte";

  // Props (minimal)
  const props = $props<{
    onPromptSelect?: (prompt: any) => void;
  }>();

  // State
  let mode = $state<'list' | 'edit' | 'create'>('list');
  let selectedPrompt = $state<any>(null);
  let selectedCategory = $state("writing");
  let activePrompt = $state<any>(null);
  let isOpen = $state(false);
  let prompts = $state<any[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Load prompts on mount
  async function loadPrompts() {
    loading = true;
    error = null;
    
    try {
      console.log('🔄 Fetching prompts from /api/prompts/simple...');
      
      const response = await fetch('/api/prompts/simple');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }
      
      if (result.success) {
        prompts = result.prompts || [];
        console.log(`✅ Loaded ${prompts.length} prompts:`, prompts.slice(0, 3));
      } else {
        throw new Error(result.error || 'Failed to load prompts');
      }
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load prompts';
      console.error('❌ Load prompts error:', err);
      prompts = [];
    } finally {
      loading = false;
    }
  }

  // Load on mount
  $effect(() => {
    loadPrompts();
  });

  // Computed values with DEBUGGING
  let categories = $derived(() => {
    const counts: Record<string, number> = {};
    
    console.log('🔍 Analyzing prompts for categories:', prompts.length, 'prompts');
    console.log('Sample prompt structure:', prompts[0]);
    
    prompts.forEach((prompt, index) => {
      console.log(`Prompt ${index}: category="${prompt?.category}", title="${prompt?.title}"`);
      if (prompt?.category) {
        counts[prompt.category] = (counts[prompt.category] || 0) + 1;
      }
    });

    console.log('Category counts:', counts);

    const categoryList = [
      { id: "all", label: "All", count: prompts.length },
      ...Object.entries(counts).map(([id, count]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        count
      }))
    ];
    
    console.log('Final categories:', categoryList);
    return categoryList;
  });

  let filteredPrompts = $derived(() => {
    const filtered = selectedCategory === "all" 
      ? prompts 
      : prompts.filter(prompt => prompt?.category === selectedCategory);
    
    console.log(`🔍 Filtering for "${selectedCategory}": ${filtered.length} of ${prompts.length} prompts`);
    if (filtered.length === 0 && prompts.length > 0) {
      console.log('❌ Filter returned 0 results! Available categories:', 
        [...new Set(prompts.map(p => p?.category))]);
    }
    
    return filtered;
  });

  // Actions
  function toggleDropdown() {
    isOpen = !isOpen;
    if (!isOpen) {
      mode = 'list';
      selectedPrompt = null;
    }
  }

  function selectPrompt(prompt: any) {
    selectedPrompt = prompt;
    console.log(`✅ Selected: ${prompt?.title}`);
  }

  function activatePrompt() {
    if (!selectedPrompt) return;
    
    activePrompt = selectedPrompt;
    props.onPromptSelect?.(selectedPrompt);
    isOpen = false;
    mode = 'list';
    selectedPrompt = null;
    
    console.log(`🎯 Activated: ${activePrompt?.title}`);
  }

  function clearSelection() {
    selectedPrompt = null;
  }

  async function handleCopy() {
    if (!selectedPrompt?.content) return;
    try {
      await navigator.clipboard.writeText(selectedPrompt.content);
      console.log(`📋 Copied: ${selectedPrompt.title}`);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }

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

  let buttonClass = $derived(cn(
    "w-full justify-between px-3 h-9 font-normal text-sm",
    activePrompt && "border-primary/60 bg-primary/5 hover:bg-primary/10"
  ));
</script>

<div class="space-y-2">
  <!-- Status Info -->
  <div class="p-2 bg-green-50 dark:bg-green-950 rounded text-xs border border-green-200 dark:border-green-800">
    <strong>Simple Direct Fetch:</strong> 
    {#if loading}
      Loading prompts from DB...
    {:else if error}
      <span class="text-red-600">Error: {error}</span>
    {:else}
      Loaded {prompts.length} prompts, showing {filteredPrompts.length} in "{selectedCategory}"
    {/if}
    {#if activePrompt}
      <br><strong>Active:</strong> {activePrompt.title}
    {/if}
  </div>

  {#if isOpen}
    <div class="bg-background border rounded-lg shadow-sm overflow-hidden" transition:slide={{ duration: 200 }}>
      
      {#if loading}
        <!-- Loading State -->
        <div class="p-6 text-center">
          <div class="h-6 w-6 border-2 border-t-transparent border-primary rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-sm text-muted-foreground">Loading prompts...</p>
        </div>
      
      {:else if error}
        <!-- Error State -->
        <div class="p-4 text-center">
          <p class="text-sm text-destructive mb-2">Failed to load prompts</p>
          <p class="text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" class="mt-2" onclick={loadPrompts}>
            Retry
          </Button>
        </div>
      
      {:else}
        <!-- Success State -->
        <div>
          <!-- Category Tabs -->
          <div class="flex border-b bg-muted/30 overflow-x-auto">
            {#each categories as category}
              <button
                class="flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors
                  {selectedCategory === category.id 
                    ? 'text-primary border-b-2 border-primary bg-background' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }"
                onclick={() => {
                  selectedCategory = category.id;
                  selectedPrompt = null;
                }}
              >
                {category.label} ({category.count})
              </button>
            {/each}
          </div>

          <!-- Prompts List -->
          <div class="h-[180px] overflow-y-auto scrollbar-hide">
            {#if filteredPrompts.length === 0}
              <div class="p-4 text-center text-muted-foreground text-sm">
                No prompts in this category
              </div>
            {:else}
              {#each filteredPrompts as prompt (prompt.id)}
                <button
                  class="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0
                    {selectedPrompt?.id === prompt.id ? 'bg-primary/10 border-primary/30' : ''}"
                  onclick={() => selectPrompt(prompt)}
                >
                  <div class="flex items-start justify-between gap-3">
                    <!-- Left: Title + Content -->
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-sm mb-1 truncate">{prompt.title}</h4>
                      <p class="text-xs text-muted-foreground leading-relaxed">
                        {truncateContent(prompt.content)}
                      </p>
                    </div>
                    
                    <!-- Right: Category -->
                    <div class="flex flex-col items-end gap-1 flex-shrink-0">
                      <span class="text-[0.6rem] px-1.5 py-0.5 rounded font-medium {getCategoryColor(prompt.category)}">
                        {prompt.category}
                      </span>
                      <span class="text-[0.5rem] text-muted-foreground">
                        {prompt.tier}
                      </span>
                    </div>
                  </div>
                </button>
              {/each}
            {/if}
          </div>

          <!-- Action Buttons -->
          <div class="p-2 border-t bg-muted/20 flex items-center justify-between">
            <span class="text-xs text-muted-foreground">
              {prompts.length} system prompts loaded
            </span>

            {#if selectedPrompt}
              <div class="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  class="h-7 w-7 p-0" 
                  onclick={clearSelection}
                >
                  <X class="h-3 w-3" />
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  class="h-7 w-7 p-0" 
                  onclick={handleCopy}
                >
                  <Copy class="h-3 w-3" />
                </Button>

                <Button 
                  size="sm" 
                  class="h-7 px-3 gap-1" 
                  onclick={activatePrompt}
                >
                  <Play class="h-3 w-3" />
                  <span class="text-xs">Drop</span>
                </Button>
              </div>
            {:else}
              <span class="text-xs text-muted-foreground">
                Select a prompt
              </span>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Main Button -->
  <Button 
    variant="outline" 
    class={buttonClass} 
    onclick={toggleDropdown}
  >
    {#if activePrompt}
      <span class="font-medium text-foreground truncate">{activePrompt.title}</span>
    {:else}
      <span class="text-muted-foreground">Select prompt...</span>
    {/if}
    <ChevronDown class={cn("h-4 w-4 transition-transform duration-200 flex-shrink-0", isOpen && "rotate-180")} />
  </Button>
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