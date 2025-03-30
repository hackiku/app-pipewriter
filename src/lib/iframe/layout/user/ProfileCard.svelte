<!-- $lib/iframe/layout/user/ProfileCard.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { X, Mail, User, LogOut, Settings } from "lucide-svelte";
  import { getUser, signOut } from '$lib/services/firebase/auth.svelte';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  
  // Props
  const props = $props<{
    showProfileCard: boolean;
    onToggleProfileCard: () => void;
  }>();
  
  // State
  let isLoggingOut = $state(false);
  
  function closeCard() {
    props.onToggleProfileCard();
  }
  
  async function handleLogout() {
    isLoggingOut = true;
    try {
      await signOut();
      closeCard();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      isLoggingOut = false;
    }
  }
  
  // Computed user data
  let displayName = $derived(() => getUser()?.displayName || 'Unnamed Writer');
  let email = $derived(() => getUser()?.email || '');
  let avatarSrc = $derived(() => getUser()?.photoURL || '');
  
  // Calculate initials for avatar fallback
  let initials = $derived(() => {
    const user = getUser();
    if (!user) return '';
    
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return '';
  });
</script>

{#if props.showProfileCard}
  <div
    role="button"
    tabindex="0"
    class="fixed inset-0 z-[100] bg-gray-900/80 dark:bg-gray-950/80 h-screen"
    onclick={closeCard}
    onkeydown={(e) => e.key === "Escape" && closeCard()}
  >
    <!-- Profile Card content -->
    <div
      class="fixed right-2 top-16 w-80 max-w-[90vw]"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
    >
      <!-- Card container -->
      <div
        role="button"
        class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        onclick={(e) => e.stopPropagation()}
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold">Your Profile</h3>
          <button
            class="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onclick={closeCard}
          >
            <X class="h-4 w-4 mx-auto" />
          </button>
        </div>
        
        {#if getUser()}
          <!-- User Info -->
          <div class="flex items-center space-x-3 mb-6">
            <Avatar.Root class="w-16 h-16">
              {#if avatarSrc}
                <Avatar.Image src={avatarSrc} alt={displayName} />
              {/if}
              <Avatar.Fallback class="bg-primary/10 text-primary text-xl">
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>
            
            <div>
              <div class="text-lg font-medium">{displayName}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Mail class="h-3 w-3 mr-1" />
                {email}
              </div>
            </div>
          </div>
          
          <!-- Menu Items -->
          <div class="space-y-1">
            <button 
              class="w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center text-sm"
            >
              <User class="h-4 w-4 mr-2" />
              Edit Profile
            </button>
            
            <button 
              class="w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center text-sm"
            >
              <Settings class="h-4 w-4 mr-2" />
              Settings
            </button>
            
            <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
            
            <button 
              class="w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 transition-colors flex items-center text-sm"
              onclick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut class="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Sign Out'}
            </button>
          </div>
        {:else}
          <!-- Not signed in state -->
          <div class="py-4 text-center">
            <p class="mb-4">You're not signed in.</p>
            <button
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onclick={() => {
                import('$lib/services/firebase/auth.svelte').then(({ signIn }) => {
                  signIn().catch(err => console.error("Sign in error:", err));
                });
              }}
            >
              Sign In
            </button>
          </div>
        {/if}
        
        <!-- App Version -->
        <div class="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          Pipewriter v1.0.0
        </div>
      </div>
    </div>
  </div>
{/if}