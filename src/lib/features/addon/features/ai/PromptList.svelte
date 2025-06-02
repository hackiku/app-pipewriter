<!-- src/lib/features/addon/features/ai/PromptList.svelte - Enhanced UX -->
<script lang="ts">
  import { Plus, Trash2, Edit } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";

  const props = $props<{
    prompts: any[];
    selectedPrompt?: any;
    onPromptSelect: (prompt: any) => void;
    onNewPrompt?: () => void;
    onDeletePrompt?: (promptId: string) => void;
    onEditPrompt?: (prompt: any) => void;
    onRestorePrompt?: (promptId: string) => void;
    currentCategory?: string;
    showNewPromptOption?: boolean;
    isOperating?: boolean;
  }>();

  let deletePromptId = $state<string | null>(null);

  function truncateContent(content: string, maxLength: number = 120): string {
    if (!content || content.length <= maxLength) return content || '';
    return content.substring(0, maxLength).trim() + '...';
  }

  function handlePromptClick(prompt: any) {
    if (prompt.isLocked || props.isOperating) return;
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

  function handleRestoreClick(event: MouseEvent, promptId: string) {
    event.stopPropagation();
    if (props.isOperating) return;
    props.onRestorePrompt?.(promptId);
  }

  // Check if this is the deleted prompts view
  let isDeletedView = $derived(props.currentCategory === 'deleted');
</script>

<!-- Prompts List - Fixed height with scroll -->
<div class="h-[200px] overflow-y-auto scrollbar-hide">
  {#if !props.prompts || props.prompts.length === 0}
    <div class="p-4 text-center">
      <p class="text-muted-foreground text-sm">
        {isDeletedView ? 'No deleted prompts' : 'No prompts in this category'}
      </p>
    </div>
  {:else}
    {#each props.prompts as prompt, index (prompt?.id || index)}
      <div
        class="relative w-full p-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0 group cursor-pointer
          {props.selectedPrompt?.id === prompt?.id ? 'bg-primary/10 border-primary/30' : ''}
          {prompt?.isLocked ? 'opacity-60' : ''}
          {isDeletedView ? 'opacity-75' : ''}"
        onclick={() => handlePromptClick(prompt)}
        role="button"
        tabindex="0"
      >
        <!-- Main Content -->
        <div class="flex items-start justify-between gap-2 pr-12">
          <!-- Left: Title + Content (Full Width) -->
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm mb-1 truncate">
              {prompt?.title || `Prompt ${index + 1}`}
            </h4>
            <!-- 2 lines max with ellipsis -->
            <p class="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {truncateContent(prompt?.content || 'No content')}
            </p>
            
            <!-- Badges -->
            <div class="flex gap-1 mt-2">
              {#if prompt?.isLocked}
                <span class="text-[0.55rem] px-1 py-0.5 rounded bg-muted text-muted-foreground border">
                  {prompt?.metadata?.tier === 'pro' ? 'Pro' : 'Trial'}
                </span>
              {/if}
              {#if prompt?.isUserCustom}
                <span class="text-[0.55rem] px-1 py-0.5 rounded bg-blue-100 text-blue-800 border">Custom</span>
              {/if}
            </div>
          </div>
        </div>

        <!-- Top-Right Action Buttons -->
        <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {#if isDeletedView}
            <!-- Restore button for deleted prompts -->
            <Button
              variant="ghost"
              size="sm"
              class="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
              onclick={(e) => handleRestoreClick(e, prompt?.id)}
              disabled={props.isOperating}
              title="Restore prompt"
            >
              <Plus class="h-3 w-3" />
            </Button>
          {:else if prompt?.isUserCustom}
            <!-- Edit button for custom prompts -->
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
            
            <!-- Delete button for custom prompts -->
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
          {/if}
        </div>
      </div>
    {/each}
  {/if}

  <!-- New Prompt Button (as last item with dashed border) -->
  {#if props.showNewPromptOption && props.onNewPrompt && !isDeletedView}
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

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root open={!!deletePromptId} onOpenChange={(open) => !open && (deletePromptId = null)}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Prompt?</AlertDialog.Title>
      <AlertDialog.Description>
        This will move the prompt to your deleted items. You can restore it later.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={confirmDelete}>Delete</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<style>
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