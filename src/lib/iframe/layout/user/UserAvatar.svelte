<!-- $lib/iframe/layout/user/UserAvatar.svelte -->
<script lang="ts">
  import { browser } from "$app/environment";
  import { getFirebaseService } from "$lib/services/firebase/client";
  import { UserCircle } from 'lucide-svelte';
  
  // Minimal state
  let user = $state(null);
  let isOpen = $state(false);
  
  // Initialize Firebase auth
  if (browser) {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      const { auth } = getFirebaseService();
      onAuthStateChanged(auth, (firebaseUser) => {
        user = firebaseUser;
        console.log("Auth state:", user ? "Signed in" : "Signed out");
      });
    });
  }
  
  // Simple sign in function
  function signIn() {
    if (!browser) return;
    
    import('firebase/auth').then(({ GoogleAuthProvider, signInWithPopup }) => {
      const { auth } = getFirebaseService();
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then(result => console.log("Signed in:", result.user.displayName))
        .catch(error => console.error("Sign in failed:", error.message));
    });
  }
  
  // Simple sign out function
  function signOut() {
    if (!browser) return;
    
    import('firebase/auth').then(({ signOut: firebaseSignOut }) => {
      const { auth } = getFirebaseService();
      firebaseSignOut(auth)
        .then(() => console.log("Signed out"))
        .catch(error => console.error("Sign out failed:", error.message));
    });
  }
  
  // Toggle dropdown
  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="relative">
  <!-- Avatar button -->
  <button 
    class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
    onclick={toggle}
  >
    {#if user?.photoURL}
      <img src={user.photoURL} alt="User" class="w-full h-full rounded-full" />
    {:else}
      <UserCircle class="w-5 h-5 text-gray-500" />
    {/if}
  </button>
  
  <!-- Simple dropdown menu -->
  {#if isOpen}
    <div class="absolute bottom-full mb-2 right-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1">
      {#if user}
        <div class="px-4 py-2 text-sm font-medium border-b border-gray-200 dark:border-gray-700">
          {user.displayName || user.email || 'User'}
        </div>
        <button 
          class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          onclick={signOut}
        >
          Sign Out
        </button>
      {:else}
        <button 
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          onclick={signIn}
        >
          Sign In with Google
        </button>
      {/if}
    </div>
  {/if}
</div>