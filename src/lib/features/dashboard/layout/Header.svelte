<!-- src/lib/features/dashboard/layout/Header.svelte - Robust user detection -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { signOut } from '$lib/services/auth';
  import { Moon, Sun, PenTool } from 'lucide-svelte';
  import { toggleMode } from 'mode-watcher';
  
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from '$lib/components/ui/avatar';

  // Get data from layout context with fallbacks
  const dashboardData = getContext('dashboardData');
  const access = getContext('access');
  
  // ROBUST: Get user from multiple sources
  const user = $derived(() => {
    // Try context first
    if (dashboardData?.user) return dashboardData.user;
    
    // Fallback: this shouldn't happen in dashboard since layout.server.ts loads user
    return null;
  });
  
  const userAccess = $derived(() => access?.userAccess);
  
  // State
  let isDarkMode = $state(false);
  let isSigningOut = $state(false);
  let showUserMenu = $state(false);
  
  // Functions
  function handleToggleMode() {
    isDarkMode = !isDarkMode;
    toggleMode();
  }
  
  async function handleLogout() {
    if (isSigningOut) return;
    
    try {
      isSigningOut = true;
      showUserMenu = false;
      await signOut();
      // Auth service handles navigation
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      isSigningOut = false;
    }
  }
  
  // Generate user initials
  function getUserInitials() {
    const currentUser = user();
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  }
  
  // Close menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (showUserMenu && !event.target?.closest?.('.user-menu')) {
      showUserMenu = false;
    }
  }
  
  // Add click outside listener
  $effect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
  
  // Debug logging
  $effect(() => {
    console.log('[HEADER] User state:', {
      hasUser: !!user(),
      email: user()?.email,
      hasAccess: !!userAccess(),
      tier: userAccess()?.tier
    });
  });
</script>

<header class="border-b w-full bg-background">
  <div class="h-16 px-6 flex items-center justify-between">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <PenTool class="h-6 w-6 text-primary" />
      <span class="font-bold text-xl hidden md:inline">Pipewriter</span>
    </div>
    
    <!-- Actions Area -->
    <div class="flex items-center gap-2">
      <!-- Theme Toggle -->
      <Button 
        variant="ghost" 
        size="icon" 
        aria-label="Toggle theme"
        class="rounded-full"
        onclick={handleToggleMode}
      >
        {#if isDarkMode}
          <Sun class="h-5 w-5" />
        {:else}
          <Moon class="h-5 w-5" />
        {/if}
      </Button>
      
      <!-- User Menu - ROBUST: Always show if we have user data -->
      {#if user()}
        <div class="relative user-menu">
          <Button 
            variant="ghost" 
            class="relative h-8 w-8 rounded-full"
            onclick={() => showUserMenu = !showUserMenu}
          >
            <Avatar.Root class="h-8 w-8">
              {#if user().photoURL}
                <Avatar.Image src={user().photoURL} alt={user().displayName || 'User'} />
              {:else}
                <Avatar.Fallback>{getUserInitials()}</Avatar.Fallback>
              {/if}
            </Avatar.Root>
          </Button>
          
          {#if showUserMenu}
            <div class="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
              <!-- User Info -->
              <div class="px-3 py-2 border-b border-border">
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium leading-none">{user().displayName || 'User'}</p>
                  <p class="text-muted-foreground text-xs leading-none">{user().email}</p>
                  {#if userAccess()}
                    <div class="flex items-center gap-2 mt-1">
                      <div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span class="text-xs text-muted-foreground capitalize">{userAccess().tier} plan</span>
                      {#if userAccess().trialActive}
                        <span class="text-xs text-amber-600">• {userAccess().trialDaysLeft}d left</span>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
              
              <!-- Menu Items -->
              <div class="py-1">
                <a 
                  href="/dashboard" 
                  class="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onclick={() => showUserMenu = false}
                >
                  Dashboard
                </a>
                <a 
                  href="/dashboard/projects" 
                  class="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onclick={() => showUserMenu = false}
                >
                  My Projects
                </a>
                <a 
                  href="/dashboard/store" 
                  class="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onclick={() => showUserMenu = false}
                >
                  Template Store
                </a>
              </div>
              
              <!-- Logout -->
              <div class="border-t border-border py-1">
                <button 
                  class="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                  onclick={handleLogout}
                  disabled={isSigningOut}
                >
                  {#if isSigningOut}
                    <div class="flex items-center">
                      <div class="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing out...
                    </div>
                  {:else}
                    Sign out
                  {/if}
                </button>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- ROBUST: Only show this if we're actually missing user data (shouldn't happen in dashboard) -->
        <div class="text-xs text-muted-foreground">
          Loading...
        </div>
      {/if}
    </div>
  </div>
</header>