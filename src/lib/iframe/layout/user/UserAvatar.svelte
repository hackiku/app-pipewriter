<!-- $lib/iframe/layout/user/UserAvatar.svelte -->
<script lang="ts">
  import { UserCircle } from 'lucide-svelte';
  import { getUser, signIn, signOut } from '$lib/services/firebase/auth.svelte';
  
  // Local state
  let isOpen = $state(false);
  
  // Get user from the auth module
  $effect(() => {
    const user = getUser();
    console.log("User in component:", user ? "Signed in" : "Signed out");
  });
  
  // Toggle dropdown
  function toggle() {
    isOpen = !isOpen;
  }
  
  // Handle sign in
  async function handleSignIn() {
    try {
      await signIn();
      isOpen = false;
    } catch (error) {
      console.error("Sign in error in component:", error);
    }
  }
  
  // Handle sign out
  async function handleSignOut() {
    try {
      await signOut();
      isOpen = false;
    } catch (error) {
      console.error("Sign out error in component:", error);
    }
  }
</script>

<div class="relative">
  <!-- Avatar button -->
  <button 
    class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
    onclick={toggle}
  >
    {#if getUser()?.photoURL}
      <img src={getUser().photoURL} alt="User" class="w-full h-full rounded-full" />
    {:else}
      <UserCircle class="w-5 h-5 text-gray-500" />
    {/if}
  </button>
  
  <!-- Simple dropdown menu -->
  {#if isOpen}
    <div class="absolute bottom-full mb-2 right-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1">
      {#if getUser()}
        <div class="px-4 py-2 text-sm font-medium border-b border-gray-200 dark:border-gray-700">
          {getUser().displayName || getUser().email || 'User'}
        </div>
        <button 
          class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          onclick={handleSignOut}
        >
          Sign Out
        </button>
      {:else}
        <button 
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          onclick={handleSignIn}
        >
          Sign In with Google
        </button>
      {/if}
    </div>
  {/if}
</div>