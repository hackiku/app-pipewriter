<!-- src/routes/(dash)/dashboard/store/+page.svelte - Use layout data -->

<script lang="ts">
  import { getContext } from 'svelte';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { ShoppingBag, Package, Crown, ArrowRight } from '@lucide/svelte';
  
  // Get data from layout context instead of page data
  const dashboardData = getContext('dashboardData');
  const access = getContext('access');
  
  // Extract store data
  const store = dashboardData?.store || { templates: [], categories: [], analytics: null };
  const userTier = access?.userAccess?.tier || 'free';
  
  // Simple state
  let loading = $state(false);
  let activeCategory = $state('all');
  
  // Filter templates based on category
  let filteredTemplates = $derived(() => {
    if (!store.templates || activeCategory === 'all') {
      return store.templates || [];
    }
    
    return store.templates.filter(t => 
      t.category?.toLowerCase().replace(/\s+/g, '-') === activeCategory
    );
  });
  
  // Handle category change
  function handleCategoryChange(category: string) {
    activeCategory = category;
  }
  
  // Handle purchase (mock for now)
  async function handlePurchase(templateId: string) {
    loading = true;
    
    try {
      const template = store.templates?.find(t => t.id === templateId);
      if (template) {
        alert(`Purchase: ${template.name} - $${template.price}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      loading = false;
    }
  }
  
  // Simple stats
  const totalTemplates = store.templates?.length || 0;
  const totalDownloads = store.analytics?.totalDownloads || 0;
  
  // Show coming soon message
  const showComingSoon = totalTemplates === 0;
</script>

<svelte:head>
  <title>Template Store - Pipewriter</title>
</svelte:head>

<div class="space-y-8">
  <!-- Header -->
  <div>
    <h1 class="text-4xl font-bold mb-3">Template Store</h1>
    <p class="text-muted-foreground text-lg">
      Professional templates to supercharge your writing workflow.
    </p>
    
    <!-- Stats and user tier -->
    <div class="flex items-center gap-4 mt-4">
      <Badge variant="outline">{totalTemplates} templates</Badge>
      {#if totalDownloads > 0}
        <Badge variant="outline">{totalDownloads} downloads</Badge>
      {/if}
      {#if userTier}
        <Badge class="capitalize {userTier === 'pro' ? 'bg-primary' : userTier === 'trial' ? 'bg-amber-500' : 'bg-muted'} text-white">
          {#if userTier === 'pro'}
            <Crown class="h-3 w-3 mr-1" />
          {/if}
          {userTier} {userTier === 'trial' && access?.userAccess?.trialDaysLeft ? `• ${access.userAccess.trialDaysLeft}d left` : ''}
        </Badge>
      {/if}
    </div>
  </div>
  
  <!-- Loading overlay -->
  {#if loading}
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg">
        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Processing purchase...</p>
      </div>
    </div>
  {/if}
  
  {#if showComingSoon}
    <!-- Coming Soon State -->
    <div class="text-center py-16">
      <div class="max-w-md mx-auto">
        <ShoppingBag class="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h3 class="text-2xl font-semibold mb-4">Store Coming Soon</h3>
        <p class="text-muted-foreground leading-relaxed mb-6">
          We're building a curated collection of professional Google Docs templates for UX writers, 
          content strategists, and product teams. Get ready for landing pages, feature specs, email campaigns, and more.
        </p>
        
        <!-- Features preview -->
        <div class="text-left bg-muted/30 rounded-lg p-4 mb-6">
          <h4 class="font-medium mb-3">What's coming:</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-center gap-2">
              <div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
              Landing page templates with copywriting frameworks
            </li>
            <li class="flex items-center gap-2">
              <div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
              Feature specification templates
            </li>
            <li class="flex items-center gap-2">
              <div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
              Email marketing campaigns
            </li>
            <li class="flex items-center gap-2">
              <div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
              User research documentation
            </li>
            <li class="flex items-center gap-2">
              <div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
              Content strategy playbooks
            </li>
          </ul>
        </div>
        
        <Button onclick={() => window.open('https://pipewriter.io', '_blank')} class="gap-2">
          Visit Main Site
          <ArrowRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
    
  {:else}
    <!-- Categories (if we have templates) -->
    {#if store.categories && store.categories.length > 1}
      <div class="flex flex-wrap gap-2">
        {#each store.categories as category}
          <Button
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            onclick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </Button>
        {/each}
      </div>
    {/if}
    
    <!-- Templates Grid -->
    {#if filteredTemplates.length > 0}
      <div>
        <h2 class="text-2xl font-semibold mb-4">
          {activeCategory === 'all' ? 'All Templates' : 
           store.categories?.find(c => c.id === activeCategory)?.name || 'Templates'}
        </h2>
        <p class="text-muted-foreground mb-6">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredTemplates as template}
            <div class="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold">{template.name}</h3>
                {#if template.popular}
                  <Badge variant="secondary" class="text-xs">Popular</Badge>
                {/if}
              </div>
              
              <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
                {template.description}
              </p>
              
              <div class="flex items-center justify-between">
                <div class="text-lg font-bold">${template.price}</div>
                <Button size="sm" onclick={() => handlePurchase(template.id)}>
                  Purchase
                </Button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <!-- No results -->
      <div class="text-center py-16">
        <Package class="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-xl font-medium mb-2">No templates in this category</h3>
        <p class="text-muted-foreground mb-6">Try a different category.</p>
        <Button onclick={() => handleCategoryChange('all')}>
          Show All Templates
        </Button>
      </div>
    {/if}
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