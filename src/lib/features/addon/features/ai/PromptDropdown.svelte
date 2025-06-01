<!-- src/lib/features/addon/features/ai/PromptDropdown.svelte - DEBUG VERSION -->
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

  // DEBUG: Log the data
  $effect(() => {
    console.log('🔍 PromptDropdown Debug:', {
      prompts: props.prompts,
      promptsKeys: Object.keys(props.prompts || {}),
      promptsCount: Object.values(props.prompts || {}).flat().length,
      editMode,
      createMode,
      selectedCategory,
      isOpen: props.isOpen
    });
  });

  let allPrompts = $derived(() => {
    const flattened = Object.values(props.prompts || {}).flat();
    console.log('📋 All prompts:', flattened.length, flattened.map(p => p.title));
    return flattened;
  });

  let categories = $derived(() => {
    const counts: Record<string, number> = {};
    Object.entries(props.prompts || {}).forEach(([category, prompts]) => {
      counts[category] = prompts.length;
    });

    const cats = [
      { id: "all", label: "All", count: allPrompts.length },
      ...Object.entries(counts).map(([id, count]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        count
      }))
    ];
    
    console.log('📂 Categories:', cats);
    return cats;
  });

  let filteredPrompts = $derived(() => {
    let filtered;
    if (selectedCategory === "all") {
      filtered = allPrompts;
    } else {
      filtered = (props.prompts || {})[selectedCategory] || [];
    }
    console.log(`🔍 Filtered prompts for "${selectedCategory}":`, filtered.length, filtered.map(p => p.title));
    return filtered;
  });

  function selectPrompt(prompt) {
    console.log('✅ Selecting prompt:', prompt.title);
    props.onPromptSelect(prompt);
    editMode = false;
    createMode = false;
  }

  function clearPrompt() {
    console.log('❌ Clearing prompt');
    props.onPromptSelect(null);
    editMode = false;
    createMode = false;
  }

  function startEdit() {
    console.log('✏️ Starting edit mode');
    if (!props.activePrompt) return;
    editMode = true;
    createMode = false;
  }

  function startCreate(event) {
    console.log('➕ Starting create mode');
    event?.preventDefault();
    event?.stopPropagation();
    
    editMode = false;
    createMode = true;
    // DON'T call clearPrompt() - it resets createMode!
    props.onPromptSelect(null); // Just clear the active prompt
    
    console.log('📝 Create mode set:', { editMode, createMode });
  }

  function backToList() {
    console.log('⬅️ Back to list');
    editMode = false;
    createMode = false;
  }

  // Rest of functions unchanged...
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
      
      <!-- DEBUG INFO -->
      <div class="p-2 bg-yellow-50 border-b text-xs">
        <strong>DEBUG:</strong> 
        Prompts: {Object.keys(props.prompts || {}).length} categories, 
        {allPrompts.length} total, 
        Mode: {createMode ? 'CREATE' : editMode ? 'EDIT' : 'BROWSE'}
      </div>
      
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
          <div class="p-2 bg-green-50 text-xs mb-2">CREATE MODE ACTIVE</div>
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

      {:else if Object.keys(props.prompts || {}).length === 0}
        <!-- No prompts -->
        <div class="p-6 text-center">
          <p class="text-muted-foreground text-sm">No prompts available</p>
          <p class="text-xs text-red-500">DEBUG: Empty prompts object</p>
        </div>

      {:else}
        <!-- Browse Mode -->
        <div>
          <div class="p-2 bg-blue-50 text-xs">BROWSE MODE - {filteredPrompts.length} prompts shown</div>
          
          <!-- Category Tabs -->
          <div class="flex border-b bg-muted/30 overflow-x-auto">
            {#each categories as category}
              <button
                class="flex-shrink-0 px-2 py-2 text-xs font-medium transition-colors
                  {selectedCategory === category.id 
                    ? 'text-primary border-b-2 border-primary bg-background' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }"
                onclick={() => {
                  console.log('📂 Switching to category:', category.id);
                  selectedCategory = category.id;
                }}
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
                <p class="text-xs text-red-500">DEBUG: Category "{selectedCategory}" has 0 prompts</p>
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
              <!-- New Prompt - FIXED EVENT HANDLING -->
              <button
                class="h-7 px-2 gap-1 text-xs flex items-center border border-border rounded hover:bg-muted"
                onclick={startCreate}
                disabled={isOperating}
              >
                <Plus class="h-3 w-3" />
                <span>New</span>
              </button>
              
              <!-- DEBUG BUTTON -->
              <button
                class="h-7 px-2 gap-1 text-xs flex items-center border border-yellow-500 rounded bg-yellow-100"
                onclick={() => console.log('🐛 Current state:', { editMode, createMode, allPrompts: allPrompts.length })}
              >
                Debug
              </button>
            </div>

            {#if props.activePrompt && !props.activePrompt.isLocked}
              <div class="flex items-center gap-1">
                <Button variant="ghost" size="sm" class="h-7 w-7 p-0" onclick={clearPrompt} disabled={isOperating}>
                  <X class="h-3 w-3" />
                </Button>

                <Button variant="ghost" size="sm" class="h-7 w-7 p-0" onclick={copyPrompt} disabled={isOperating}>
                  <Copy class="h-3 w-3" />
                </Button>

                {#if props.activePrompt.isUserCustom}
                  <Button variant="ghost" size="sm" class="h-7 w-7 p-0" onclick={startEdit} disabled={isOperating}>
                    <Edit class="h-3 w-3" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" class="h-7 w-7 p-0 text-destructive" 
                          onclick={() => deletePrompt(props.activePrompt.id)} disabled={isOperating}>
                    <Trash2 class="h-3 w-3" />
                  </Button>
                {/if}

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