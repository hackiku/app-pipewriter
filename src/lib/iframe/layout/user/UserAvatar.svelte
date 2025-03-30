<!-- $lib/iframe/layout/user/UserAvatar.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import ProfileCard from './ProfileCard.svelte';
  import { UserCircle } from 'lucide-svelte';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { getUser } from '$lib/services/firebase/auth.svelte';
  
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
</script>

<div class="relative">
  <button 
    class="w-9 h-9 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
    onclick={toggleProfile}
    aria-label="Toggle profile menu"
  >
    {#if getUser() && getUser()?.photoURL}
      <img src={getUser().photoURL} alt="User" class="w-full h-full rounded-full" />
    {:else}
      <UserCircle class="w-5 h-5 text-gray-500 dark:text-gray-400" />
    {/if}
  </button>
  
  {#if showProfile}
    <ProfileCard 
      showProfileCard={showProfile} 
      onToggleProfileCard={toggleProfile} 
    />
  {/if}
</div>