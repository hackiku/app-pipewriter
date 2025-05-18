<!-- src/lib/features/dashboard/layout/Header.svelte -->
<script lang="ts">
  import { signIn, signOut, getUser } from '$lib/services/firebase/auth.svelte';
  import { Moon, Sun, PenTool, Menu } from 'lucide-svelte';
  import { toggleMode } from 'mode-watcher';
  
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Avatar from '$lib/components/ui/avatar';
  import { cn } from '$lib/utils';
  
  // State
  let isDarkMode = $state(false);
  let user = $state(getUser());
  
  // Functions
  function handleToggleMode() {
    isDarkMode = !isDarkMode;
    toggleMode();
  }
  
  async function handleLogin() {
    try {
      await signIn();
      user = getUser();
    } catch (error) {
      console.error('Login error:', error);
    }
  }
  
  async function handleLogout() {
    try {
      await signOut();
      user = getUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Update user when auth state changes
  $effect(() => {
    user = getUser();
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
      
      <!-- User Menu -->
      {#if user}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild let:builder>
            <Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
              <Avatar.Root class="h-8 w-8">
                {#if user.photoURL}
                  <Avatar.Image src={user.photoURL} alt={user.displayName || 'User'} />
                {:else}
                  <Avatar.Fallback>{user.displayName?.[0] || user.email?.[0] || 'U'}</Avatar.Fallback>
                {/if}
              </Avatar.Root>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-56" align="end">
            <DropdownMenu.Label class="font-normal">
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                <p class="text-muted-foreground text-xs leading-none">{user.email}</p>
              </div>
            </DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              <DropdownMenu.Item href="/dashboard/profile">Profile</DropdownMenu.Item>
              <DropdownMenu.Item href="/dashboard/projects">My Projects</DropdownMenu.Item>
              <DropdownMenu.Item href="/dashboard/settings">Settings</DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onclick={handleLogout}>Log out</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {:else}
        <Button variant="default" size="sm" onclick={handleLogin}>
          Sign In
        </Button>
      {/if}
    </div>
  </div>
</header>