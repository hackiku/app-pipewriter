<!-- $lib/iframe/features/ai/PromptDropdown.svelte - Compact UX -->
<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { 
    ChevronDown, 
    X, 
    Edit3, 
    Play, 
    Copy, 
    ArrowLeft,
    Save
  } from "lucide-svelte";
  import PromptEditor from "./PromptEditor.svelte";
  
  // Props
  const props = $props<{
    isProcessing?: boolean;
    isOpen?: boolean;
    onPromptDrop?: (prompt: any) => void;
  }>();

  // Enhanced prompt data with categories
  const promptsData = [
    {
      id: "1",
      category: "writing",
      title: "Polish Copy",
      description: "Improve clarity, tone and engagement while keeping the same meaning and length",
      content: "Please improve the clarity, tone and engagement of the selected text while maintaining the same core meaning and approximate length."
    },
    {
      id: "2", 
      category: "writing",
      title: "Executive Summary",
      description: "Convert to executive summary with key points and clear structure",
      content: "Convert the selected text into a clear executive summary with bullet points highlighting the key takeaways and decisions."
    },
    {
      id: "3",
      category: "code", 
      title: "HTML Structure",
      description: "Convert to semantic HTML with proper heading hierarchy and tags",
      content: "Convert this content to clean, semantic HTML with proper heading hierarchy (h1, h2, h3) and appropriate tags like <p>, <ul>, <ol>, <strong>, <em>."
    },
    {
      id: "4",
      category: "code",
      title: "Clean Markup", 
      description: "Strip formatting and convert to clean, minimal HTML structure",
      content: "Remove all formatting and convert to clean, minimal HTML with just the essential semantic structure."
    },
    {
      id: "5",
      category: "design",
      title: "Content Sections",
      description: "Organize into clear sections with headers and logical flow",
      content: "Reorganize this content into clear, logical sections with descriptive headers and improved information hierarchy."
    },
    {
      id: "6",
      category: "design", 
      title: "Bullet Points",
      description: "Convert to scannable bullet points and lists for better readability",
      content: "Convert this content into scannable bullet points and numbered lists that improve readability and comprehension."
    }
  ];

  // State
  let isOpen = $state(props.isOpen || false);
  let activePrompt = $state(null);
  let editMode = $state(false);
  let selectedCategory = $state("all");

  // Categories for filtering
  const categories = [
    { id: "all", label: "All", count: promptsData.length },
    { id: "writing", label: "Writing", count: promptsData.filter(p => p.category === "writing").length },
    { id: "code", label: "Code", count: promptsData.filter(p => p.category === "code").length },
    { id: "design", label: "Design", count: promptsData.filter(p => p.category === "design").length }
  ];

  // Filtered prompts
  let filteredPrompts = $derived(
    selectedCategory === "all" 
      ? promptsData 
      : promptsData.filter(p => p.category === selectedCategory)
  );

  function toggleDropdown() {
    if (props.isProcessing) return;
    isOpen = !isOpen;
    if (!isOpen) {
      editMode = false; // Reset edit mode when closing
    }
  }

  function selectPrompt(prompt) {
    activePrompt = prompt;
    editMode = false;
  }

  function clearPrompt() {
    activePrompt = null;
    editMode = false;
  }

  function editPrompt() {
    if (!activePrompt) return;
    editMode = true;
  }

  function backToList() {
    editMode = false;
  }

  function dropPrompt() {
    if (!activePrompt) return;
    props.onPromptDrop?.(activePrompt);
    isOpen = false; // Close dropdown after dropping
  }

  async function copyPrompt() {
    if (!activePrompt) return;
    try {
      await navigator.clipboard.writeText(activePrompt.content);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  }

  function getCategoryColor(category: string) {
    const colors = {
      writing: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
      code: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950", 
      design: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950"
    };
    return colors[category] || "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950";
  }

  // Main button classes
  let buttonClass = $derived(cn(
    "w-full justify-between px-3 h-9 font-normal text-sm",
    activePrompt && "border-primary/60 bg-primary/5 hover:bg-primary/10"
  ));
</script>

<div class="space-y-2">
  {#if isOpen}
    <div
      class="bg-background border rounded-lg shadow-sm overflow-hidden"
      transition:slide={{ duration: 200 }}
    >
      {#if editMode && activePrompt}
        <!-- Editor Mode -->
        <div class="p-3" transition:fade={{ duration: 150 }}>
          <PromptEditor 
            prompt={activePrompt}
            onBack={backToList}
            onSave={() => {/* Save logic */}}
            onDrop={dropPrompt}
            isProcessing={props.isProcessing}
          />
        </div>
      {:else}
        <!-- List Mode -->
        <div>
          <!-- Category Filter Tabs -->
          <div class="flex border-b bg-muted/30">
            {#each categories as category}
              <button
                class="flex-1 px-2 py-2 text-xs font-medium transition-colors
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
            {#each filteredPrompts as prompt (prompt.id)}
              <button
                class="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0
                  {activePrompt?.id === prompt.id ? 'bg-primary/5 border-primary/20' : ''}"
                onclick={() => selectPrompt(prompt)}
                disabled={props.isProcessing}
              >
                <div class="relative flex items-start gap-2">
                  <!-- Category Badge -->
                  <span class="absolute top-0 right-2 items-center px-1.5 py-0.5 rounded text-[0.6rem] font-medium mt-0.5 {getCategoryColor(prompt.category)}">
                    {prompt.category}
                  </span>
                  
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-sm text-foreground mb-0.5">{prompt.title}</h4>
                    <p class="text-xs text-muted-foreground line-clamp-2">{prompt.description}</p>
                  </div>
                </div>
              </button>
            {/each}
          </div>

          <!-- Action Buttons Row -->
          {#if activePrompt}
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
                  <Edit3 class="h-3 w-3" />
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
    onclick={toggleDropdown}
    disabled={props.isProcessing}
  >
    {#if activePrompt}
      <span class="font-medium text-foreground truncate">{activePrompt.title}</span>
    {:else}
      <span class="text-muted-foreground">Select prompt...</span>
    {/if}
    <ChevronDown
      class={cn(
        "h-4 w-4 transition-transform duration-200 flex-shrink-0",
        isOpen && "rotate-180"
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