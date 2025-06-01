<!-- src/lib/components/prompts/PromptsManager.svelte -->
<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Badge } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils";
  import { 
    Plus, 
    Edit3, 
    Trash2, 
    RefreshCw, 
    Copy, 
    Save,
    X,
    Search,
    Filter,
    RotateCcw
  } from "lucide-svelte";

  // Props
  const props = $props<{
    prompts: Record<string, any[]>;
    userTier: 'free' | 'trial' | 'pro';
    onSelect?: (prompt: any) => void;
    onUpdate?: () => void;
    compact?: boolean; // For use in AI tab vs dashboard
  }>();

  // State
  let view = $state<'browse' | 'edit' | 'create'>('browse');
  let selectedPrompt = $state<any>(null);
  let editingPrompt = $state<any>(null);
  let searchQuery = $state('');
  let selectedCategory = $state('all');
  let isProcessing = $state(false);
  let statusMessage = $state('');

  // Form state for creating/editing
  let formData = $state({
    id: '',
    title: '',
    description: '',
    content: '',
    category: 'writing',
    tags: []
  });

  // Categories for filtering
  const categories = $derived(() => {
    const counts: Record<string, number> = {};
    Object.entries(props.prompts).forEach(([category, prompts]) => {
      counts[category] = prompts.length;
    });

    return [
      { id: 'all', label: 'All', count: Object.values(props.prompts).flat().length },
      ...Object.entries(counts).map(([id, count]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        count
      }))
    ];
  });

  // Filtered prompts
  const filteredPrompts = $derived(() => {
    let allPrompts = Object.values(props.prompts).flat();

    // Filter by category
    if (selectedCategory !== 'all') {
      allPrompts = allPrompts.filter(p => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allPrompts = allPrompts.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        (p.metadata?.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    return allPrompts.sort((a, b) => {
      // Custom prompts first, then by title
      if (a.isUserCustom !== b.isUserCustom) {
        return a.isUserCustom ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });
  });

  // API helpers
  async function createPrompt() {
    if (!formData.title || !formData.content || !formData.category) {
      setStatus('Please fill in all required fields', 'error');
      return;
    }

    isProcessing = true;
    try {
      // Generate ID from title
      const id = formData.title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: formData.id || id,
          metadata: {
            tier: 'free',
            tags: formData.tags
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('Prompt created successfully!', 'success');
        resetForm();
        view = 'browse';
        props.onUpdate?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStatus(error.message || 'Failed to create prompt', 'error');
    } finally {
      isProcessing = false;
    }
  }

  async function updatePrompt() {
    if (!editingPrompt?.id) return;

    isProcessing = true;
    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPrompt.id,
          ...formData,
          metadata: {
            ...editingPrompt.metadata,
            tags: formData.tags
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('Prompt updated successfully!', 'success');
        resetForm();
        view = 'browse';
        editingPrompt = null;
        props.onUpdate?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStatus(error.message || 'Failed to update prompt', 'error');
    } finally {
      isProcessing = false;
    }
  }

  async function deletePrompt(promptId: string) {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    isProcessing = true;
    try {
      const response = await fetch(`/api/prompts?id=${promptId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setStatus('Prompt deleted successfully!', 'success');
        props.onUpdate?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStatus(error.message || 'Failed to delete prompt', 'error');
    } finally {
      isProcessing = false;
    }
  }

  async function restoreToDefault(promptId?: string) {
    const confirmMsg = promptId 
      ? 'Restore this prompt to system default?' 
      : 'Restore ALL prompts to system defaults? This will delete all your customizations.';
    
    if (!confirm(confirmMsg)) return;

    isProcessing = true;
    try {
      const response = await fetch('/api/prompts/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId })
      });

      const result = await response.json();

      if (result.success) {
        setStatus(result.message, 'success');
        props.onUpdate?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStatus(error.message || 'Failed to restore prompts', 'error');
    } finally {
      isProcessing = false;
    }
  }

  async function copyPrompt(prompt: any) {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setStatus('Prompt copied to clipboard!', 'success');
    } catch (error) {
      setStatus('Failed to copy prompt', 'error');
    }
  }

  // Helper functions
  function setStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
    statusMessage = message;
    setTimeout(() => statusMessage = '', 3000);
  }

  function resetForm() {
    formData = {
      id: '',
      title: '',
      description: '',
      content: '',
      category: 'writing',
      tags: []
    };
  }

  function startEdit(prompt: any) {
    editingPrompt = prompt;
    formData = {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.metadata?.tags || []
    };
    view = 'edit';
  }

  function startCreate() {
    resetForm();
    editingPrompt = null;
    view = 'create';
  }

  function selectPrompt(prompt: any) {
    selectedPrompt = prompt;
    props.onSelect?.(prompt);
  }

  function getTierColor(tier: string) {
    switch (tier) {
      case 'pro': return 'bg-primary text-primary-foreground';
      case 'trial': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  }
</script>

<!-- Status Message -->
{#if statusMessage}
  <div class="fixed top-4 right-4 z-50" transition:fade>
    <div class="bg-background border rounded-lg shadow-lg p-3 max-w-sm">
      <p class="text-sm">{statusMessage}</p>
    </div>
  </div>
{/if}

<div class="h-full flex flex-col {props.compact ? 'max-h-96' : ''}">
  
  <!-- Header -->
  <div class="flex items-center justify-between p-4 border-b">
    <div class="flex items-center gap-2">
      <h3 class="font-semibold">
        {view === 'browse' ? 'Prompt Library' : view === 'create' ? 'Create Prompt' : 'Edit Prompt'}
      </h3>
      {#if view === 'browse'}
        <Badge variant="secondary">{filteredPrompts.length} prompts</Badge>
      {/if}
    </div>
    
    <div class="flex items-center gap-2">
      {#if view === 'browse'}
        <Button size="sm" variant="outline" onclick={startCreate} disabled={isProcessing}>
          <Plus class="h-4 w-4 mr-1" />
          New
        </Button>
        <Button size="sm" variant="outline" onclick={() => restoreToDefault()} disabled={isProcessing}>
          <RotateCcw class="h-4 w-4 mr-1" />
          Reset All
        </Button>
      {:else}
        <Button size="sm" variant="outline" onclick={() => view = 'browse'}>
          <X class="h-4 w-4 mr-1" />
          Cancel
        </Button>
      {/if}
    </div>
  </div>

  {#if view === 'browse'}
    <!-- Browse Mode -->
    <div class="flex-1 flex flex-col overflow-hidden">
      
      <!-- Search & Filters -->
      <div class="p-4 border-b space-y-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            bind:value={searchQuery}
            class="pl-10"
          />
        </div>
        
        <div class="flex gap-2 overflow-x-auto">
          {#each categories as category}
            <button
              class="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-colors
                {selectedCategory === category.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'}"
              onclick={() => selectedCategory = category.id}
            >
              {category.label} ({category.count})
            </button>
          {/each}
        </div>
      </div>

      <!-- Prompts List -->
      <div class="flex-1 overflow-y-auto">
        {#if filteredPrompts.length === 0}
          <div class="p-8 text-center text-muted-foreground">
            <p>No prompts found</p>
            {#if searchQuery}
              <p class="text-sm mt-1">Try adjusting your search or filter</p>
            {/if}
          </div>
        {:else}
          <div class="p-2 space-y-2">
            {#each filteredPrompts as prompt (prompt.id)}
              <div 
                class="group border rounded-lg p-3 hover:bg-muted/50 transition-colors
                  {selectedPrompt?.id === prompt.id ? 'ring-2 ring-primary' : ''}"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="font-medium text-sm truncate">{prompt.title}</h4>
                      <Badge class={getTierColor(prompt.metadata?.tier || 'free')}>
                        {prompt.metadata?.tier || 'free'}
                      </Badge>
                      {#if prompt.isUserCustom}
                        <Badge variant="outline">Custom</Badge>
                      {/if}
                      {#if prompt.isLocked}
                        <Badge variant="destructive">Locked</Badge>
                      {/if}
                    </div>
                    
                    <p class="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {prompt.description}
                    </p>
                    
                    {#if prompt.metadata?.tags?.length}
                      <div class="flex gap-1 flex-wrap mb-2">
                        {#each prompt.metadata.tags.slice(0, 3) as tag}
                          <span class="text-xs bg-muted text-muted-foreground px-1 rounded">
                            {tag}
                          </span>
                        {/each}
                      </div>
                    {/if}
                  </div>
                  
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      class="h-8 w-8 p-0"
                      onclick={() => selectPrompt(prompt)}
                      disabled={prompt.isLocked}
                      title="Use this prompt"
                    >
                      <Play class="h-3 w-3" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      class="h-8 w-8 p-0"
                      onclick={() => copyPrompt(prompt)}
                      title="Copy to clipboard"
                    >
                      <Copy class="h-3 w-3" />
                    </Button>
                    
                    {#if prompt.isUserCustom}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        class="h-8 w-8 p-0"
                        onclick={() => startEdit(prompt)}
                        title="Edit prompt"
                      >
                        <Edit3 class="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        class="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onclick={() => deletePrompt(prompt.id)}
                        title="Delete prompt"
                      >
                        <Trash2 class="h-3 w-3" />
                      </Button>
                    {:else if prompt.isSystem}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        class="h-8 w-8 p-0"
                        onclick={() => restoreToDefault(prompt.id)}
                        title="Restore to default"
                      >
                        <RefreshCw class="h-3 w-3" />
                      </Button>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else}
    <!-- Create/Edit Mode -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div class="space-y-2">
        <label class="text-sm font-medium">Title *</label>
        <Input bind:value={formData.title} placeholder="Enter prompt title..." />
      </div>
      
      <div class="space-y-2">
        <label class="text-sm font-medium">Description</label>
        <Input bind:value={formData.description} placeholder="Brief description..." />
      </div>
      
      <div class="space-y-2">
        <label class="text-sm font-medium">Category *</label>
        <select bind:value={formData.category} class="w-full p-2 border rounded">
          <option value="writing">Writing</option>
          <option value="ux">UX/UI</option>
          <option value="marketing">Marketing</option>
          <option value="structure">Structure</option>
          <option value="technical">Technical</option>
        </select>
      </div>
      
      <div class="space-y-2">
        <label class="text-sm font-medium">Prompt Content *</label>
        <Textarea 
          bind:value={formData.content} 
          placeholder="Enter the full prompt content..."
          class="min-h-32"
        />
        <p class="text-xs text-muted-foreground">
          Be specific and detailed for better AI results
        </p>
      </div>
      
      <div class="flex gap-2 pt-4">
        <Button 
          onclick={() => view === 'create' ? createPrompt() : updatePrompt()}
          disabled={isProcessing || !formData.title || !formData.content}
          class="flex-1"
        >
          {#if isProcessing}
            <RefreshCw class="h-4 w-4 mr-2 animate-spin" />
          {:else}
            <Save class="h-4 w-4 mr-2" />
          {/if}
          {view === 'create' ? 'Create Prompt' : 'Update Prompt'}
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>