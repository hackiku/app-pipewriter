<!-- src/lib/features/dashboard/components/ProjectsList.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import * as Table from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';
  import { PlusCircle, ArrowRight } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  
  // Props
  const props = $props<{
    projects: Array<{
      id: string;
      name: string;
      lastEdited: string;
      template: string;
      status: string;
    }>;
  }>();
  
  // Get status badge class based on status
  function getStatusClass(status: string) {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  }
</script>

<Card.Root>
  <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
    <Card.Title>Recent Projects</Card.Title>
    <Button variant="outline" size="sm" class="h-8 gap-1">
      <PlusCircle class="h-3.5 w-3.5" />
      <span>New</span>
    </Button>
  </Card.Header>
  <Card.Content>
    {#if props.projects.length === 0}
      <div class="text-center py-6">
        <p class="text-muted-foreground">No projects yet</p>
        <Button variant="outline" class="mt-4">Create your first project</Button>
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Template</Table.Head>
            <Table.Head>Last Edited</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head class="w-[50px]"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each props.projects as project}
            <Table.Row>
              <Table.Cell class="font-medium">{project.name}</Table.Cell>
              <Table.Cell>{project.template}</Table.Cell>
              <Table.Cell>{project.lastEdited}</Table.Cell>
              <Table.Cell>
                <span class={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  getStatusClass(project.status)
                )}>
                  {project.status}
                </span>
              </Table.Cell>
              <Table.Cell>
                <Button variant="ghost" size="icon" class="h-8 w-8">
                  <ArrowRight class="h-4 w-4" />
                </Button>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
      
      <div class="flex justify-center mt-4">
        <Button variant="outline" size="sm" class="gap-1">
          <span>View all projects</span>
          <ArrowRight class="h-3.5 w-3.5" />
        </Button>
      </div>
    {/if}
  </Card.Content>
</Card.Root>