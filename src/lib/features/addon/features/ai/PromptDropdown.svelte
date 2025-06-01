<!-- src/lib/features/addon/features/ai/PromptDropdown.svelte -->
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
  } from "@lucide/svelte";
  import PromptEditor from "./PromptEditor.svelte";
  
  const props = $props<{
    prompts: Record<string, any[]>;
    features: any;
    isProcessing?: boolean;
    isOpen?: boolean;
    activePrompt?: any;
    onPromptSelect: (prompt: any) => void;
    onToggleOpen: () => void;
    onPromptsUpdate: () => void;
  }>();

  // State
  let editMode = $state(false);
  let createMode = $state(false);
  let selectedCategory = $state("all");
  let isOperating = $state(false);

  let allPrompts = $derived(() => {
    return Object.values(props.prompts).flat();
  });

  let categories = $derived(() => {
    const counts: Record<string, number> = {};
    Object.entries(props.prompts).forEach(([category, prompts]) => {
      counts[category] = prompts.length;
    });

    return [
      { id: "all", label: "All", count: allPrompts.length },
      ...Object.entries(counts).map(([id, count]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        count
      }))
    ];
  });

  let filteredPrompts = $derived(() => {
    if (selectedCategory === "all") {
      return allPrompts;
    }
    return props.prompts[selectedCategory] || [];
  });

  function selectPrompt(prompt) {
    props.onPromptSelect(prompt);
    editMode = false;
    createMode = false;
  }

  function clearPrompt() {
    props.onPromptSelect(null);
    editMode = false;
    createMode = false;
  }

  function startEdit() {
    if (!props.activePrompt) return;
    editMode = true;
    createMode = false;
  }

  function startCreate() {
    editMode = false;
    createMode = true;
    clearPrompt();
  }

  function backToList() {
    editMode = false;
    createMode = false;
  }

  function dropPrompt() {
    if (!props.activePrompt) return;
    props.onToggleOpen();
  }

  async function copyPrompt() {
    if (!props.activePrompt) return;
    try {
      await navigator.clipboard.writeText(props.activePrompt.content);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  }

  async function deletePrompt(promptId: string) {
    if (isOperating || !confirm('Delete this prompt?')) return;
    
    isOperating = true;
    try {
      const response = await fetch(`/api/prompts?id=${promptId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        if (props.activePrompt?.id === promptId) {
          clearPrompt();
        }
        await props.onPromptsUpdate();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      isOperating = false;
    }
  }

  async function savePrompt(promptData: any, isNew: boolean = false) {
    if (isOperating) return;
    
    isOperating = true;
    try {
      const method = isNew ? 'POST' : 'PUT';
      const response = await fetch('/api/prompts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      });
      
      const result = await response.json();
      if (result.success) {
        await props.onPromptsUpdate();
        backToList();
        if (isNew) {
          // Auto-select the new prompt
          setTimeout(() => {
            const newPrompt = allPrompts.find(p => p.id === promptData.id);
            if (newPrompt) selectPrompt(newPrompt);
          }, 100);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      isOperating = false;
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

  let buttonClass = $derived(cn(
    "w-full justify-between px-3 h-9 font-normal text-sm",
    props.activePrompt && "border-primary/60 bg-primary/5 hover:bg-primary/10"
  ));
</script>

<div class="space-y-2">
  {#if props.isOpen}
    <div class="bg-background border rounded-lg shadow-sm overflow-hidden" transition:slide={{ duration: 200 }}>
      
      {#if editMode && props.activePrompt}
        <!-- Edit Mode -->
        <div class="p-3" transition:fade={{ duration: 150 }}>
          <PromptEditor 
            prompt={props.activePrompt}
            onBack={backToList}
            onSave={(data) => savePrompt(data, false)}
            onDrop={dropPrompt}
            isProcessing={isOperating || props.isProcessing}
          />
        </div>

      {:else if createMode}
        <!-- Create Mode -->
        <div class="p-3" transition:fade={{ duration: 150 }}>
          <PromptEditor 
            prompt={{
              id: '',
              title: '',
              description: '',
              content: '',
              category: 'writing'
            }}
            onBack={backToList}
            onSave={(data) => savePrompt({ 
              ...data, 
              id: data.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 50)
            }, true)}
            onDrop={() => {}}
            isProcessing={isOperating || props.isProcessing}
            isNew={true}
          />
        </div>

      {:else if Object.keys(props.prompts).length === 0}
        <!-- No prompts -->
        <div class="p-6 text-center">
          <p class="text-muted-foreground text-sm">No prompts available</p>
        </div>

      {:else}
        <!-- Browse Mode -->
        <div>
          <!-- Category Tabs -->
          <div class="flex border-b bg-muted/30 overflow-x-auto">
            {#each categories as category}
              <button
                class="flex-shrink-0 px-2 py-2 text-xs font-medium transition-colors
                  {selectedCategory === category.id 
                    ? 'text-primary border-b-2 border-primary bg-background' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }"
                onclick={() => selectedCategory = category.id}
              >
                {category.label} ({category.count})
              </button>
            {/each}
          </div>

          <!-- Prompts List -->
          <div class="max-h-[180px] overflow-y-auto">
            {#if filteredPrompts.length === 0}
              <div class="p-4 text-center text-muted-foreground text-sm">
                No prompts in this category
              </div>
            {:else}
              {#each filteredPrompts as prompt (prompt.id)}
                <button
                  class="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 relative
                    {props.activePrompt?.id === prompt.id ? 'bg-primary/5 border-primary/20' : ''}
                    {prompt.isLocked ? 'opacity-60' : ''}"
                  onclick={() => !prompt.isLocked && selectPrompt(prompt)}
                  disabled={props.isProcessing || prompt.isLocked || isOperating}
                  title={prompt.isLocked ? 'Upgrade to access this prompt' : prompt.description}
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0 pr-2">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-medium text-sm truncate">{prompt.title}</h4>
                        <span class="text-[0.6rem] px-1.5 py-0.5 rounded font-medium {getCategoryColor(prompt.category)}">
                          {prompt.category}
                        </span>
                        {#if prompt.isLocked}
                          <span class="text-xs bg-muted text-muted-foreground px-1 py-0.5 rounded">
                            {prompt.metadata?.tier === 'pro' ? 'Pro' : 'Trial'}
                          </span>
                        {/if}
                        {#if prompt.isUserCustom}
                          <span class="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">Custom</span>
                        {/if}
                      </div>
                      <p class="text-xs text-muted-foreground line-clamp-1">{prompt.description}</p>
                    </div>
                  </div>
                </button>
              {/each}
            {/if}
          </div>

          <!-- Action Buttons -->
          <div class="p-2 border-t bg-muted/20 flex items-center justify-between">
            <div class="flex items-center gap-1">
              <!-- New Prompt -->
              <Button variant="ghost" size="sm" class="h-7 px-2 gap-1" onclick={startCreate} disabled={isOperating}>
                <Plus class="h-3 w-3" />
                <span class="text-xs">New</span>
              </Button>
            </div>

            {#if props.activePrompt && !props.activePrompt.isLocked}
              <div class="flex items-center gap-1">
                <!-- Clear -->
                <Button variant="ghost" size="sm" class="h-7 w-7 p-0" onclick={clearPrompt} disabled={isOperating}>
                  <X class="h-3 w-3" />
                </Button>

                <!-- Copy -->
                <Button variant="ghost" size="sm" class="h-7 w-7 p-0" onclick={copyPrompt} disabled={isOperating}>
                  <Copy class="h-3 w-3" />
                </Button>

                <!-- Edit (only for custom prompts) -->
                {#if props.activePrompt.isUserCustom}
                  <Button variant="ghost" size="sm" class="h-7 w-7 p-0" onclick={startEdit} disabled={isOperating}>
                    <Edit class="h-3 w-3" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" class="h-7 w-7 p-0 text-destructive" 
                          onclick={() => deletePrompt(props.activePrompt.id)} disabled={isOperating}>
                    <Trash2 class="h-3 w-3" />
                  </Button>
                {/if}

                <!-- Drop -->
                <Button size="sm" class="h-7 px-3 gap-1" onclick={dropPrompt} disabled={isOperating}>
                  <Play class="h-3 w-3" />
                  <span class="text-xs">Drop</span>
                </Button>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Main Button -->
  <Button variant="outline" class={buttonClass} onclick={props.onToggleOpen} disabled={props.isProcessing || isOperating}>
    {#if props.activePrompt}
      <span class="font-medium text-foreground truncate">{props.activePrompt.title}</span>
    {:else}
      <span class="text-muted-foreground">Select prompt...</span>
    {/if}
    <ChevronDown class={cn("h-4 w-4 transition-transform duration-200 flex-shrink-0", props.isOpen && "rotate-180")} />
  </Button>
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>