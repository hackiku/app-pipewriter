<!-- src/lib/features/addon/features/ai/PromptEditor.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { ArrowLeft, Save, Play, Loader2 } from "@lucide/svelte";

  const props = $props<{
    prompt: {
      id: string;
      category: string;
      title: string;
      content: string;
    };
    onBack: () => void;
    onSave: (updatedPrompt: any) => void;
    onDrop: () => void;
    isProcessing?: boolean;
    isNew?: boolean;
  }>();

  // Editable state
  let editTitle = $state(props.prompt.title);
  let editContent = $state(props.prompt.content);
  let editCategory = $state(props.prompt.category || 'writing');

  // Update local state when prompt changes (for editing different prompts)
  $effect(() => {
    editTitle = props.prompt.title;
    editContent = props.prompt.content;
    editCategory = props.prompt.category || 'writing';
  });

  // Validation
  let isValid = $derived(
    editTitle.trim().length > 0 && 
    editContent.trim().length > 0 && 
    editCategory.trim().length > 0
  );

  // Track if changes were made (for existing prompts)
  let hasChanges = $derived(
    props.isNew || (
      editTitle !== props.prompt.title ||
      editContent !== props.prompt.content ||
      editCategory !== props.prompt.category
    )
  );

  function handleSave() {
    if (!isValid) return;
    
    const updatedPrompt = {
      ...(props.isNew ? {} : { id: props.prompt.id }),
      title: editTitle.trim(),
      content: editContent.trim(),
      category: editCategory
    };
    
    props.onSave(updatedPrompt);
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

  const categories = [
    { value: 'writing', label: 'Writing' },
    { value: 'ux', label: 'UX/UI' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'structure', label: 'Structure' },
    { value: 'technical', label: 'Technical' },
    { value: 'design', label: 'Design' },
    { value: 'code', label: 'Code' }
  ];
</script>

<div class="space-y-3">
  <!-- Header -->
  <div class="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      class="h-7 w-7 p-0"
      onclick={props.onBack}
      disabled={props.isProcessing}
    >
      <ArrowLeft class="h-3 w-3" />
    </Button>
    
    <span class="inline-flex items-center px-2 py-1 rounded text-[0.65rem] font-medium {getCategoryColor(editCategory)}">
      {editCategory}
    </span>
    
    <span class="text-xs text-muted-foreground">
      {props.isNew ? 'creating' : 'editing'}
    </span>
  </div>

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

  <!-- Category (for new prompts) -->
  {#if props.isNew}
    <div>
      <label for="prompt-category" class="text-xs font-medium text-muted-foreground">Category *</label>
      <select 
        id="prompt-category"
        bind:value={editCategory}
        class="w-full mt-1 h-8 px-2 text-sm border border-border rounded-md bg-background"
        disabled={props.isProcessing}
      >
        {#each categories as category}
          <option value={category.value}>{category.label}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Content -->
  <div>
    <label for="prompt-content" class="text-xs font-medium text-muted-foreground">Content *</label>
    <Textarea
      id="prompt-content"
      bind:value={editContent}
      class="mt-1 min-h-[80px] text-sm resize-none"
      placeholder="Enter the full prompt content..."
      disabled={props.isProcessing}
    />
    <div class="flex justify-between mt-1">
      <span class="text-[0.65rem] text-muted-foreground">Be specific for better results</span>
      <span class="text-[0.65rem] text-muted-foreground">{editContent.length} chars</span>
    </div>
  </div>

  <!-- Actions -->
  <div class="flex items-center justify-between pt-2 border-t">
    <div class="flex items-center gap-2">
      <!-- Save -->
      <Button
        variant="outline"
        size="sm" 
        class="h-7 px-3 gap-1"
        onclick={handleSave}
        disabled={props.isProcessing || !isValid || (!props.isNew && !hasChanges)}
      >
        {#if props.isProcessing}
          <Loader2 class="h-3 w-3 animate-spin" />
        {:else}
          <Save class="h-3 w-3" />
        {/if}
        <span class="text-xs">{props.isNew ? 'Create' : 'Save'}</span>
      </Button>
      
      <!-- Status indicators -->
      {#if !props.isNew && hasChanges}
        <span class="text-[0.65rem] text-amber-600 dark:text-amber-400">unsaved</span>
      {/if}
      
      {#if !isValid}
        <span class="text-[0.65rem] text-red-600 dark:text-red-400">
          {!editTitle.trim() ? 'title required' : !editContent.trim() ? 'content required' : ''}
        </span>
      {/if}
    </div>

    <!-- Drop (only for existing prompts) -->
    {#if !props.isNew}
      <Button
        size="sm"
        class="h-7 px-3 gap-1"
        onclick={props.onDrop}
        disabled={props.isProcessing}
      >
        <Play class="h-3 w-3" />
        <span class="text-xs">Drop</span>
      </Button>
    {/if}
  </div>
</div>