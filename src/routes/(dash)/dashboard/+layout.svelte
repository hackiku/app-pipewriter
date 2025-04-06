<!-- src/routes/(dash)/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { getUser } from '$lib/services/firebase/auth.svelte';
  import { fade } from 'svelte/transition';
  
  // Sidebar navigation items
  const sidebarItems = [
    { 
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'Home'
    },
    { 
      title: 'Projects',
      href: '/dashboard/projects',
      icon: 'FolderOpen'
    },
    { 
      title: 'Templates',
      href: '/dashboard/templates',
      icon: 'LayoutTemplate'
    },
    { 
      title: 'Settings',
      href: '/dashboard/settings',
      icon: 'Settings'
    }
  ];
  
  // Determine if sidebar should be shown (based on user authentication)
  let showSidebar = $state(true);
  
  $effect(() => {
    // You can implement logic here to determine when to show/hide the sidebar
    // For example, only show it on certain routes or when the user is logged in
    showSidebar = !!getUser();
  });
</script>

<div class="flex min-h-screen flex-col">
  <!-- Main Content -->
  <div class="flex-1 flex">
    <!-- Page Content -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</div>