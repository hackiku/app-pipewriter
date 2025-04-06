<!-- src/lib/features/dashboard/components/TemplateGrid.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Search, PlusCircle, Grid2x2, List } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { cn } from '$lib/utils';
  
  // State
  let view = $state<'grid' | 'list'>('grid');
  let searchQuery = $state('');
  
  // Mock data
  const categories = ['All', 'Website', 'Email', 'Social', 'Document', 'Custom'];
  let activeCategory = $state('All');
  
  const templates = [
    {
      id: '1',
      name: 'Website Landing Page',
      description: 'A complete landing page wireframe with hero, features and CTA sections',
      category: 'Website',
      isPreset: true,
      previewImg: '/placeholder-light.svg'
    },
    {
      id: '2',
      name: 'Email Newsletter',
      description: 'Newsletter template with header, content blocks and footer',
      category: 'Email',
      isPreset: true,
      previewImg: '/placeholder-light.svg'
    },
    {
      id: '3',
      name: 'Product Page',
      description: 'Detailed product page with features, specifications and reviews',
      category: 'Website',
      isPreset: true,
      previewImg: '/placeholder-light.svg'
    },
    {
      id: '4',
      name: 'Feature Comparison',
      description: 'Side-by-side product comparison with feature tables',
      category: 'Document',
      isPreset: false,
      previewImg: '/placeholder-light.svg'
    }
  ];
  
  // Filtered templates based on search and category
  let filteredTemplates = $derived(() => {
    return templates.filter(template => {
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  });
  
  // Handle category click
  function setCategory(category: string) {
    activeCategory = category;
  }
</script>

<Card.Root>
  <Card.Header>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <Card.Title>Templates</Card.Title>
      <div class="flex items-center gap-2">
        <div class="relative w-full sm:w-64">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            class="w-full pl-8"
            bind:value={searchQuery}
          />
        </div>
        <Button>
          <PlusCircle class="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>
    </div>
  </Card.Header>
  
  <Card.Content>
    <!-- Category Tabs -->
    <div class="border-b mb-6">
      <Tabs.Root value={activeCategory}>
        <Tabs.List class="flex-wrap">
          {#each categories as category}
            <Tabs.Trigger 
              value={category}
              on:click={() => setCategory(category)}
            >
              {category}
            </Tabs.Trigger>
          {/each}
        </Tabs.List>
      </Tabs.Root>
    </div>
    
    <!-- View Toggle -->
    <div class="flex justify-end mb-4">
      <div class="border rounded-md overflow-hidden flex">
        <Button 
          variant="ghost" 
          size="sm" 
          class={cn(
            "rounded-none border-0",
            view === 'grid' && "bg-muted"
          )}
          on:click={() => view = 'grid'}
        >
          <Grid2x2 class="h-4 w-4" />
        </Button>
        <div class="border-l h-full"></div>
        <Button 
          variant="ghost" 
          size="sm" 
          class={cn(
            "rounded-none border-0",
            view === 'list' && "bg-muted"
          )}
          on:click={() => view = 'list'}
        >
          <List class="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    <!-- Grid View -->
    {#if view === 'grid'}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredTemplates as template}
          <Card.Root class="overflow-hidden">
            <div class="h-40 bg-muted flex items-center justify-center">
              <img 
                src={template.previewImg} 
                alt={template.name} 
                class="w-full h-full object-cover"
              />
            </div>
            <Card.Header class="pt-4">
              <div class="flex items-center justify-between">
                <Card.Title class="text-base">{template.name}</Card.Title>
                {#if template.isPreset}
                  <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Preset
                  </span>
                {/if}
              </div>
              <Card.Description class="line-clamp-2">
                {template.description}
              </Card.Description>
            </Card.Header>
            <Card.Footer class="pt-0 flex justify-between">
              <Button variant="ghost" size="sm">Preview</Button>
              <Button variant="default" size="sm">Use Template</Button>
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>
    {:else}
      <!-- List View -->
      <div class="space-y-2">
        {#each filteredTemplates as template}
          <div class="border rounded-md p-4 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-medium">{template.name}</h3>
                {#if template.isPreset}
                  <span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Preset
                  </span>
                {/if}
              </div>
              <p class="text-sm text-muted-foreground mt-1">{template.description}</p>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm">Preview</Button>
              <Button variant="default" size="sm">Use</Button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    
    <!-- Empty State -->
    {#if filteredTemplates.length === 0}
      <div class="py-12 text-center">
        <p class="text-muted-foreground mb-4">No templates found matching your criteria</p>
        <Button on:click={() => { searchQuery = ''; activeCategory = 'All'; }}>
          Reset Filters
        </Button>
      </div>
    {/if}
  </Card.Content>
</Card.Root>