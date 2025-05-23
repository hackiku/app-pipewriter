<!-- src/lib/features/dashboard/store/TemplateGrid.svelte -->
<script lang="ts">
  import TemplateCard from './TemplateCard.svelte';
  import { Package } from '@lucide/svelte';
  
  // Props
  const props = $props<{
    templates: any[];
    onPurchase: (id: string) => void;
  }>();
  
  // Local state for animations
  let gridRef = $state<HTMLElement>();
  let isVisible = $state(false);
  
  // Intersection observer for animations
  $effect(() => {
    if (gridRef && typeof window !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isVisible = true;
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(gridRef);
      
      return () => {
        observer.disconnect();
      };
    }
  });
</script>

{#if props.templates.length > 0}
  <div 
    bind:this={gridRef}
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  >
    {#each props.templates as template, index (template.id)}
      <div 
        class="opacity-0 translate-y-4 transition-all duration-500 ease-out"
        class:opacity-100={isVisible}
        class:translate-y-0={isVisible}
        style="transition-delay: {index * 100}ms"
      >
        <TemplateCard 
          {template} 
          onPurchase={props.onPurchase}
        />
      </div>
    {/each}
  </div>
{:else}
  <!-- Empty state for grid -->
  <div class="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-muted rounded-lg">
    <Package class="h-12 w-12 text-muted-foreground/50 mb-4" />
    <h3 class="text-lg font-medium mb-2">No templates found</h3>
    <p class="text-muted-foreground text-sm max-w-md">
      No templates match your current selection. Try adjusting your filters or browse all categories.
    </p>
  </div>
{/if}