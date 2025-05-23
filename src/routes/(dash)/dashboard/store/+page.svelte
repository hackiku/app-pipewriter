<!-- src/routes/(dash)/dashboard/store/+page.svelte -->
<script lang="ts">
  import CategoryFilter from '$lib/features/dashboard/store/CategoryFilter.svelte';
  import TemplateGrid from '$lib/features/dashboard/store/TemplateGrid.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import { Package, ShoppingBag } from '@lucide/svelte';
  
  // Get data - destructure safely
  const { data } = $props();
  
  // Simple state - no derived, no complex calculations
  let loading = $state(false);
  let activeCategory = $state('all');
  let filteredTemplates = $state([]);
  
  // Log what we got
  console.log('Store page data:', data);
  
  // Simple function to filter templates
  function updateFilteredTemplates() {
    if (!data?.templates) {
      filteredTemplates = [];
      return;
    }
    
    if (activeCategory === 'all') {
      filteredTemplates = data.templates.filter(t => !t.featured);
    } else {
      filteredTemplates = data.templates.filter(t => 
        !t.featured && 
        t.category?.toLowerCase().replace(/\s+/g, '-') === activeCategory
      );
    }
  }
  
  // Update when category changes
  function handleCategoryChange(category: string) {
    activeCategory = category;
    updateFilteredTemplates();
  }
  
  // Simple purchase handler
  async function handlePurchase(templateId: string) {
    loading = true;
    console.log('Purchase:', templateId);
    
    try {
      const template = data.templates?.find(t => t.id === templateId);
      if (template) {
        alert(`Purchase: ${template.name} - $${template.price}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      loading = false;
    }
  }
  
  // Simple stats - no derived
  const totalTemplates = data?.templates?.length || 0;
  const totalDownloads = data?.analytics?.totalDownloads || 0;
  
  // Update filtered templates on mount
  updateFilteredTemplates();
</script>

<svelte:head>
  <title>Template Store - Pipewriter</title>
</svelte:head>

<div class="space-y-8">
  <!-- Simple Header -->
  <div>
    <h1 class="text-4xl font-bold mb-3">Template Store</h1>
    <p class="text-muted-foreground text-lg">
      Professional templates to supercharge your writing workflow.
    </p>
    
    <!-- Simple stats -->
    <div class="flex gap-4 mt-4">
      <Badge variant="outline">{totalTemplates} templates</Badge>
      <Badge variant="outline">{totalDownloads} downloads</Badge>
      {#if data?.userTier}
        <Badge>{data.userTier}</Badge>
      {/if}
    </div>
  </div>
  
  <!-- Error display -->
  {#if data?.error}
    <div class="p-4 bg-red-100 text-red-800 rounded">
      Error: {data.error}
    </div>
  {/if}
  
  <!-- Loading overlay -->
  {#if loading}
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded">
        <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Processing purchase...</p>
      </div>
    </div>
  {/if}
  
  <!-- Categories -->
  {#if data?.categories}
    <CategoryFilter 
      categories={data.categories} 
      activeCategory={activeCategory}
      onCategoryChange={handleCategoryChange}
    />
  {/if}
  
  <!-- Templates -->
  {#if filteredTemplates.length > 0}
    <div>
      <h2 class="text-2xl font-semibold mb-4">
        {activeCategory === 'all' ? 'All Templates' : 
         data?.categories?.find(c => c.id === activeCategory)?.name || 'Templates'}
      </h2>
      <p class="text-muted-foreground mb-6">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
      </p>
      
      <TemplateGrid 
        templates={filteredTemplates} 
        onPurchase={handlePurchase} 
      />
    </div>
  {:else if totalTemplates === 0}
    <!-- No templates at all -->
    <div class="text-center py-16">
      <ShoppingBag class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-medium mb-2">No templates found</h3>
      <p class="text-gray-600 mb-6">Run the seed script to add sample templates.</p>
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onclick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  {:else}
    <!-- No results for filter -->
    <div class="text-center py-16">
      <Package class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-medium mb-2">No templates in this category</h3>
      <p class="text-gray-600 mb-6">Try a different category.</p>
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onclick={() => handleCategoryChange('all')}
      >
        Show All Templates
      </button>
    </div>
  {/if}
</div>