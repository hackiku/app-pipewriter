<!-- src/lib/features/dashboard/store/CategoryFilter.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Filter, ChevronDown } from 'lucide-svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { cn } from '$lib/utils';
  
  // Props
  const props = $props<{
    categories: Array<{ id: string; name: string }>;
    activeCategory: string;
    onCategoryChange: (category: string) => void;
  }>();
  
  // Is mobile view
  let isMobileView = $state(false);
  
  // Check if screen is mobile size
  $effect(() => {
    if (typeof window !== 'undefined') {
      const checkWidth = () => {
        isMobileView = window.innerWidth < 768;
      };
      
      checkWidth();
      window.addEventListener('resize', checkWidth);
      
      return () => {
        window.removeEventListener('resize', checkWidth);
      };
    }
  });
</script>

<div class="mb-8">
  <!-- Desktop View - Buttons -->
  {#if !isMobileView}
    <div class="flex flex-wrap gap-2 border-b pb-4">
      {#each props.categories as category}
        <Button 
          variant={props.activeCategory === category.id ? "default" : "outline"}
          size="sm"
          class={cn(
            "px-4 transition-all",
            props.activeCategory === category.id 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          )}
          onclick={() => props.onCategoryChange(category.id)}
        >
          {category.name}
        </Button>
      {/each}
    </div>
  {:else}
    <!-- Mobile View - Dropdown -->
    <div class="border-b pb-4 mb-6">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <Button 
            variant="outline" 
            class="w-full justify-between" 
            builders={[builder]}
          >
            <div class="flex items-center gap-2">
              <Filter class="h-4 w-4" />
              <span>
                {props.categories.find(c => c.id === props.activeCategory)?.name || 'Filter'}
              </span>
            </div>
            <ChevronDown class="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-56" align="start">
          <DropdownMenu.Label>Filter by Category</DropdownMenu.Label>
          <DropdownMenu.Separator />
          {#each props.categories as category}
            <DropdownMenu.Item
              onclick={() => props.onCategoryChange(category.id)}
              class={props.activeCategory === category.id ? "bg-muted" : ""}
            >
              {category.name}
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  {/if}
</div>