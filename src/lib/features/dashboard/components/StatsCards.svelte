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
  
  // Map icons to stats by title
  function getIconForStat(title: string) {
    const iconMap = {
      'Active Projects': FileText,
      'Templates Created': LayoutTemplate,
      'Words Written': BookOpen,
      'Google Docs': Cloud
    };
    
    return iconMap[title] || FileText;
  }
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {#each props.stats as stat}
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">{stat.title}</Card.Title>
        <svelte:component this={getIconForStat(stat.title)} class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{stat.value}</div>
        <p class="text-xs text-muted-foreground">{stat.description}</p>
      </Card.Content>
    </Card.Root>
  {/each}
</div>