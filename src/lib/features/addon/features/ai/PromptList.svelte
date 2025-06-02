<!-- src/lib/features/addon/features/ai/PromptList.svelte - PROXY FIX -->
<script lang="ts">
  import { Plus, Trash2, Edit } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

  const props = $props<{
    prompts: Record<string, any[]>;
    selectedPrompt?: any;
    onPromptSelect: (prompt: any) => void;
    onNewPrompt?: () => void;
    onDeletePrompt?: (promptId: string) => void;
    onEditPrompt?: (prompt: any) => void;
    currentCategory?: string;
    onCategoryChange?: (category: string) => void;
    isOperating?: boolean;
  }>();

  console.log('🚀 PromptList: Component mounted');

  let deletePromptId = $state<string | null>(null);
  let selectedCategory = $state(props.currentCategory || "all");

  // PROXY FIX: Convert proxy to plain object
  let plainPrompts = $derived(() => {
    console.log('🔧 PromptList: Converting proxy to plain object...');
    console.log('Raw props.prompts:', props.prompts);
    console.log('Type:', typeof props.prompts);
    console.log('Is array:', Array.isArray(props.prompts));
    console.log('Constructor:', props.prompts?.constructor?.name);
    
    // Handle various data structures
    if (!props.prompts) {
      console.log('❌ No prompts data');
      return {};
    }
    
    // Force convert proxy to plain object
    try {
      const plain = JSON.parse(JSON.stringify(props.prompts));
      console.log('✅ Converted to plain object:', plain);
      return plain;
    } catch (error) {
      console.error('❌ JSON conversion failed:', error);
      // Fallback: manually extract
      const manual = {};
      try {
        for (const key in props.prompts) {
          manual[key] = Array.isArray(props.prompts[key]) ? [...props.prompts[key]] : props.prompts[key];
        }
        console.log('✅ Manual extraction result:', manual);
        return manual;
      } catch (e) {
        console.error('❌ Manual extraction failed:', e);
        return {};
      }
    }
  });

  // Update selected category when prop changes
  $effect(() => {
    if (props.currentCategory) {
      selectedCategory = props.currentCategory;
    }
  });

  // Get all prompts as flat array - USING PLAIN PROMPTS
  let allPrompts = $derived(() => {
    console.log('📊 PromptList: Computing allPrompts from plainPrompts:', plainPrompts);
    const result = Object.values(plainPrompts || {}).flat();
    console.log('📊 PromptList: allPrompts result:', result);
    return result;
  });

  // Generate categories with counts - USING PLAIN PROMPTS
  let categories = $derived(() => {
    console.log('📂 PromptList: Computing categories from plainPrompts...');
    const counts: Record<string, number> = {};
    Object.entries(plainPrompts || {}).forEach(([category, prompts]) => {
      counts[category] = Array.isArray(prompts) ? prompts.length : 0;
    });

    const result = [
      { id: "all", label: "All", count: allPrompts.length },
      ...Object.entries(counts).map(([id, count]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        count
      }))
    ];
    
    console.log('📂 PromptList: categories result:', result);
    return result;
  });

  // Filter prompts based on selected category - USING PLAIN PROMPTS
  let filteredPrompts = $derived(() => {
    console.log('🔍 PromptList: Filtering for category:', selectedCategory);
    let result;
    if (selectedCategory === "all") {
      result = allPrompts;
    } else {
      const categoryData = plainPrompts[selectedCategory];
      result = Array.isArray(categoryData) ? categoryData : [];
    }
    console.log('🔍 PromptList: filteredPrompts result:', result);
    return result;
  });

  // Main debug effect
  $effect(() => {
    console.log('🔍 PromptList FULL DEBUG:', {
      // Raw props
      rawPropsPrompts: props.prompts,
      propsType: typeof props.prompts,
      
      // Plain conversion
      plainPrompts: plainPrompts,
      plainPromptsKeys: Object.keys(plainPrompts || {}),
      
      // Selected category
      selectedCategory,
      
      // Computed values
      allPromptsCount: allPrompts.length,
      categoriesCount: categories.length,
      filteredPromptsCount: filteredPrompts.length,
      
      // Sample data
      firstPrompt: allPrompts[0],
      firstCategory: categories[0],
      firstFiltered: filteredPrompts[0]
    });
  });

  function handleCategorySelect(categoryId: string) {
    console.log('📂 PromptList: Category selected:', categoryId);
    selectedCategory = categoryId;
    props.onCategoryChange?.(categoryId);
  }

  function truncateContent(content: string, maxLength: number = 120): string {
    if (!content || content.length <= maxLength) return content || '';
    return content.substring(0, maxLength).trim() + '...';
  }

  function handlePromptClick(prompt: any) {
    console.log('📝 PromptList: Prompt clicked:', prompt?.title);
    if (props.isOperating) return;
    props.onPromptSelect(prompt);
  }

  function handleDeleteClick(event: MouseEvent, promptId: string) {
    event.stopPropagation();
    if (props.isOperating) return;
    deletePromptId = promptId;
  }

  function handleEditClick(event: MouseEvent, prompt: any) {
    event.stopPropagation();
    if (props.isOperating) return;
    props.onEditPrompt?.(prompt);
  }

  function confirmDelete() {
    if (deletePromptId) {
      props.onDeletePrompt?.(deletePromptId);
      deletePromptId = null;
    }
  }

  function getCategoryColor(category: string) {
    const colors = {
      writing: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
      ux: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950", 
      marketing: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
      structure: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950",
      technical: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950",
      design: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950", 
      code: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950"
    };
    return colors[category] || "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950";
  }
</script>

<!-- ENHANCED DEBUG INFO -->
<div class="bg-yellow-50 border border-yellow-200 p-2 text-xs">
  <strong>PromptList Debug:</strong><br>
  Raw Type: {typeof props.prompts} | 
  Plain Keys: {Object.keys(plainPrompts || {}).join(', ')} | 
  Categories: {categories.length} | 
  All Prompts: {allPrompts.length} | 
  Filtered: {filteredPrompts.length} | 
  Selected: {selectedCategory}
</div>

<div class="space-y-0">
  <!-- Category Tabs - Scrollable horizontal -->
  <div class="border-b bg-muted/20">
    <div class="flex overflow-x-auto scrollbar-none gap-1 p-1">
      {#each categories as category}
        <button
          class="flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-colors rounded-sm
            {selectedCategory === category.id 
              ? 'bg-background text-foreground shadow-sm border' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }"
          onclick={() => handleCategorySelect(category.id)}
          disabled={props.isOperating}
        >
          {category.label}
          {#if category.count > 0}
            <span class="ml-1 text-[0.6rem] opacity-60">({category.count})</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Prompts List - Fixed height with scroll -->
  <div class="h-[200px] overflow-y-auto scrollbar-hide">
    <!-- DEBUG: Show what we're trying to render -->
    <div class="bg-blue-50 p-2 text-xs border-b">
      Rendering {filteredPrompts.length} prompts for category "{selectedCategory}"<br>
      Plain prompts keys: {Object.keys(plainPrompts || {}).join(', ')}<br>
      Category data: {JSON.stringify(plainPrompts[selectedCategory] || 'not found')}
    </div>

    {#if filteredPrompts.length === 0}
      <div class="p-4 text-center">
        <p class="text-muted-foreground text-sm">
          No prompts in this category
        </p>
        <p class="text-xs text-red-500 mt-1">
          Debug: filteredPrompts.length = {filteredPrompts.length}<br>
          Plain prompts: {JSON.stringify(plainPrompts)}
        </p>
      </div>
    {:else}
      {#each filteredPrompts as prompt, index (prompt?.id || `missing-${index}`)}
        <div class="bg-green-50 border border-green-200 m-1 p-2 text-xs">
          <strong>Prompt {index + 1}:</strong> {prompt?.title || 'NO TITLE'} | 
          ID: {prompt?.id || 'NO ID'} | 
          Category: {prompt?.category || 'NO CATEGORY'}
        </div>
        
        <div
          class="relative w-full p-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0 group cursor-pointer
            {props.selectedPrompt?.id === prompt?.id ? 'bg-primary/10 border-primary/30' : ''}"
          onclick={() => handlePromptClick(prompt)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && handlePromptClick(prompt)}
        >
          <!-- Main Content -->
          <div class="flex items-start justify-between gap-2 pr-12">
            <!-- Left: Title + Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-medium text-sm truncate">
                  {prompt?.title || `Prompt ${index + 1}`}
                </h4>
                <span class="text-[0.6rem] px-1.5 py-0.5 rounded font-medium {getCategoryColor(prompt?.category)}">
                  {prompt?.category}
                </span>
                <!-- Show default badge for prompts copied from system -->
                {#if prompt?.metadata?.isDefault}
                  <span class="text-[0.55rem] px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 border">Default</span>
                {/if}
              </div>
              <!-- Content preview - 2 lines max -->
              <p class="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {truncateContent(prompt?.content || 'No content')}
              </p>
            </div>
          </div>

          <!-- Top-Right Action Buttons -->
          <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- Edit button -->
            <Button
              variant="ghost"
              size="sm"
              class="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
              onclick={(e) => handleEditClick(e, prompt)}
              disabled={props.isOperating}
              title="Edit prompt"
            >
              <Edit class="h-3 w-3" />
            </Button>
            
            <!-- Delete button -->
            <Button
              variant="ghost"
              size="sm"
              class="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive/60 hover:text-destructive"
              onclick={(e) => handleDeleteClick(e, prompt?.id)}
              disabled={props.isOperating}
              title="Delete prompt"
            >
              <Trash2 class="h-3 w-3" />
            </Button>
          </div>
        </div>
      {/each}
    {/if}

    <!-- New Prompt Button -->
    {#if props.onNewPrompt}
      <button
        class="w-full p-3 text-left hover:bg-muted/30 transition-colors border-2 border-dashed border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
        onclick={props.onNewPrompt}
        disabled={props.isOperating}
      >
        <div class="flex items-center gap-2">
          <Plus class="h-4 w-4" />
          <span class="text-sm font-medium">New Prompt</span>
        </div>
      </button>
    {/if}
  </div>
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root open={!!deletePromptId} onOpenChange={(open) => !open && (deletePromptId = null)}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Prompt?</AlertDialog.Title>
      <AlertDialog.Description>
        This prompt will be permanently deleted. You can always create a new one.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={confirmDelete}>Delete</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<style>
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>