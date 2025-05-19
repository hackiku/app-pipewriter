<!-- src/lib/features/dashboard/store/TemplateCard.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ShoppingCart, Heart, Star } from 'lucide-svelte';
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
  
  // Handle favoriting
  function toggleFavorite(event) {
    event.stopPropagation();
    isFavorite = !isFavorite;
  }
</script>

<Card.Root 
  class="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-background h-full flex flex-col"
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
>
  <div class="relative overflow-hidden" style="aspect-ratio: 4/3;">
    <!-- Loading placeholder -->
    <div class="absolute inset-0 bg-muted/50 flex items-center justify-center transition-opacity duration-300 {imageLoaded ? 'opacity-0' : 'opacity-100'}">
      <div class="animate-pulse h-full w-full bg-muted/70"></div>
    </div>
    
    <!-- Actual image -->
    <img 
      src={props.template.thumbnailUrl || '/placeholder-template.jpg'} 
      alt={props.template.name}
      class="object-cover h-full w-full transition-all duration-500 {isHovered ? 'scale-105' : 'scale-100'} {imageLoaded ? 'opacity-100' : 'opacity-0'}"
      onload={() => imageLoaded = true}
    />
    
    <!-- Badges -->
    <div class="absolute top-3 left-3 flex items-center gap-2">
      {#if props.template.popular}
        <Badge class="bg-orange-500 text-white border-none">Popular</Badge>
      {/if}
    </div>
    
    <!-- Favorite button -->
    <button 
      class="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background"
      onclick={toggleFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart class={cn(
        "h-4 w-4 transition-all", 
        isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
      )} />
    </button>
  </div>
  
  <Card.Content class="flex-1 flex flex-col p-6">
    <div class="mb-3">
      <h3 class="text-xl font-semibold mb-1">{props.template.name}</h3>
      <Badge variant="secondary" class="mb-2">{props.template.category}</Badge>
      <p class="text-muted-foreground line-clamp-3">{props.template.description}</p>
    </div>
    
    <div class="flex flex-wrap gap-1 my-3">
      {#each props.template.tags.slice(0, 2) as tag}
        <span class="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{tag}</span>
      {/each}
    </div>
    
    <div class="mt-auto pt-4 flex items-center justify-between">
      <div>
        {#if props.template.originalPrice}
          <div class="text-xs text-muted-foreground line-through">${props.template.originalPrice}</div>
        {/if}
        <div class="text-xl font-bold">${props.template.price}</div>
      </div>
      
      <Button 
        variant="outline"
        class="gap-2" 
        onclick={() => props.onPurchase(props.template.id)}
      >
        <ShoppingCart class="h-4 w-4" />
        <span>Purchase</span>
      </Button>
    </div>
  </Card.Content>
</Card.Root>