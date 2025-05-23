<!-- src/lib/features/dashboard/store/TemplateCard.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ShoppingCart, Heart, Star, Download, TrendingUp, Eye } from '@lucide/svelte';
  import { cn } from '$lib/utils';
  import { goto } from '$app/navigation';
  
  // Props - proper Runes syntax
  const { template, onPurchase } = $props<{
    template: any;
    onPurchase: (id: string) => void;
  }>();
  
  // Local states
  let imageLoaded = $state(false);
  let isHovered = $state(false);
  let isFavorite = $state(false);
  let isLoading = $state(false);
  
  // Handle favoriting (placeholder - you'd implement this with Firebase)
  function toggleFavorite(event: Event) {
    event.stopPropagation();
    isFavorite = !isFavorite;
  }
  
  // Handle purchase with loading state
  async function handlePurchase(event: Event) {
    event.stopPropagation();
    isLoading = true;
    
    try {
      await onPurchase(template.id);
    } finally {
      isLoading = false;
    }
  }
  
  // View template detail
  function viewTemplate(event: Event) {
    event.stopPropagation();
    goto(`/dashboard/store/${template.id}`);
  }
  
  // Format download count
  function formatDownloads(count: number): string {
    if (!count || count === 0) return '0';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }
  
  // Safe template tags access - EXTRA SAFE VERSION
  const templateTags = $derived(() => {
    const tags = template?.tags;
    if (Array.isArray(tags)) {
      return tags;
    }
    // Handle case where tags might be an object with array property
    if (tags && typeof tags === 'object' && Array.isArray(tags[0])) {
      return tags[0];
    }
    return [];
  });
</script>

<Card.Root 
  class="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-card border h-full flex flex-col group cursor-pointer"
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
  onclick={viewTemplate}
>
  <div class="relative overflow-hidden" style="aspect-ratio: 4/3;">
    <!-- Loading placeholder -->
    <div class="absolute inset-0 bg-muted/50 flex items-center justify-center transition-opacity duration-300 {imageLoaded ? 'opacity-0' : 'opacity-100'}">
      <div class="animate-pulse h-full w-full bg-muted/70"></div>
    </div>
    
    <!-- Template thumbnail -->
    <img 
      src={template?.thumbnailUrl || '/placeholder-template.jpg'} 
      alt={template?.name || 'Template'}
      class="object-cover h-full w-full transition-all duration-500 {isHovered ? 'scale-105' : 'scale-100'} {imageLoaded ? 'opacity-100' : 'opacity-0'}"
      onload={() => imageLoaded = true}
      loading="lazy"
    />
    
    <!-- Overlay badges -->
    <div class="absolute top-3 left-3 flex items-center gap-2">
      {#if template?.popular}
        <Badge class="bg-orange-500 text-white border-none text-xs">
          <TrendingUp class="h-3 w-3 mr-1" />
          Popular
        </Badge>
      {/if}
      {#if template?.originalPrice && template.originalPrice > template.price}
        <Badge class="bg-green-500 text-white border-none text-xs">
          Save ${template.originalPrice - template.price}
        </Badge>
      {/if}
    </div>
    
    <!-- Favorite button -->
    <button 
      class="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background opacity-0 group-hover:opacity-100"
      onclick={toggleFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart class={cn(
        "h-4 w-4 transition-all", 
        isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
      )} />
    </button>
    
    <!-- Rating overlay -->
    {#if template?.rating}
      <div class="absolute bottom-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
        <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span class="text-xs font-medium">{template.rating.toFixed(1)}</span>
      </div>
    {/if}
  </div>
  
  <Card.Content class="flex-1 flex flex-col p-5">
    <!-- Template header -->
    <div class="mb-3">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-semibold line-clamp-2 flex-1">{template?.name || 'Template'}</h3>
      </div>
      
      <div class="flex items-center gap-2 mb-2">
        <Badge variant="secondary" class="text-xs">{template?.category || 'Template'}</Badge>
        <span class="text-xs text-muted-foreground">•</span>
        <span class="text-xs text-muted-foreground">{template?.difficulty || 'beginner'}</span>
      </div>
      
      <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {template?.description || 'No description available'}
      </p>
    </div>
    
    <!-- Template tags - FIXED: Safe access to tags -->
    <div class="flex flex-wrap gap-1 mb-4">
      {#each templateTags() as tag}
        <span class="text-xs px-2 py-0.5 bg-muted/60 rounded-full text-muted-foreground">
          {tag}
        </span>
      {/each}
      {#if templateTags.length > 3}
        <span class="text-xs px-2 py-0.5 bg-muted/60 rounded-full text-muted-foreground">
          +{templateTags.length - 3}
        </span>
      {/if}
    </div>
    
    <!-- Template stats -->
    {#if template?.downloadCount || template?.wordCount}
      <div class="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        {#if template.downloadCount}
          <div class="flex items-center gap-1">
            <Download class="h-3 w-3" />
            <span>{formatDownloads(template.downloadCount)}</span>
          </div>
        {/if}
        {#if template.wordCount}
          <div class="flex items-center gap-1">
            <span>{template.wordCount}</span>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Price and actions -->
    <div class="mt-auto pt-2 flex items-center justify-between">
      <div class="flex flex-col">
        {#if template?.originalPrice && template.originalPrice > template.price}
          <div class="text-xs text-muted-foreground line-through">
            ${template.originalPrice}
          </div>
        {/if}
        <div class="text-xl font-bold text-foreground">
          ${template?.price || 0}
        </div>
      </div>
      
      <div class="flex gap-2">
        <Button 
          variant="outline"
          size="sm"
          class="gap-1" 
          onclick={viewTemplate}
        >
          <Eye class="h-3 w-3" />
          <span class="hidden sm:inline">View</span>
        </Button>
        
        <Button 
          variant="default"
          size="sm"
          class="gap-2" 
          onclick={handlePurchase}
          disabled={isLoading}
        >
          {#if isLoading}
            <div class="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          {:else}
            <ShoppingCart class="h-3 w-3" />
          {/if}
          <span class="hidden sm:inline">Buy</span>
        </Button>
      </div>
    </div>
  </Card.Content>
</Card.Root>