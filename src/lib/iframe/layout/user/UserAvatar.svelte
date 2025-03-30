<!-- $lib/iframe/layout/user/UserAvatar.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import ProfileCard from './ProfileCard.svelte';
  import { UserCircle } from 'lucide-svelte';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { getUser, signIn, signOut } from '$lib/services/firebase/auth.svelte';
  
  // Local state
  let showProfile = $state(false);
  
  // Props
  const props = $props<{
    size?: 'sm' | 'md' | 'lg';
  }>();
  
  // Computed size properties
  let dimensions = $derived(() => {
    switch (props.size || 'md') {
      case 'sm': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      default: return 'w-10 h-10';
    }
  });
  
  function toggleProfile() {
    showProfile = !showProfile;
  }
  
  // Compute initials for the avatar
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
  
  let avatarSrc = $derived(() => getUser()?.photoURL || '');
  
  // Handle sign in button click
  async function handleSignIn() {
    try {
      await signIn();
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  }
</script>

<div class="relative">
  <button 
    class="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    onclick={toggleProfile}
  >
    {#if getUser()}
      <Avatar.Root class={dimensions}>
        {#if avatarSrc}
          <Avatar.Image src={avatarSrc} alt={getUser()?.displayName || 'User'} />
        {:else}
          <Avatar.Fallback class="bg-primary/10 text-primary">
            {initials}
          </Avatar.Fallback>
        {/if}
      </Avatar.Root>
    {:else}
      <Avatar.Root class={dimensions}>
        <Avatar.Fallback class="bg-gray-100 dark:bg-gray-800">
          <UserCircle class="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Avatar.Fallback>
      </Avatar.Root>
    {/if}
  </button>
  
  {#if !getUser() && !showProfile}
    <button 
      class="absolute -bottom-6 text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
      onclick={handleSignIn}
    >
      Sign In
    </button>
  {/if}
  
  {#if showProfile}
    <ProfileCard 
      showProfileCard={showProfile} 
      onToggleProfileCard={toggleProfile} 
    />
  {/if}
</div>