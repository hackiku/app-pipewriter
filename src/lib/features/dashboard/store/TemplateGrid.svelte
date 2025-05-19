<!-- src/lib/features/dashboard/store/TemplateGrid.svelte -->
<script lang="ts">
  import TemplateCard from './TemplateCard.svelte';
  import { Button } from '$lib/components/ui/button';
  import { ArrowRight } from 'lucide-svelte';
  
  // Props
  const props = $props<{
    templates: any[];
    onPurchase: (id: string) => void;
  }>();
  
  // Pagination settings
  let itemsPerPage = $state(6); // Show 6 templates per page
  let currentPage = $state(1);
  
  // Computed properties
  let paginatedTemplates = $derived(
    props.templates.slice(0, currentPage * itemsPerPage)
  );
  
  let hasMoreTemplates = $derived(
    paginatedTemplates.length < props.templates.length
  );
  
  // Load more templates
  function loadMore() {
    currentPage++;
  }
</script>

<div>
  {#if props.templates.length === 0}
    <div class="text-center py-16 border border-dashed rounded-lg">
      <h3 class="text-lg font-medium text-muted-foreground mb-3">No templates found</h3>
      <p class="text-muted-foreground mb-4">Try selecting a different category or check back later.</p>
      <Button variant="outline" onclick={() => props.onCategoryChange?.('all')}>
        View all templates
      </Button>
    </div>
  {:else}
    <!-- Template Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 mb-10">
      {#each paginatedTemplates as template}
        <TemplateCard 
          template={template} 
          onPurchase={props.onPurchase} 
        />
      {/each}
    </div>
    
    <!-- Load More Button -->
    {#if hasMoreTemplates}
      <div class="flex justify-center mt-6 mb-10">
        <Button 
          variant="outline" 
          size="lg"
          class="gap-2" 
          onclick={loadMore}
        >
          <span>Load more templates</span>
          <ArrowRight class="h-4 w-4" />
        </Button>
      </div>
    {/if}
  {/if}
</div>