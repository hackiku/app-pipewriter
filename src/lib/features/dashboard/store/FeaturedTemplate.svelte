<!-- src/lib/features/dashboard/store/FeaturedTemplate.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ShoppingCart, Star, Check } from 'lucide-svelte';
  
  // Props
  const props = $props<{
    template: any;
    onPurchase: (id: string) => void;
  }>();
  
  // Local state for image loading
  let imageLoaded = $state(false);
</script>

<Card.Root class="overflow-hidden bg-gradient-to-tr from-muted/50 to-background border-2">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-0">
    <!-- Image Section -->
    <div class="lg:col-span-1 overflow-hidden relative h-full min-h-[250px]">
      <div class="absolute inset-0 bg-muted/80 flex items-center justify-center transition-opacity duration-300 {imageLoaded ? 'opacity-0' : 'opacity-100'}">
        <div class="animate-pulse h-full w-full bg-muted/70"></div>
      </div>
      
      <img 
        src={props.template.thumbnailUrl || '/placeholder-template.jpg'} 
        alt={props.template.name} 
        class="object-cover h-full w-full transition-all duration-700 {imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}"
        onload={() => imageLoaded = true}
        style="aspect-ratio: 16/9;" 
      />
      
      <div class="absolute top-4 left-4">
        <Badge class="bg-primary text-primary-foreground font-medium px-3 py-1 flex items-center gap-1">
          <Star class="h-3.5 w-3.5 fill-current" />
          <span>Featured</span>
        </Badge>
      </div>
    </div>
    
    <!-- Content Section -->
    <div class="lg:col-span-2 p-8">
      <div class="flex justify-between items-start gap-4 mb-5">
        <div>
          <h2 class="text-2xl lg:text-3xl font-bold mb-2">{props.template.name}</h2>
          <div class="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{props.template.category}</Badge>
            {#each props.template.tags.slice(0, 3) as tag}
              <Badge variant="outline" class="font-normal">{tag}</Badge>
            {/each}
          </div>
        </div>
        <div class="text-right">
          {#if props.template.originalPrice}
            <div class="text-sm text-muted-foreground line-through">${props.template.originalPrice}</div>
          {/if}
          <div class="text-2xl font-bold">${props.template.price}</div>
        </div>
      </div>
      
      <p class="text-muted-foreground text-lg leading-relaxed mb-6">{props.template.description}</p>
      
      <!-- Features List -->
      <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
        {#each ['Instant access', 'Google-Docs ready', 'Export to HTML', 'Fully customizable'] as feature}
          <div class="flex items-center text-sm text-muted-foreground">
            <Check class="h-4 w-4 mr-2 text-green-500" />
            <span>{feature}</span>
          </div>
        {/each}
      </div>
      
      <!-- Action Button -->
      <Button 
        size="lg" 
        class="w-full sm:w-auto gap-2 pl-4 pr-6 py-6 h-auto text-lg font-medium" 
        onclick={() => props.onPurchase(props.template.id)}
      >
        <ShoppingCart class="h-5 w-5" />
        <span>Get Template Bundle</span>
      </Button>
    </div>
  </div>
</Card.Root>