<!-- src/lib/features/dashboard/store/FeaturedTemplate.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ShoppingCart, Star, Check, Download, TrendingUp, Package } from 'lucide-svelte';
  
  // Props - proper Runes syntax
  const { template, onPurchase } = $props<{
    template: any;
    onPurchase: (id: string) => void;
  }>();
  
  // Local state
  let imageLoaded = $state(false);
  let isLoading = $state(false);
  
  // Handle purchase with loading state
  async function handlePurchase() {
    isLoading = true;
    
    try {
      await onPurchase(template.id);
    } finally {
      isLoading = false;
    }
  }
  
  // Format download count
  function formatDownloads(count: number): string {
    if (!count || count === 0) return '0';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }
  
  // Calculate savings - safer with default values
  const savings = $derived(() => {
    if (!template?.originalPrice || !template?.price) return 0;
    if (template.originalPrice > template.price) {
      return template.originalPrice - template.price;
    }
    return 0;
  });
  
  // Get included features - safely handle template data
  const features = $derived(() => {
    if (!template) return [];
    
    const baseFeatures = [
      'Instant Google Docs access',
      'Professional formatting included',
      'Copy-paste ready templates',
      'Works with Pipewriter app'
    ];
    
    // FIXED: Safely check for bundleIncludes and sections
    const additionalFeatures = [];
    
    if (template.bundleIncludes?.length) {
      additionalFeatures.push(`${template.bundleIncludes.length} individual templates`);
    }
    
    if (template.sections?.length) {
      additionalFeatures.push(`${template.sections.length} page sections`);
    }
    
    return [...baseFeatures, ...additionalFeatures];
  });
  
  // Safe template tags access
  const templateTags = $derived(() => {
    return Array.isArray(template?.tags) ? template.tags : [];
  });
</script>

<Card.Root class="overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 border-2 border-border/60 shadow-lg">
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-0">
    <!-- Image Section -->
    <div class="lg:col-span-2 overflow-hidden relative min-h-[300px]">
      <!-- Loading placeholder -->
      <div class="absolute inset-0 bg-muted/80 flex items-center justify-center transition-opacity duration-300 {imageLoaded ? 'opacity-0' : 'opacity-100'}">
        <div class="animate-pulse h-full w-full bg-muted/70"></div>
      </div>
      
      <!-- Template image -->
      <img 
        src={template?.thumbnailUrl || '/placeholder-template.jpg'} 
        alt={template?.name || 'Template'} 
        class="object-cover h-full w-full transition-all duration-700 {imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}"
        onload={() => imageLoaded = true}
        style="aspect-ratio: 16/10;" 
      />
      
      <!-- Featured badge -->
      <div class="absolute top-4 left-4">
        <Badge class="bg-primary text-primary-foreground font-medium px-3 py-1.5 flex items-center gap-2 text-sm">
          <Star class="h-4 w-4 fill-current" />
          <span>Featured Bundle</span>
        </Badge>
      </div>
      
      <!-- Stats overlay -->
      <div class="absolute bottom-4 left-4 right-4 flex items-center gap-3">
        {#if template?.rating}
          <div class="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span class="text-sm font-medium">{template.rating.toFixed(1)}</span>
            <span class="text-xs text-muted-foreground">({template?.reviews || 0})</span>
          </div>
        {/if}
        
        {#if template?.downloadCount}
          <div class="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Download class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{formatDownloads(template.downloadCount)}</span>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Content Section -->
    <div class="lg:col-span-3 p-8">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex-1">
            <h2 class="text-3xl lg:text-4xl font-bold mb-3">{template?.name || 'Template'}</h2>
            <div class="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" class="text-sm">{template?.category || 'Template'}</Badge>
              <!-- FIXED: Safe template tags rendering -->
              {#each templateTags.slice(0, 3) as tag}
                <Badge variant="outline" class="font-normal text-xs">{tag}</Badge>
              {/each}
            </div>
          </div>
          
          <!-- Pricing -->
          <div class="text-right flex-shrink-0">
            {#if savings > 0}
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm text-muted-foreground line-through">${template?.originalPrice || 0}</span>
                <Badge class="bg-green-500 text-white text-xs">Save ${savings}</Badge>
              </div>
            {/if}
            <div class="text-3xl font-bold text-foreground">${template?.price || 0}</div>
            {#if template?.bundleIncludes?.length}
              <div class="text-xs text-muted-foreground mt-1">
                ({template.bundleIncludes.length} templates included)
              </div>
            {/if}
          </div>
        </div>
        
        <p class="text-muted-foreground text-lg leading-relaxed">{template?.description || ''}</p>
      </div>
      
      <!-- Features Grid -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package class="h-5 w-5" />
          What's Included
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
          {#each features.slice(0, 6) as feature}
            <div class="flex items-center text-sm">
              <Check class="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
              <span class="text-muted-foreground">{feature}</span>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Word count and difficulty -->
      {#if template?.wordCount || template?.difficulty}
        <div class="mb-6 flex items-center gap-6 text-sm text-muted-foreground">
          {#if template.wordCount}
            <div class="flex items-center gap-2">
              <span class="font-medium">Word count:</span>
              <span>{template.wordCount}</span>
            </div>
          {/if}
          {#if template.difficulty}
            <div class="flex items-center gap-2">
              <span class="font-medium">Difficulty:</span>
              <Badge variant="outline" class="capitalize text-xs">{template.difficulty}</Badge>
            </div>
          {/if}
        </div>
      {/if}
      
      <!-- Action Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <Button 
          size="lg" 
          class="flex-1 sm:flex-none gap-3 px-8 py-4 h-auto text-lg font-medium" 
          onclick={handlePurchase}
          disabled={isLoading}
        >
          {#if isLoading}
            <div class="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          {:else}
            <ShoppingCart class="h-5 w-5" />
            <span>Get Complete Bundle</span>
          {/if}
        </Button>
        
        {#if template?.previewUrl}
          <Button 
            variant="outline"
            size="lg"
            class="gap-2 px-6 py-4 h-auto"
            onclick={() => window.open(template.previewUrl, '_blank')}
          >
            <span>Preview</span>
          </Button>
        {/if}
      </div>
      
      <!-- Trust indicators -->
      <div class="mt-6 pt-6 border-t border-border/50">
        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <span>✓ Instant access after purchase</span>
          <span>✓ 30-day money back guarantee</span>
          <span>✓ Works with Google Docs</span>
        </div>
      </div>
    </div>
  </div>
</Card.Root>