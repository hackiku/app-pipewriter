<!-- src/routes/(dash)/store/+page.svelte -->
<script lang="ts">
  import FeaturedTemplate from '$lib/features/dashboard/store/FeaturedTemplate.svelte';
  import CategoryFilter from '$lib/features/dashboard/store/CategoryFilter.svelte';
  import TemplateGrid from '$lib/features/dashboard/store/TemplateGrid.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import { TrendingUp, Package, Star } from 'lucide-svelte';
  
  // Get the data from the load function
  const { data } = $props();
  
  // State
  let loading = $state(false);
  
  // Active category
  let activeCategory = $state('all');
  
  // Derived state for filtered templates
  let filteredTemplates = $derived(() => {
    if (!data.templates) return [];
    
    return activeCategory === 'all' 
      ? data.templates.filter(t => !t.featured) 
      : data.templates.filter(t => !t.featured && 
          t.category.toLowerCase().replace(/\s+/g, '-') === activeCategory.toLowerCase()
        );
  });
  
  // Featured template
  let featuredTemplate = $derived(() => {
    return data.templates?.find(t => t.featured) || null;
  });
  
  // Category change handler
  function handleCategoryChange(category: string) {
    activeCategory = category;
  }
  
  // Purchase handler
  async function handlePurchase(templateId: string) {
    loading = true;
    console.log('Purchasing template:', templateId);
    
    try {
      // TODO: Implement Stripe checkout
      // For now, just log the purchase attempt
      const template = data.templates.find(t => t.id === templateId);
      console.log('Would purchase:', template?.name, 'for $' + template?.price);
      
      // You can add Stripe checkout logic here
      // const response = await fetch('/api/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ templateId, priceId: template.priceId })
      // });
      
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      loading = false;
    }
  }
  
  // Calculate total templates count
  let totalTemplates = $derived(() => {
    return data.templates?.filter(t => !t.featured).length || 0;
  });
  
  // Calculate average price
  let averagePrice = $derived(() => {
    if (!data.templates?.length) return 0;
    const prices = data.templates.filter(t => !t.featured).map(t => t.price);
    return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
  });
</script>

<svelte:head>
  <title>Template Store - Pipewriter</title>
  <meta name="description" content="Professional templates to supercharge your writing workflow. Create compelling documents in a fraction of the time." />
</svelte:head>

<div class="space-y-8">
  <!-- Header Section -->
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold tracking-tight mb-3">Template Store</h1>
        <p class="text-muted-foreground max-w-2xl text-lg">
          Professional templates to supercharge your writing workflow. Create compelling documents in a fraction of the time.
        </p>
      </div>
      
      <!-- Store Stats -->
      {#if data.storeAnalytics}
        <div class="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <Package class="h-4 w-4" />
            <span>{totalTemplates} templates</span>
          </div>
          <div class="flex items-center gap-2">
            <TrendingUp class="h-4 w-4" />
            <span>{data.storeAnalytics.totalDownloads?.toLocaleString()} downloads</span>
          </div>
          <div class="flex items-center gap-2">
            <Star class="h-4 w-4" />
            <span>{data.storeAnalytics.averageRating}/5.0 avg rating</span>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Mobile Stats -->
    {#if data.storeAnalytics}
      <div class="lg:hidden flex items-center gap-4 text-sm text-muted-foreground">
        <Badge variant="outline" class="gap-1">
          <Package class="h-3 w-3" />
          {totalTemplates} templates
        </Badge>
        <Badge variant="outline" class="gap-1">
          <TrendingUp class="h-3 w-3" />
          {data.storeAnalytics.totalDownloads?.toLocaleString()} downloads
        </Badge>
      </div>
    {/if}
  </div>
  
  <!-- Loading State -->
  {#if loading}
    <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="flex flex-col items-center space-y-4">
        <div class="h-8 w-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
        <p class="text-sm text-muted-foreground">Processing purchase...</p>
      </div>
    </div>
  {/if}
  
  <!-- Category Filters -->
  {#if data.categories}
    <CategoryFilter 
      categories={data.categories} 
      activeCategory={activeCategory}
      onCategoryChange={handleCategoryChange}
    />
  {/if}
  
  <!-- Featured Template -->
  {#if featuredTemplate}
    <div class="mb-12">
      <div class="mb-4">
        <h2 class="text-2xl font-semibold mb-2">Featured Template</h2>
        <p class="text-muted-foreground">Our most popular template bundle with everything you need to get started.</p>
      </div>
      <FeaturedTemplate 
        template={featuredTemplate} 
        onPurchase={handlePurchase} 
      />
    </div>
  {/if}
  
  <!-- Regular Templates Grid -->
  {#if filteredTemplates.length > 0}
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold">
            {activeCategory === 'all' ? 'All Templates' : data.categories.find(c => c.id === activeCategory)?.name}
          </h2>
          <p class="text-muted-foreground mt-1">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            {#if averagePrice > 0}
              • Starting from ${Math.min(...filteredTemplates.map(t => t.price))}
            {/if}
          </p>
        </div>
      </div>
      
      <TemplateGrid 
        templates={filteredTemplates} 
        onPurchase={handlePurchase} 
      />
    </div>
  {:else if data.templates?.length === 0}
    <!-- Empty state -->
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <Package class="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 class="text-xl font-medium mb-2">No templates available</h3>
      <p class="text-muted-foreground max-w-md">
        We're still building our template library. Check back soon for professional templates to boost your workflow.
      </p>
    </div>
  {:else}
    <!-- No results for filter -->
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <Package class="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 class="text-xl font-medium mb-2">No templates found</h3>
      <p class="text-muted-foreground max-w-md">
        No templates match your current filter. Try selecting a different category or browse all templates.
      </p>
    </div>
  {/if}
</div>