<!-- src/lib/features/dashboard/components/StatsCards.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { FileText, LayoutTemplate, BookOpen, Cloud } from 'lucide-svelte';
  
  // Props
  const props = $props<{
    stats: Array<{
      title: string;
      value: string;
      description: string;
    }>;
  }>();
  
  // FIXED: Direct icon mapping instead of svelte:component
  function getIconComponent(title: string) {
    switch (title) {
      case 'Active Projects':
        return FileText;
      case 'Templates Created':
        return LayoutTemplate;
      case 'Words Written':
        return BookOpen;
      case 'Google Docs':
        return Cloud;
      default:
        return FileText;
    }
  }
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {#each props.stats as stat}
    {@const IconComponent = getIconComponent(stat.title)}
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">{stat.title}</Card.Title>
        <!-- FIXED: Direct component usage instead of svelte:component -->
        {#if IconComponent === FileText}
          <FileText class="h-4 w-4 text-muted-foreground" />
        {:else if IconComponent === LayoutTemplate}
          <LayoutTemplate class="h-4 w-4 text-muted-foreground" />
        {:else if IconComponent === BookOpen}
          <BookOpen class="h-4 w-4 text-muted-foreground" />
        {:else if IconComponent === Cloud}
          <Cloud class="h-4 w-4 text-muted-foreground" />
        {:else}
          <FileText class="h-4 w-4 text-muted-foreground" />
        {/if}
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{stat.value}</div>
        <p class="text-xs text-muted-foreground">{stat.description}</p>
      </Card.Content>
    </Card.Root>
  {/each}
</div>