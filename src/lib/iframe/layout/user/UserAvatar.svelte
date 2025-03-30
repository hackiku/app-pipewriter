<!-- $lib/iframe/layout/user/UserAvatar.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import ProfileCard from './ProfileCard.svelte';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { UserCircle } from 'lucide-svelte';
  import { user } from '$lib/services/firebase/auth';
  
  // State
  let showProfile = $state(false);
  
  // Props
  const props = $props<{
    size?: 'sm' | 'md' | 'lg';
    onToggleProfile?: () => void;
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
    if (typeof props.onToggleProfile === 'function') {
      props.onToggleProfile();
    }
  }
  
  // Compute initials from user's display name or email
  let initials = $derived(() => {
    if (!$user) return '';
    
    if ($user.displayName) {
      return $user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    if ($user.email) {
      return $user.email[0].toUpperCase();
    }
    
    return '';
  });
  
  // Determine if we should show the image or fallback
  let avatarSrc = $derived(() => $user?.photoURL || '');
</script>

<div class="relative">
  <button 
    class="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
    onclick={toggleProfile}
  >
    {#if $user}
      <Avatar.Root class={dimensions}>
        {#if avatarSrc}
          <Avatar.Image src={avatarSrc} alt={$user.displayName || 'User profile'} />
        {/if}
        <Avatar.Fallback class="bg-primary/10 text-primary">
          initials || <UserCircle class="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Avatar.Fallback>
      </Avatar.Root>
    {:else}
      <Avatar.Root class={dimensions}>
        <Avatar.Fallback class="bg-gray-100 dark:bg-gray-800">
          <UserCircle class="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Avatar.Fallback>
      </Avatar.Root>
    {/if}
  </button>
  
  {#if showProfile}
    <div in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}>
      <ProfileCard showProfileCard={showProfile} onToggleProfileCard={toggleProfile} />
    </div>
  {/if}
</div>