<!-- src/lib/features/dashboard/layout/Sidebar.svelte -->
<script lang="ts">
  import { Home, LayoutTemplate, FileText, Settings, HelpCircle, PenLine } from 'lucide-svelte';
  import { page } from '$app/stores';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import { cn } from '$lib/utils';
  
  // Props
  const props = $props<{
    isCollapsed: boolean;
  }>();
  
  // Navigation items
  const navItems = [
    { 
      href: '/dashboard', 
      icon: Home, 
      text: 'Dashboard'
    },
    { 
      href: '/dashboard/projects', 
      icon: FileText, 
      text: 'Projects'
    },
    { 
      href: '/dashboard/templates', 
      icon: LayoutTemplate, 
      text: 'Templates'
    },
    { 
      href: '/dashboard/editor', 
      icon: PenLine, 
      text: 'Editor'
    }
  ];
  
  // Footer items (always at bottom)
  const footerItems = [
    { 
      href: '/dashboard/settings', 
      icon: Settings, 
      text: 'Settings'
    },
    { 
      href: '/dashboard/help', 
      icon: HelpCircle, 
      text: 'Help & Support'
    }
  ];
  
  // Check if a link is active
  function isActive(href: string) {
    return $page.url.pathname === href;
  }
</script>

<div 
  class={cn(
    "flex h-full flex-col px-2 py-4 transition-all duration-300",
    props.isCollapsed ? "items-center" : "px-3"
  )}
>
  <!-- Logo space if needed -->
  <div class={cn("mb-8", props.isCollapsed ? "h-6 w-6" : "px-2")}>
    <!-- Logo can go here if needed -->
  </div>

  <!-- Main Navigation -->
  <Tooltip.Provider delayDuration={0}>
    <nav class="space-y-1">
      {#each navItems as item}
        {#if props.isCollapsed}
          <Tooltip.Root>
            <Tooltip.Trigger asChild let:builder>
              <a
                href={item.href}
                class={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                  isActive(item.href) 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                builders={[builder]}
              >
                <svelte:component this={item.icon} class="h-5 w-5" />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content side="right">
              {item.text}
            </Tooltip.Content>
          </Tooltip.Root>
        {:else}
          <a
            href={item.href}
            class={cn(
              "flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive(item.href) 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <svelte:component this={item.icon} class="h-5 w-5" />
            <span>{item.text}</span>
          </a>
        {/if}
      {/each}
    </nav>

    <!-- Footer Navigation - push to bottom -->
    <div class="mt-auto pt-8 space-y-1">
      {#each footerItems as item}
        {#if props.isCollapsed}
          <Tooltip.Root>
            <Tooltip.Trigger asChild let:builder>
              <a
                href={item.href}
                class={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                  isActive(item.href) 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                builders={[builder]}
              >
                <svelte:component this={item.icon} class="h-5 w-5" />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content side="right">
              {item.text}
            </Tooltip.Content>
          </Tooltip.Root>
        {:else}
          <a
            href={item.href}
            class={cn(
              "flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive(item.href) 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <svelte:component this={item.icon} class="h-5 w-5" />
            <span>{item.text}</span>
          </a>
        {/if}
      {/each}
    </div>
  </Tooltip.Provider>
</div>