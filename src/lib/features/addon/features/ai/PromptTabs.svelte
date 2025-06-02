<!-- src/lib/features/addon/features/ai/PromptTabs.svelte -->
<script lang="ts">
  const props = $props<{
    categories: Array<{ id: string; label: string; count: number }>;
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
    disabled?: boolean;
  }>();
</script>

<!-- Category Tabs - Scrollable horizontal -->
<div class="border-b bg-muted/20">
  <div class="flex overflow-x-auto scrollbar-none gap-1 p-1">
    {#each props.categories as category}
      <button
        class="flex-shrink-0 px-3 py-1.5 text-xs font-medium transition-colors rounded-sm
          {props.selectedCategory === category.id 
            ? 'bg-background text-foreground shadow-sm border' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }"
        onclick={() => props.onCategoryChange(category.id)}
        disabled={props.disabled}
      >
        {category.label}
        {#if category.count > 0}
          <span class="ml-1 text-[0.6rem] opacity-60">({category.count})</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>