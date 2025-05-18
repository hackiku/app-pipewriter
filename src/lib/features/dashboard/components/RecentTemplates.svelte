<!-- src/lib/features/dashboard/components/RecentTemplates.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { ChevronRight, LayoutTemplate, Tag } from 'lucide-svelte';
  
  // Props
  const props = $props<{
    templates: Array<{
      id: string;
      name: string;
      category: string;
      usageCount: number;
    }>;
  }>();
</script>

<Card.Root class="h-full">
  <Card.Header class="pb-2">
    <Card.Title class="text-base">Most Used Templates</Card.Title>
    <Card.Description>
      Quick access to your go-to templates
    </Card.Description>
  </Card.Header>
  <Card.Content class="px-0 pb-0">
    <div class="space-y-1">
      {#each props.templates as template}
        <Button
          variant="ghost" 
          class="w-full justify-start rounded-none pl-6 py-2.5 h-auto"
        >
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center">
              <LayoutTemplate class="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{template.name}</span>
            </div>
            <div class="flex items-center text-muted-foreground">
              <Tag class="h-3.5 w-3.5 mr-1.5" />
              <span class="text-xs">{template.category}</span>
              <ChevronRight class="h-4 w-4 ml-4" />
            </div>
          </div>
        </Button>
        {#if props.templates.indexOf(template) < props.templates.length - 1}
          <div class="border-b border-border/40 mx-6"></div>
        {/if}
      {/each}
    </div>
  </Card.Content>
  <Card.Footer class="pt-0">
    <Button variant="ghost" class="w-full flex items-center justify-center">
      View all templates
    </Button>
  </Card.Footer>
</Card.Root>