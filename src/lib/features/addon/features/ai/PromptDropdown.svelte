<!-- src/lib/features/addon/features/ai/PromptDropdown.svelte - WITH PROMPTCONTROLS -->
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
    onPromptClear: () => void;
    onToggleOpen: () => void;
    onPromptsUpdate: () => void;
  }>();

  // State
  let editMode = $state(false);
  let createMode = $state(false);
  let selectedCategory = $state("all");
  let isOperating = $state(false);
  let includeCode = $state(false);

  // Debug prompts
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

  // Actions
  function selectPrompt(prompt) {
    props.onPromptSelect(prompt);
    editMode = false;
    createMode = false;
  }

  function clearPrompt() {
    props.onPromptClear();
    editMode = false;
    createMode = false;
  }

  function startEdit(prompt: any) {
    editMode = true;
    createMode = false;
    props.onPromptSelect(prompt); // Set as active for editing
  }

  function startCreate() {
    editMode = false;
    createMode = true;
    props.onPromptClear(); // Clear active prompt for new creation
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
      console.log('📋 Copied prompt to clipboard');
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  }

  async function deletePrompt(promptId: string) {
    if (isOperating || !confirm('Delete this prompt permanently?')) return;
    
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
        
        // Auto-select newly created prompt
        if (isNew) {
          setTimeout(() => {
            const allPrompts = Object.values(props.prompts).flat();
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

  function handleCategoryChange(category: string) {
    selectedCategory = category;
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

        <!-- Edit Mode Controls -->
        <PromptControls
          mode="edit"
          onBack={backToList}
          onSave={() => {}}
          onDrop={dropPrompt}
          showCodeOption={true}
          includeCode={includeCode}
          onIncludeCodeChange={(value) => includeCode = value}
          disabled={isOperating || props.isProcessing}
        />

      {:else if createMode}
        <!-- Create Mode -->
        <div class="p-3" transition:fade={{ duration: 150 }}>
          <PromptEditor 
            prompt={{
              id: '',
              title: '',
              content: '',
              category: selectedCategory === 'all' ? 'writing' : selectedCategory
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

        <!-- Create Mode Controls -->
        <PromptControls
          mode="edit"
          onBack={backToList}
          onSave={() => {}} 
          onDrop={() => {}} 
          showCodeOption={true}
          includeCode={includeCode}
          onIncludeCodeChange={(value) => includeCode = value}
          disabled={isOperating || props.isProcessing}
        />

      {:else if Object.keys(props.prompts || {}).length === 0}
        <!-- No prompts -->
        <div class="p-6 text-center">
          <p class="text-muted-foreground text-sm">No prompts available</p>
          <p class="text-xs text-red-500 mt-1">Debug: Empty prompts object</p>
        </div>

      {:else}
        <!-- Browse Mode with PromptList (includes tabs) -->
        <div>
          <PromptList 
            prompts={props.prompts}
            selectedPrompt={props.activePrompt}
            onPromptSelect={selectPrompt}
            onNewPrompt={startCreate}
            onDeletePrompt={deletePrompt}
            onEditPrompt={startEdit}
            currentCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            isOperating={isOperating}
          />

          <!-- Browse Mode Controls (only show if prompt selected) -->
          {#if props.activePrompt}
            <PromptControls
              mode="view"
              onCopy={copyPrompt}
              onEdit={() => startEdit(props.activePrompt)}
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