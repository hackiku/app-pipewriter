<!-- src/lib/features/dashboard/Dashboard.svelte - Updated to use layout data -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // Import dashboard components
  import ProjectsList from './components/ProjectsList.svelte';
  import StatsCards from './components/StatsCards.svelte';
  import RecentTemplates from './components/RecentTemplates.svelte';
  import TemplateGrid from './components/TemplateGrid.svelte';
  
  // Get data from layout context
  const dashboardData = getContext('dashboardData');
  const access = getContext('access');
  
  // Extract data with fallbacks
  const user = dashboardData?.user;
  const userStats = dashboardData?.userStats || {};
  const recentProjects = dashboardData?.recentProjects || [];
  const store = dashboardData?.store || { templates: [], analytics: null };
  
  // Transform user stats to expected format
  const stats = [
    { 
      title: 'Active Projects', 
      value: userStats.activeProjects?.toString() || '0', 
      description: '3 updated today' 
    },
    { 
      title: 'Templates Created', 
      value: userStats.templatesCreated?.toString() || '0', 
      description: '+2 this week' 
    },
    { 
      title: 'Words Written', 
      value: userStats.wordsWritten ? `${(userStats.wordsWritten / 1000).toFixed(1)}k` : '0', 
      description: 'Last 30 days' 
    },
    { 
      title: 'Google Docs', 
      value: userStats.googleDocsConnected?.toString() || '0', 
      description: 'Connected' 
    }
  ];
  
  // Mock recent templates from store data
  const recentTemplates = store.templates.slice(0, 4).map(template => ({
    id: template.id,
    name: template.name,
    category: template.category,
    usageCount: template.downloadCount
  }));
  
  // Debug logging
  $effect(() => {
    console.log('[DASHBOARD] Data:', {
      user: user?.email,
      tier: access?.userAccess?.tier,
      statsCount: stats.length,
      projectsCount: recentProjects.length,
      templatesCount: recentTemplates.length
    });
  });
</script>

<div class="space-y-8">
  <!-- Welcome section -->
  <div>
    <h1 class="text-3xl font-bold tracking-tight">
      {#if user}
        Welcome back, {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Writer'}
      {:else}
        Dashboard
      {/if}
    </h1>
    <div class="flex items-center gap-4 mt-2">
      <p class="text-muted-foreground">Here's what's happening with your projects.</p>
      {#if access?.userAccess}
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-green-500"></div>
          <span class="text-xs text-muted-foreground capitalize">{access.userAccess.tier} plan</span>
          {#if access.userAccess.trialActive}
            <span class="text-xs text-amber-600">• {access.userAccess.trialDaysLeft} days left</span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Stats Cards Row -->
  <StatsCards {stats} />
  
  <!-- Projects & Templates Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Projects List - Wider Column -->
    <div class="md:col-span-2">
      <ProjectsList projects={recentProjects} />
    </div>
    
    <!-- Recent Templates - Sidebar -->
    <div class="md:col-span-1">
      {#if recentTemplates.length > 0}
        <RecentTemplates templates={recentTemplates} />
      {:else}
        <!-- Empty state -->
        <div class="bg-card rounded-lg border p-6 text-center">
          <h3 class="font-medium mb-2">Templates</h3>
          <p class="text-sm text-muted-foreground mb-4">No templates available yet</p>
          <p class="text-xs text-amber-600">Store coming soon</p>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Template Grid - Hidden during review -->
  <!-- <div class="mt-8">
    <TemplateGrid />
  </div> -->
  
  <!-- Coming Soon Section -->
  <div class="mt-8">
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100">
            More Features Coming Soon
          </h3>
          <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Template store, advanced project management, team collaboration, and more.
          </p>
        </div>
        <div class="hidden sm:block text-4xl opacity-50">
          🚀
        </div>
      </div>
    </div>
  </div>
</div>