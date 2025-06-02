<!-- src/lib/features/addon/features/ai/PromptDropdown.svelte - ULTRA SIMPLE VERSION -->
<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { ChevronDown, Plus } from "@lucide/svelte";
  import PromptList from "./PromptList.svelte";
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

  // Simple state
  let createMode = $state(false);
  let selectedCategory = $state("all");
  let isOperating = $state(false);

  // DEBUG
  $effect(() => {
    console.log('🔍 Simple PromptDropdown:', {
      prompts: props.prompts,
      totalPrompts: props.prompts ? Object.values(props.prompts).flat().length : 0,
      selectedCategory,
      isOpen: props.isOpen,
      createMode
    });
  });

  // FIXED: Get all prompts as regular array, not derived
  function getAllPrompts() {
    if (!props.prompts) return [];
    return Object.values(props.prompts).flat();
  }

  // Categories with simple names
  let categories = $derived(() => {
    const counts: Record<string, number> = {};
    Object.entries(props.prompts || {}).forEach(([category, prompts]) => {
      counts[category] = prompts.length;
    });

    return [
      { id: "all", label: "All", count: getAllPrompts().length },
      ...Object.entries(counts).map(([id, count]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        count
      }))
    ];
  });

  // FIXED: Get filtered prompts as regular array
  function getFilteredPrompts() {
    if (selectedCategory === "all") {
      return getAllPrompts();
    } else {
      return (props.prompts || {})[selectedCategory] || [];
    }
  }

  function selectPrompt(prompt) {
    console.log('✅ Selected:', prompt.title);
    props.onPromptSelect(prompt);
    createMode = false;
  }

  function startCreate() {
    console.log('➕ Create mode');
    createMode = true;
    props.onPromptSelect(null);
  }

  function backToList() {
    console.log('⬅️ Back to list');
    createMode = false;
  }

  async function savePrompt(promptData: any) {
    if (isOperating) return;
    
    console.log('💾 Saving:', promptData);
    
    isOperating = true;
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      });
      
      const result = await response.json();
      if (result.success) {
        await props.onPromptsUpdate();
        backToList();
        console.log('✅ Saved successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Save failed:', error);
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
      
      {#if createMode}
        <!-- Create Mode -->
        <div class="p-3" transition:fade={{ duration: 150 }}>
          <PromptEditor 
            prompt={{
              id: '',
              title: '',
              content: '',
              category: 'writing'
            }}
            onBack={backToList}
            onSave={(data) => savePrompt({ 
              ...data, 
              id: data.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 50)
            })}
            isProcessing={isOperating || props.isProcessing}
            isNew={true}
            compact={true}
          />
        </div>

      {:else if Object.keys(props.prompts || {}).length === 0}
        <!-- No prompts -->
        <div class="p-6 text-center">
          <p class="text-muted-foreground text-sm">No prompts available</p>
        </div>

      {:else}
        <!-- Browse Mode with PromptList -->
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
                  console.log('📂 Switching to:', category.id);
                  selectedCategory = category.id;
                }}
              >
                {category.label} ({category.count})
              </button>
            {/each}
          </div>

          <!-- FIXED: Use PromptList component -->
          <PromptList 
            prompts={getFilteredPrompts()}
            selectedPrompt={props.activePrompt}
            onPromptSelect={selectPrompt}
          />

          <!-- Action Bar -->
          <div class="p-2 border-t bg-muted/20 flex items-center justify-between">
            <button
              class="h-7 px-3 gap-1 text-xs flex items-center border border-border rounded hover:bg-muted"
              onclick={startCreate}
              disabled={isOperating}
            >
              <Plus class="h-3 w-3" />
              <span>New Prompt</span>
            </button>

            {#if props.activePrompt}
              <Button 
                size="sm" 
                class="h-7 px-3 gap-1" 
                onclick={props.onToggleOpen}
                disabled={isOperating}
              >
                <span class="text-xs">Use This</span>
              </Button>
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