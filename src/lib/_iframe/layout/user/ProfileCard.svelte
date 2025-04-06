<!-- $lib/iframe/layout/user/ProfileCard.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { X, Mail, LogOut } from "lucide-svelte";
  import { getUser, signIn, signOut } from '$lib/services/firebase/auth.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  
  // Props
  const props = $props<{
    showProfileCard: boolean;
    onToggleProfileCard: () => void;
  }>();
  
  // State
  let isLoggingOut = $state(false);
  let isSigningIn = $state(false);
  
  function closeCard() {
    props.onToggleProfileCard();
  }
  
  async function handleLogin() {
    isSigningIn = true;
    try {
      await signIn();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      isSigningIn = false;
    }
  }
  
  async function handleLogout() {
    isLoggingOut = true;
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      isLoggingOut = false;
    }
  }
  
  function stopPropagation(event) {
    event.stopPropagation();
  }
</script>

{#if props.showProfileCard}
  <div 
    class="fixed inset-0 z-[100] bg-neutral-900/80 dark:bg-neutral-950/80 h-screen"
    onclick={closeCard}
    onkeydown={(e) => e.key === "Escape" && closeCard()}
  >
    <!-- Profile Card content -->
    <div
      class="fixed right-2 top-16 w-80 max-w-[90vw]"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
      onclick={stopPropagation}
    >
      <Card.Root>
        <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title>Profile</Card.Title>
          <Button 
            variant="ghost" 
            size="icon" 
            onclick={closeCard}
            aria-label="Close profile"
          >
            <X class="h-4 w-4" />
          </Button>
        </Card.Header>
        
        <Card.Content>
          <!-- User info -->
          {#if getUser()}
            <div class="space-y-3 mb-4">
              <div class="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">
                {#if getUser().photoURL}
                  <img src={getUser().photoURL} alt="" class="w-10 h-10 rounded-full" />
                {/if}
                <div class="overflow-hidden">
                  <div class="font-medium truncate">{getUser().displayName || 'User'}</div>
                  {#if getUser().email}
                    <div class="text-xs text-neutral-500 dark:text-neutral-400 flex items-center">
                      <Mail class="h-3 w-3 mr-1 flex-shrink-0" />
                      <span class="truncate">{getUser().email}</span>
                    </div>
                  {/if}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                class="w-full text-red-500"
                onclick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut class="h-4 w-4 mr-2" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          {:else}
            <div class="space-y-3 mb-4">
              <div class="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md text-center">
                <p class="text-sm text-neutral-600 dark:text-neutral-400">Sign in to access your account</p>
              </div>
              
              <Button 
                variant="default"
                class="w-full"
                onclick={handleLogin}
                disabled={isSigningIn}
              >
                {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
              </Button>
            </div>
          {/if}
        </Card.Content>
        
        <Card.Footer class="text-center border-t border-neutral-200 dark:border-neutral-800 pt-2">
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            Pipewriter v1.0.0
          </p>
        </Card.Footer>
      </Card.Root>
    </div>
  </div>
{/if}