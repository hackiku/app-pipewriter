<!-- src/lib/features/dashboard/Dashboard.svelte -->
<script lang="ts">
  import { getUser } from '$lib/services/firebase/auth.svelte';
  import { fade } from 'svelte/transition';
  
  // Import dashboard components
  import DashboardHeader from './components/DashboardHeader.svelte';
  import ProjectsList from './components/ProjectsList.svelte';
  import StatsCards from './components/StatsCards.svelte';
  import RecentTemplates from './components/RecentTemplates.svelte';
  import TemplateGrid from './components/TemplateGrid.svelte';
  
  // State
  let loading = $state(true);
  let user = $state(getUser());
  
  // Load data on mount
  $effect(() => {
    // Simulate loading data
    setTimeout(() => {
      loading = false;
    }, 500);
    
    // Keep user updated
    user = getUser();
  });
  
  // Mock data for initial render
  const stats = [
    { title: 'Active Projects', value: '12', description: '3 updated today' },
    { title: 'Templates Created', value: '34', description: '+2 this week' },
    { title: 'Words Written', value: '24.5k', description: 'Last 30 days' },
    { title: 'Google Docs', value: '18', description: 'Connected' }
  ];
  
  const recentProjects = [
    { id: '1', name: 'SaaS Landing Page', lastEdited: '2 hours ago', template: 'Landing Page', status: 'In Progress' },
    { id: '2', name: 'Product Feature Page', lastEdited: 'Yesterday', template: 'Feature Page', status: 'Complete' },
    { id: '3', name: 'Email Campaign', lastEdited: '3 days ago', template: 'Email', status: 'Review' }
  ];
  
  const recentTemplates = [
    { id: '1', name: 'Landing Page', category: 'Website', usageCount: 12 },
    { id: '2', name: 'Email Template', category: 'Email', usageCount: 8 },
    { id: '3', name: 'Feature Comparison', category: 'Website', usageCount: 5 },
    { id: '4', name: 'Blog Post', category: 'Content', usageCount: 7 }
  ];
</script>

<div class="flex flex-col min-h-screen">
  <!-- Dashboard Header -->
  <DashboardHeader />
  
  <!-- Main Content Area -->
  <main class="flex-1 container mx-auto px-4 py-6 max-w-7xl">
    {#if loading}
      <div class="flex justify-center items-center h-32" in:fade>
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <!-- Welcome section for logged in users -->
      {#if user}
        <div class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight">
            Welcome back, {user.displayName?.split(' ')[0] || 'Writer'}
          </h1>
          <p class="text-muted-foreground mt-1">Here's what's happening with your projects.</p>
        </div>
      {:else}
        <div class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight">Welcome to Pipewriter</h1>
          <p class="text-muted-foreground mt-1">Sign in to access your projects and templates.</p>
        </div>
      {/if}
      
      <!-- Stats Cards Row -->
      <StatsCards stats={stats} />
      
      <!-- Projects & Templates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <!-- Projects List - Wider Column -->
        <div class="md:col-span-2">
          <ProjectsList projects={recentProjects} />
        </div>
        
        <!-- Recent Templates - Sidebar -->
        <div class="md:col-span-1">
          <RecentTemplates templates={recentTemplates} />
        </div>
      </div>
      
      <!-- Template Grid -->
      <div class="mt-8">
        <TemplateGrid />
      </div>
    {/if}
  </main>
</div>