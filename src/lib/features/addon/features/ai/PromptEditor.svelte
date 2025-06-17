<!-- src/lib/features/addon/features/ai/PromptEditor.svelte - CLEANED & SCROLLABLE -->
<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Select from "$lib/components/ui/select";
  import { Plus } from "@lucide/svelte";

  const props = $props<{
    prompt: {
      id: string;
      category: string;
      title: string;
      content: string;
    };
    onBack: () => void;
    onSave: (updatedPrompt: any) => void;
    onDelete?: (promptId: string) => void;
    onRestore?: (promptId: string) => void;
    isProcessing?: boolean;
    isNew?: boolean;
  }>();

  // Editable state
  let editTitle = $state(props.prompt.title);
  let editContent = $state(props.prompt.content);
  let editCategory = $state(props.prompt.category || 'writing');
  let customCategory = $state('');
  let showCustomCategory = $state(false);

  // Update local state when prompt changes
  $effect(() => {
    editTitle = props.prompt.title;
    editContent = props.prompt.content;
    editCategory = props.prompt.category || 'writing';
    showCustomCategory = false;
    customCategory = '';
  });

  // Validation
  let isValid = $derived(
    editTitle.trim().length > 0 && 
    editContent.trim().length > 0 && 
    (editCategory.trim().length > 0 || (showCustomCategory && customCategory.trim().length > 0))
  );

  // Track if changes were made (for existing prompts)
  let hasChanges = $derived(
    props.isNew || (
      editTitle !== props.prompt.title ||
      editContent !== props.prompt.content ||
      editCategory !== props.prompt.category
    )
  );

  // Predefined categories
  const categories = [
    { value: 'writing', label: 'Writing' },
    { value: 'ux', label: 'UX/UI' },
    { value: 'design', label: 'Design' },
    { value: 'code', label: 'Code' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'technical', label: 'Technical' },
    { value: 'structure', label: 'Structure' },
  ];

  function handleCategoryChange(value: string) {
    if (value === 'custom') {
      showCustomCategory = true;
      editCategory = '';
    } else {
      showCustomCategory = false;
      editCategory = value;
      customCategory = '';
    }
  }

  function getCategoryColor(category: string) {
    const colors = {
      writing: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
      ux: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950",
      design: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950",
      code: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950",
      marketing: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
      technical: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950",
      structure: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950"
    };
    return colors[category] || "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950";
  }

  let displayCategory = $derived(showCustomCategory ? customCategory || 'custom' : editCategory);
  let selectedValue = $derived(showCustomCategory ? 'custom' : editCategory);

  // Expose save function for parent to call
  export function save() {
    if (!isValid) return;
    
    const finalCategory = showCustomCategory && customCategory.trim() 
      ? customCategory.trim().toLowerCase()
      : editCategory;
    
    const updatedPrompt = {
      ...(props.isNew ? {} : { id: props.prompt.id }),
      title: editTitle.trim(),
      content: editContent.trim(),
      category: finalCategory
    };
    
    props.onSave(updatedPrompt);
  }

  // Expose delete function for parent to call  
  export function deletePrompt() {
    if (props.onDelete && props.prompt.id) {
      props.onDelete(props.prompt.id);
    }
  }

  // Expose restore function for parent to call
  export function restore() {
    if (props.onRestore && props.prompt.id) {
      props.onRestore(props.prompt.id);
    }
  }

  // Expose validation state
  export function getValidation() {
    return {
      isValid,
      hasChanges,
      errors: {
        title: !editTitle.trim() ? 'Title required' : null,
        content: !editContent.trim() ? 'Content required' : null,
        category: showCustomCategory && !customCategory.trim() ? 'Category required' : null
      }
    };
  }
</script>

<!-- SCROLLABLE CONTAINER with minimal scrollbar -->
<div class="prompt-editor-scroll overflow-y-auto max-h-[300px] pr-2">
  <div class="space-y-3">
    <!-- Header with Category -->
    <div class="flex items-center gap-2">
      <!-- Category Dropdown -->
      <div class="flex-1">
        <Select.Root value={selectedValue} onSelectedChange={handleCategoryChange}>
          <Select.Trigger class="h-7 px-2 text-xs border-0 gap-1 {getCategoryColor(displayCategory)}">
            <Select.Value placeholder="Select category">
              {#if showCustomCategory}
                Custom
              {:else}
                {categories.find(c => c.value === editCategory)?.label || editCategory}
              {/if}
            </Select.Value>
          </Select.Trigger>
          <Select.Content>
            {#each categories as category}
              <Select.Item value={category.value} class="text-xs">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[0.6rem] font-medium {getCategoryColor(category.value)}">
                  {category.label}
                </span>
              </Select.Item>
            {/each}
            <Select.Separator />
            <Select.Item value="custom" class="text-xs">
              <div class="flex items-center gap-1">
                <Plus class="h-3 w-3" />
                <span>Custom category</span>
              </div>
            </Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
      
      <!-- Status indicator -->
      <span class="text-xs text-muted-foreground flex-shrink-0">
        {props.isNew ? 'creating' : 'editing'}
      </span>
    </div>

    <!-- Custom Category Input -->
    {#if showCustomCategory}
      <div>
        <label for="custom-category" class="text-xs font-medium text-muted-foreground">Custom Category *</label>
        <Input
          id="custom-category"
          bind:value={customCategory}
          class="mt-1 h-8 text-sm"
          placeholder="Enter category name..."
          disabled={props.isProcessing}
        />
      </div>
    {/if}

    <!-- Title -->
    <div>
      <label for="prompt-title" class="text-xs font-medium text-muted-foreground">Title *</label>
      <Input
        id="prompt-title"
        bind:value={editTitle}
        class="mt-1 h-8 text-sm"
        placeholder="Prompt title..."
        disabled={props.isProcessing}
      />
    </div>

    <!-- Content -->
    <div>
      <label for="prompt-content" class="text-xs font-medium text-muted-foreground">Content *</label>
      <Textarea
        id="prompt-content"
        bind:value={editContent}
        class="mt-1 min-h-[120px] text-sm resize-none"
        placeholder="Enter the full prompt content..."
        disabled={props.isProcessing}
      />
      <div class="flex justify-between mt-1">
        <span class="text-[0.65rem] text-muted-foreground">Be specific for better results</span>
        <span class="text-[0.65rem] text-muted-foreground">{editContent.length} chars</span>
      </div>
    </div>

    <!-- Status Indicators -->
    <div class="flex items-center gap-2 pt-2">
      {#if !props.isNew && hasChanges}
        <span class="text-[0.65rem] text-amber-600 dark:text-amber-400">unsaved changes</span>
      {/if}
      
      {#if !isValid}
        <span class="text-[0.65rem] text-red-600 dark:text-red-400">
          {!editTitle.trim() ? 'title required' : 
           !editContent.trim() ? 'content required' : 
           showCustomCategory && !customCategory.trim() ? 'category required' : ''}
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Minimal scrollbar styling */
  .prompt-editor-scroll {
    /* Hide scrollbar for WebKit browsers */
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
  }
  
  .prompt-editor-scroll::-webkit-scrollbar {
    width: 4px;
  }
  
  .prompt-editor-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .prompt-editor-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 2px;
  }
  
  .prompt-editor-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }
  
  /* Smooth scrolling */
  .prompt-editor-scroll {
    scroll-behavior: smooth;
  }
</style>