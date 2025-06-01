<!-- Fixed src/lib/features/addon/features/ai/PromptDropdown.svelte -->
<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { 
    ChevronDown, 
    X, 
    Edit, 
    Play, 
    Copy
  } from "@lucide/svelte";
  import PromptEditor from "./PromptEditor.svelte";
  
  // FIXED: Accept server data as props instead of using contexts
  const props = $props<{
    prompts: Record<string, any[]>; // Server-provided prompts by category
    features: any; // User features from server
    isProcessing?: boolean;
    isOpen?: boolean;
    activePrompt?: any;
    onPromptSelect: (prompt: any) => void;
    onToggleOpen: () => void;
  }>();

  // State
  let editMode = $state(false);
  let selectedCategory = $state("all");

  // Get all prompts as flat array for category filtering
  let allPrompts = $derived(() => {
    return Object.values(props.prompts).flat();
  });

  // Categories for filtering - dynamically generated from server data
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

  // Filtered prompts based on selected category
  let filteredPrompts = $derived(() => {
    if (selectedCategory === "all") {
      return allPrompts;
    }
    return props.prompts[selectedCategory] || [];
  });

  function selectPrompt(prompt) {
    props.onPromptSelect(prompt);
    editMode = false;
  }

  function clearPrompt() {
    props.onPromptSelect(null);
    editMode = false;
  }

  function editPrompt() {
    if (!props.activePrompt) return;
    editMode = true;
  }

  function backToList() {
    editMode = false;
  }

  function dropPrompt() {
    if (!props.activePrompt) return;
    // The parent will handle the actual drop
    props.onToggleOpen(); // Close dropdown after dropping
  }

  async function copyPrompt() {
    if (!props.activePrompt) return;
    try {
      await navigator.clipboard.writeText(props.activePrompt.content);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  }

  function getCategoryColor(category: string) {
    const colors = {
      writing: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
      code: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950", 
      design: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950",
      marketing: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
      technical: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950"
    };
    return colors[category] || "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950";
  }

  // Main button classes
  let buttonClass = $derived(cn(
    "w-full justify-between px-3 h-9 font-normal text-sm",
    props.activePrompt && "border-primary/60 bg-primary/5 hover:bg-primary/10"
  ));
</script>

<div class="space-y-2">
  {#if props.isOpen}
    <div
      class="bg-background border rounded-lg shadow-sm overflow-hidden"
      transition:slide={{ duration: 200 }}
    >
      {#if Object.keys(props.prompts).length === 0}
        <!-- No prompts available -->
        <div class="p-6 text-center">
          <div class="flex flex-col items-center space-y-2">
            <p class="text-muted-foreground text-sm">No prompts available</p>
          </div>
        </div>
      {:else if editMode && props.activePrompt}
        <!-- Editor Mode -->
        <div class="p-3" transition:fade={{ duration: 150 }}>
          <PromptEditor 
            prompt={props.activePrompt}
            onBack={backToList}
            onSave={() => {/* Save logic for later */}}
            onDrop={dropPrompt}
            isProcessing={props.isProcessing}
          />
        </div>
      {:else}
        <!-- List Mode -->
        <div>
          <!-- Category Filter Tabs -->
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
                {category.label}
                <span class="ml-1 text-[0.6rem] opacity-60">({category.count})</span>
              </button>
            {/each}
          </div>

          <!-- Prompts List - Max 3 visible, scrollable -->
          <div class="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {#if filteredPrompts.length === 0}
              <div class="p-4 text-center text-muted-foreground text-sm">
                No prompts available for this category
              </div>
            {:else}
              {#each filteredPrompts as prompt (prompt.id)}
                <button
                  class="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 relative
                    {props.activePrompt?.id === prompt.id ? 'bg-primary/5 border-primary/20' : ''}
                    {prompt.isLocked ? 'opacity-60' : ''}"
                  onclick={() => !prompt.isLocked && selectPrompt(prompt)}
                  disabled={props.isProcessing || prompt.isLocked}
                  title={prompt.isLocked ? 'Upgrade to access this prompt' : prompt.description}
                >
                  <div class="flex items-start gap-2">
                    <!-- Category Badge - positioned as requested -->
                    <span class="absolute top-0 right-2 items-center px-1.5 py-0.5 rounded text-[0.6rem] font-medium mt-0.5 {getCategoryColor(prompt.category)}">
                      {prompt.category}
                    </span>
                    
                    <div class="flex-1 min-w-0 pr-16">
                      <h4 class="font-medium text-sm text-foreground mb-0.5 flex items-center gap-2">
                        {prompt.title}
                        {#if prompt.isLocked}
                          <span class="text-xs bg-muted text-muted-foreground px-1 py-0.5 rounded">
                            {prompt.metadata?.tier === 'pro' ? 'Pro' : 'Trial'}
                          </span>
                        {/if}
                      </h4>
                      <p class="text-xs text-muted-foreground line-clamp-2">{prompt.description}</p>
                    </div>
                  </div>
                </button>
              {/each}
            {/if}
          </div>

          <!-- Action Buttons Row -->
          {#if props.activePrompt && !props.activePrompt.isLocked}
            <div class="p-2 border-t bg-muted/20" transition:slide={{ duration: 150 }}>
              <div class="flex items-center gap-1">
                <!-- Clear -->
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-7 w-7 p-0"
                  onclick={clearPrompt}
                  disabled={props.isProcessing}
                  title="Clear selection"
                >
                  <X class="h-3 w-3" />
                </Button>

                <!-- Edit -->
                <Button
                  variant="ghost" 
                  size="sm"
                  class="h-7 px-2 gap-1"
                  onclick={editPrompt}
                  disabled={props.isProcessing}
                >
                  <Edit class="h-3 w-3" />
                  <span class="text-xs">Edit</span>
                </Button>

                <!-- Spacer -->
                <div class="flex-1"></div>

                <!-- Copy -->
                <Button
                  variant="ghost"
                  size="sm" 
                  class="h-7 w-7 p-0"
                  onclick={copyPrompt}
                  disabled={props.isProcessing}
                  title="Copy to clipboard"
                >
                  <Copy class="h-3 w-3" />
                </Button>

                <!-- Drop (Primary) -->
                <Button
                  size="sm"
                  class="h-7 px-3 gap-1"
                  onclick={dropPrompt}
                  disabled={props.isProcessing}
                >
                  <Play class="h-3 w-3" />
                  <span class="text-xs font-medium">Drop</span>
                </Button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Main Toggle Button -->
  <Button
    variant="outline"
    class={buttonClass}
    onclick={props.onToggleOpen}
    disabled={props.isProcessing}
  >
    {#if props.activePrompt}
      <span class="font-medium text-foreground truncate">{props.activePrompt.title}</span>
    {:else}
      <span class="text-muted-foreground">Select prompt...</span>
    {/if}
    <ChevronDown
      class={cn(
        "h-4 w-4 transition-transform duration-200 flex-shrink-0",
        props.isOpen && "rotate-180"
      )}
    />
  </Button>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  
  .scrollbar-thumb-border {
    scrollbar-color: hsl(var(--border)) transparent;
  }
  
  .scrollbar-track-transparent {
    scrollbar-track-color: transparent;
  }
  
  /* Webkit scrollbar styles */
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 2px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--border) / 0.8);
  }
</style>