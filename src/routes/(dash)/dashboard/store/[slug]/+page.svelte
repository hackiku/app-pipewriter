<!-- src/routes/(dash)/dashboard/store/[slug]/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { 
    ArrowLeft, 
    ShoppingCart, 
    Star, 
    Download, 
    Clock, 
    TrendingUp,
    Eye,
    Check
  } from 'lucide-svelte';
  
  // Get data from server
  const { data } = $props();
  
  // Simple state
  let loading = $state(false);
  
  console.log('Template detail data:', data);
  
  // Go back to store
  function goBack() {
    goto('/dashboard/store');
  }
  
  // Handle purchase
  async function handlePurchase() {
    loading = true;
    console.log('Purchase:', data.template.id);
    
    try {
      alert(`Purchase: ${data.template.name} for $${data.template.price}`);
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      loading = false;
    }
  }
  
  // Format download count
  function formatDownloads(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }
  
  // Calculate savings
  const savings = data.template.originalPrice && data.template.originalPrice > data.template.price 
    ? data.template.originalPrice - data.template.price 
    : 0;
</script>

<svelte:head>
  <title>{data.template.name} - Template Store</title>
  <meta name="description" content={data.template.description} />
</svelte:head>

<div class="space-y-8">
  <!-- Back button -->
  <div>
    <Button variant="ghost" onclick={goBack} class="gap-2">
      <ArrowLeft class="h-4 w-4" />
      Back to Store
    </Button>
  </div>
  
  <!-- Loading overlay -->
  {#if loading}
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded">
        <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Processing purchase...</p>
      </div>
    </div>
  {/if}
  
  <!-- Template header -->
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-6">
      <div class="flex-1">
        <h1 class="text-4xl font-bold mb-4">{data.template.name}</h1>
        
        <!-- Badges -->
        <div class="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{data.template.category}</Badge>
          <Badge variant="outline" class="capitalize">{data.template.difficulty}</Badge>
          {#if data.template.popular}
            <Badge class="bg-orange-500 text-white gap-1">
              <TrendingUp class="h-3 w-3" />
              Popular
            </Badge>
          {/if}
          {#if savings > 0}
            <Badge class="bg-green-500 text-white">
              Save ${savings}
            </Badge>
          {/if}
        </div>
        
        <p class="text-muted-foreground text-lg leading-relaxed max-w-2xl">
          {data.template.description}
        </p>
      </div>
      
      <!-- Price and purchase -->
      <div class="text-right">
        {#if savings > 0}
          <div class="text-sm text-muted-foreground line-through mb-1">
            ${data.template.originalPrice}
          </div>
        {/if}
        <div class="text-4xl font-bold mb-4">
          ${data.template.price}
        </div>
        
        <div class="space-y-3">
          <Button 
            size="lg" 
            class="w-full gap-2" 
            onclick={handlePurchase}
            disabled={loading}
          >
            {#if loading}
              <div class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Processing...
            {:else}
              <ShoppingCart class="h-4 w-4" />
              Purchase Template
            {/if}
          </Button>
          
          {#if data.template.previewUrl}
            <Button 
              variant="outline" 
              size="lg"
              class="w-full gap-2"
              onclick={() => window.open(data.template.previewUrl, '_blank')}
            >
              <Eye class="h-4 w-4" />
              Preview
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Stats row -->
  <div class="flex items-center gap-6 text-sm text-muted-foreground">
    {#if data.template.rating}
      <div class="flex items-center gap-1">
        <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span class="font-medium">{data.template.rating.toFixed(1)}</span>
        <span>({data.template.reviews} reviews)</span>
      </div>
    {/if}
    
    {#if data.template.downloadCount}
      <div class="flex items-center gap-1">
        <Download class="h-4 w-4" />
        <span>{formatDownloads(data.template.downloadCount)} downloads</span>
      </div>
    {/if}
    
    {#if data.template.wordCount}
      <div class="flex items-center gap-1">
        <Clock class="h-4 w-4" />
        <span>{data.template.wordCount}</span>
      </div>
    {/if}
  </div>
  
  <!-- Tags -->
  {#if data.template.tags.length > 0}
    <div>
      <h3 class="text-lg font-semibold mb-3">Tags</h3>
      <div class="flex flex-wrap gap-2">
        {#each data.template.tags as tag}
          <Badge variant="outline" class="text-xs">{tag}</Badge>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Sections included -->
  {#if data.template.sections.length > 0}
    <div>
      <h3 class="text-lg font-semibold mb-3">What's Included</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each data.template.sections as section}
          <div class="flex items-center gap-2 text-sm">
            <Check class="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{section}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Template info -->
  <div class="border-t pt-6">
    <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
      <div>
        <dt class="font-medium text-muted-foreground">Category</dt>
        <dd class="mt-1">{data.template.category}</dd>
      </div>
      <div>
        <dt class="font-medium text-muted-foreground">Industry</dt>
        <dd class="mt-1">{data.template.industry}</dd>
      </div>
      <div>
        <dt class="font-medium text-muted-foreground">Difficulty</dt>
        <dd class="mt-1 capitalize">{data.template.difficulty}</dd>
      </div>
    </dl>
  </div>
  
  <!-- Trust indicators -->
  <div class="border-t pt-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
      <div class="flex items-center gap-6">
        <span>✓ Instant access after purchase</span>
        <span>✓ 30-day money back guarantee</span>
        <span>✓ Works with Google Docs</span>
      </div>
      
      {#if data.userTier}
        <Badge class="capitalize">{data.userTier} User</Badge>
      {/if}
    </div>
  </div>
</div>