<!-- src/lib/features/addon/features/ai/PromptDropdown.svelte - UX ENHANCED -->
<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { ChevronDown } from "@lucide/svelte";
  import PromptList from "./PromptList.svelte";
  import PromptEditor from "./PromptEditor.svelte";
  import PromptControls from "./PromptControls.svelte";
  
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
  let editingExisting = $state(false);
  let selectedCategory = $state("all"); // Start with "All" open by default
  let isOperating = $state(false);
  let includeCode = $state(false);
  let editorRef = $state<any>(null);

  // Get all prompts as regular array
  function getAllPrompts() {
    if (!props.prompts) return [];
    return Object.values(props.prompts).flat();
  }

  // Categories for horizontal tabs (including Recently Deleted)
  let categories = $derived(() => {
    const counts: Record<string, number> = {};
    Object.entries(props.prompts || {}).forEach(([category, prompts]) => {
      counts[category] = prompts.length;
    });

    const tabs = [
      { id: "all", label: "All", count: getAllPrompts().length },
      ...Object.entries(counts).map(([id, count]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        count
      })),
      { id: "deleted", label: "Deleted", count: 0 } // TODO: Get deleted count from API
    ];

    return tabs;
  });

  // Get filtered prompts as regular array
  async function getFilteredPrompts() {
    if (selectedCategory === "all") {
      return getAllPrompts();
    } else if (selectedCategory === "deleted") {
      // Load deleted prompts from API
      try {
        const response = await fetch('/api/prompts?deleted=true');
        const result = await response.json();
        if (result.success) {
          return result.prompts.deleted || [];
        }
      } catch (error) {
        console.error('Failed to load deleted prompts:', error);
      }
      return [];
    } else {
      return (props.prompts || {})[selectedCategory] || [];
    }
  }

  // Track filtered prompts reactively
  let filteredPrompts = $state<any[]>([]);
  
  // Update filtered prompts when category changes
  $effect(async () => {
    filteredPrompts = await getFilteredPrompts();
  });

  function selectPrompt(prompt) {
    // Allow deselecting by clicking the same prompt
    if (props.activePrompt?.id === prompt.id) {
      console.log('🔄 Deselecting prompt');
      props.onPromptSelect(null);
    } else {
      console.log('✅ Selected:', prompt.title);
      props.onPromptSelect(prompt);
    }
    editMode = false;
  }

  function startCreate() {
    console.log('➕ Create mode for category:', selectedCategory);
    editMode = true;
    editingExisting = false;
    props.onPromptSelect(null);
  }

  function startEdit(prompt: any) {
    console.log('✏️ Edit mode for prompt:', prompt.title);
    editMode = true;
    editingExisting = true;
    props.onPromptSelect(prompt); // Set as active prompt for editing
  }

  function backToList() {
    console.log('⬅️ Back to list');
    editMode = false;
    editingExisting = false;
  }

  async function copyPrompt() {
    if (!props.activePrompt) return;
    try {
      await navigator.clipboard.writeText(props.activePrompt.content);
      console.log('📋 Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  async function dropPrompt() {
    if (!props.activePrompt) return;
    console.log('🎯 Dropping prompt:', { includeCode });
    // TODO: Implement drop with code option
    props.onToggleOpen();
  }

  async function savePrompt(promptData: any) {
    if (isOperating) return;
    
    console.log('💾 Saving:', promptData);
    
    isOperating = true;
    try {
      const method = editingExisting ? 'PUT' : 'POST';
      const response = await fetch('/api/prompts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      });
      
      const result = await response.json();
      if (result.success) {
        await props.onPromptsUpdate();
        // Refresh filtered prompts
        filteredPrompts = await getFilteredPrompts();
        backToList();
        console.log(`✅ ${editingExisting ? 'Updated' : 'Created'} successfully`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`❌ ${editingExisting ? 'Update' : 'Save'} failed:`, error);
    } finally {
      isOperating = false;
    }
  }

  async function deletePrompt(promptId: string) {
    if (isOperating) return;
    
    isOperating = true;
    try {
      const response = await fetch(`/api/prompts?id=${promptId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        if (props.activePrompt?.id === promptId) {
          props.onPromptSelect(null);
        }
        await props.onPromptsUpdate();
        // Refresh filtered prompts
        filteredPrompts = await getFilteredPrompts();
        console.log('🗑️ Deleted successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Delete failed:', error);
    } finally {
      isOperating = false;
    }
  }

  async function restorePrompt(promptId: string) {
    if (isOperating) return;
    
    isOperating = true;
    try {
      const response = await fetch('/api/prompts?action=restore', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId })
      });
      
      const result = await response.json();
      if (result.success) {
        await props.onPromptsUpdate();
        // Refresh filtered prompts
        filteredPrompts = await getFilteredPrompts();
        console.log('♻️ Restored successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Restore failed:', error);
    } finally {
      isOperating = false;
    }
  }

  let buttonClass = $derived(cn(
    "w-full justify-between px-3 h-9 font-normal text-sm",
    props.activePrompt && "border-primary/60 bg-primary/5 hover:bg-primary/10"
  ));
</script>

<div class="space-y-2">
  {#if props.isOpen}
    <div class="bg-background border rounded-lg shadow-sm overflow-hidden" transition:slide={{ duration: 200 }}>
      
      {#if editMode}
        <!-- Edit Mode (New or Existing) -->
        <div transition:fade={{ duration: 150 }}>
          <!-- Editor -->
          <PromptEditor 
            bind:this={editorRef}
            prompt={editingExisting && props.activePrompt ? {
              id: props.activePrompt.id,
              title: props.activePrompt.title,
              content: props.activePrompt.content,
              category: props.activePrompt.category
            } : {
              id: '',
              title: '',
              content: '',
              category: selectedCategory === 'all' ? 'writing' : selectedCategory
            }}
            selectedCategory={selectedCategory}
            onBack={backToList}
            onSave={(data) => savePrompt(editingExisting ? data : { 
              ...data, 
              id: data.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 50)
            })}
            isProcessing={isOperating || props.isProcessing}
            isNew={!editingExisting}
            compact={true}
          />
          
          <!-- Editor Controls -->
          <PromptControls
            mode="edit"
            onBack={backToList}
            onSave={() => editorRef?.save()}
            onDrop={() => editorRef?.saveAndDrop()}
            showCodeOption={true}
            includeCode={includeCode}
            onIncludeCodeChange={(value) => includeCode = value}
            disabled={isOperating || props.isProcessing}
          />
        </div>

      {:else if Object.keys(props.prompts || {}).length === 0}
        <!-- No prompts -->
        <div class="p-6 text-center">
          <p class="text-muted-foreground text-sm">No prompts available</p>
        </div>

      {:else}
        <!-- Browse Mode -->
        <div>
          <!-- Horizontal Scrollable Category Tabs -->
          <div class="border-b bg-muted/20">
            <div class="flex overflow-x-auto scrollbar-none gap-1 p-1">
              {#each categories as category}
                <button
                  class="flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-colors rounded-sm
                    {selectedCategory === category.id 
                      ? 'bg-background text-foreground shadow-sm border' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }"
                  onclick={() => selectedCategory = category.id}
                >
                  {category.label}
                  {#if category.count > 0}
                    <span class="ml-1 text-[0.6rem] opacity-60">({category.count})</span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <!-- Prompts List with New Prompt Option -->
          <PromptList 
            prompts={filteredPrompts}
            selectedPrompt={props.activePrompt}
            onPromptSelect={selectPrompt}
            onNewPrompt={startCreate}
            onDeletePrompt={deletePrompt}
            onEditPrompt={startEdit}
            onRestorePrompt={restorePrompt}
            currentCategory={selectedCategory}
            showNewPromptOption={selectedCategory !== 'deleted'}
            isOperating={isOperating}
          />

          <!-- Action Controls (only show if prompt selected) -->
          {#if props.activePrompt && selectedCategory !== 'deleted'}
            <PromptControls
              mode="view"
              onCopy={copyPrompt}
              onDrop={dropPrompt}
              showCodeOption={true}
              includeCode={includeCode}
              onIncludeCodeChange={(value) => includeCode = value}
              disabled={isOperating || props.isProcessing}
            />
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Main Toggle Button -->
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
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>