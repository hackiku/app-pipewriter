<!-- src/lib/features/dashboard/store/TemplateCard.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ShoppingCart, Heart, Star, Download, TrendingUp } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  
  // Props
  const props = $props<{
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
      await props.onPurchase(props.template.id);
    } finally {
      isLoading = false;
    }
  }
  
  // Format download count
  function formatDownloads(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }
</script>

<Card.Root 
  class="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-card border h-full flex flex-col group"
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
>
  <div class="relative overflow-hidden" style="aspect-ratio: 4/3;">
    <!-- Loading placeholder -->
    <div class="absolute inset-0 bg-muted/50 flex items-center justify-center transition-opacity duration-300 {imageLoaded ? 'opacity-0' : 'opacity-100'}">
      <div class="animate-pulse h-full w-full bg-muted/70"></div>
    </div>
    
    <!-- Template thumbnail -->
    <img 
      src={props.template.thumbnailUrl || '/placeholder-template.jpg'} 
      alt={props.template.name}
      class="object-cover h-full w-full transition-all duration-500 {isHovered ? 'scale-105' : 'scale-100'} {imageLoaded ? 'opacity-100' : 'opacity-0'}"
      onload={() => imageLoaded = true}
      loading="lazy"
    />
    
    <!-- Overlay badges -->
    <div class="absolute top-3 left-3 flex items-center gap-2">
      {#if props.template.popular}
        <Badge class="bg-orange-500 text-white border-none text-xs">
          <TrendingUp class="h-3 w-3 mr-1" />
          Popular
        </Badge>
      {/if}
      {#if props.template.originalPrice && props.template.originalPrice > props.template.price}
        <Badge class="bg-green-500 text-white border-none text-xs">
          Save ${props.template.originalPrice - props.template.price}
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
    {#if props.template.rating}
      <div class="absolute bottom-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
        <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span class="text-xs font-medium">{props.template.rating.toFixed(1)}</span>
      </div>
    {/if}
  </div>
  
  <Card.Content class="flex-1 flex flex-col p-5">
    <!-- Template header -->
    <div class="mb-3">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-semibold line-clamp-2 flex-1">{props.template.name}</h3>
      </div>
      
      <div class="flex items-center gap-2 mb-2">
        <Badge variant="secondary" class="text-xs">{props.template.category}</Badge>
        <span class="text-xs text-muted-foreground">•</span>
        <span class="text-xs text-muted-foreground">{props.template.difficulty}</span>
      </div>
      
      <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {props.template.description}
      </p>
    </div>
    
    <!-- Template tags -->
    <div class="flex flex-wrap gap-1 mb-4">
      {#each props.template.tags.slice(0, 3) as tag}
        <span class="text-xs px-2 py-0.5 bg-muted/60 rounded-full text-muted-foreground">
          {tag}
        </span>
      {/each}
      {#if props.template.tags.length > 3}
        <span class="text-xs px-2 py-0.5 bg-muted/60 rounded-full text-muted-foreground">
          +{props.template.tags.length - 3}
        </span>
      {/if}
    </div>
    
    <!-- Template stats -->
    {#if props.template.downloadCount || props.template.wordCount}
      <div class="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        {#if props.template.downloadCount}
          <div class="flex items-center gap-1">
            <Download class="h-3 w-3" />
            <span>{formatDownloads(props.template.downloadCount)}</span>
          </div>
        {/if}
        {#if props.template.wordCount}
          <div class="flex items-center gap-1">
            <span>{props.template.wordCount}</span>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Price and purchase -->
    <div class="mt-auto pt-2 flex items-center justify-between">
      <div class="flex flex-col">
        {#if props.template.originalPrice && props.template.originalPrice > props.template.price}
          <div class="text-xs text-muted-foreground line-through">
            ${props.template.originalPrice}
          </div>
        {/if}
        <div class="text-xl font-bold text-foreground">
          ${props.template.price}
        </div>
      </div>
      
      <Button 
        variant="default"
        size="sm"
        class="gap-2 min-w-[100px]" 
        onclick={handlePurchase}
        disabled={isLoading}
      >
        {#if isLoading}
          <div class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        {:else}
          <ShoppingCart class="h-4 w-4" />
          <span>Purchase</span>
        {/if}
      </Button>
    </div>
  </Card.Content>
</Card.Root>