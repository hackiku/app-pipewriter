<!-- $lib/iframe/features/ai/PromptEditor.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea";
  import { ArrowLeft, Save, Play } from "lucide-svelte";

  // Props
  const props = $props<{
    prompt: {
      id: string;
      category: string;
      title: string;
      description: string;
      content: string;
    };
    onBack: () => void;
    onSave: (updatedPrompt: any) => void;
    onDrop: () => void;
    isProcessing?: boolean;
  }>();

  // Editable state
  let editTitle = $state(props.prompt.title);
  let editDescription = $state(props.prompt.description);
  let editContent = $state(props.prompt.content);

  // Track if changes were made
  let hasChanges = $derived(
    editTitle !== props.prompt.title ||
    editDescription !== props.prompt.description ||
    editContent !== props.prompt.content
  );

  function handleSave() {
    const updatedPrompt = {
      ...props.prompt,
      title: editTitle,
      description: editDescription,
      content: editContent
    };
    props.onSave(updatedPrompt);
  }

  function getCategoryColor(category: string) {
    const colors = {
      writing: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
      code: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950", 
      design: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950"
    };
    return colors[category] || "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950";
  }
</script>

<div class="space-y-3">
  <!-- Header with category and back button -->
  <div class="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      class="h-7 w-7 p-0"
      onclick={props.onBack}
      disabled={props.isProcessing}
      title="Back to list"
    >
      <ArrowLeft class="h-3 w-3" />
    </Button>
    
    <span class="inline-flex items-center px-2 py-1 rounded text-[0.65rem] font-medium {getCategoryColor(props.prompt.category)}">
      {props.prompt.category}
    </span>
    
    <span class="text-xs text-muted-foreground">editing</span>
  </div>

  <!-- Title Input -->
  <div>
    <label class="text-xs font-medium text-muted-foreground">Title</label>
    <input
      type="text"
      bind:value={editTitle}
      class="w-full mt-1 px-2 py-1.5 text-sm font-medium bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
      placeholder="Prompt title..."
      disabled={props.isProcessing}
    />
  </div>

  <!-- Description Input -->
  <div>
    <label class="text-xs font-medium text-muted-foreground">Description</label>
    <input
      type="text"
      bind:value={editDescription}
      class="w-full mt-1 px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
      placeholder="Brief description..."
      disabled={props.isProcessing}
    />
  </div>

  <!-- Content Textarea -->
  <div>
    <label class="text-xs font-medium text-muted-foreground">Prompt Content</label>
    <Textarea
      bind:value={editContent}
      class="w-full mt-1 min-h-[80px] text-sm resize-none"
      placeholder="Enter the full prompt content..."
      disabled={props.isProcessing}
    />
    <div class="flex justify-between mt-1">
      <span class="text-[0.65rem] text-muted-foreground">Be specific for better AI results</span>
      <span class="text-[0.65rem] text-muted-foreground">{editContent.length} chars</span>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex items-center justify-between pt-2 border-t">
    <div class="flex items-center gap-2">
      <!-- Save Button -->
      <Button
        variant="outline"
        size="sm" 
        class="h-7 px-3 gap-1"
        onclick={handleSave}
        disabled={props.isProcessing || !hasChanges}
      >
        <Save class="h-3 w-3" />
        <span class="text-xs">Save</span>
      </Button>
      
      {#if hasChanges}
        <span class="text-[0.65rem] text-amber-600 dark:text-amber-400">unsaved changes</span>
      {/if}
    </div>

    <!-- Drop Button -->
    <Button
      size="sm"
      class="h-7 px-3 gap-1"
      onclick={props.onDrop}
      disabled={props.isProcessing}
    >
      <Play class="h-3 w-3" />
      <span class="text-xs font-medium">Drop</span>
    </Button>
  </div>
</div>