<!-- src/lib/components/user/UserAvatar.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import ProfileCard from './ProfileCard.svelte';
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { getUser } from '$lib/services/firebase/auth.svelte';
  
  // Props - allow choosing upgrade component
  const props = $props<{
    upgradeComponent?: 'modal' | 'drawer';
  }>();
  
  // Local state
  let showProfile = $state(false);
  
  // Get trial features to determine subscription status
  const trialFeatures = useTrialFeatures();
  
  // Get subscription status
  function getSubscriptionStatus() {
    if (trialFeatures.trialInfo.isPro) return "Pro";
    if (trialFeatures.trialInfo.active) return "Trial";
    return "Free";
  }
  
  // Badge color based on status
  function getBadgeColor() {
    const status = getSubscriptionStatus();
    switch (status) {
      case "Pro": return "bg-primary text-primary-foreground";
      case "Trial": return "bg-amber-600 text-white";
      default: return "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300";
    }
  }
  
  // Generate initials for fallback
  function getInitials() {
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
  }
  
  function toggleProfile() {
    showProfile = !showProfile;
  }
</script>

<div class="relative">
  <button
    class="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
    onclick={toggleProfile}
    aria-label="Toggle profile menu"
  >
    <Avatar.Root class="h-7 w-7">
      {#if getUser() && getUser()?.photoURL}
        <Avatar.Image 
          src={getUser().photoURL} 
          alt="User avatar" 
        />
      {/if}
      <Avatar.Fallback class="bg-neutral-300 text-sm dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium">
        {getInitials()}
      </Avatar.Fallback>
    </Avatar.Root>
    
    <!-- Status Badge -->
    {#if getUser()}
      <div class="absolute -top-2 -right-3 rounded-md text-[0.5rem] font-bold px-1 min-w-5 h-5 flex items-center justify-center {getBadgeColor()} shadow-sm">
        {getSubscriptionStatus()}
      </div>
    {/if}
  </button>
  
  {#if showProfile}
    <ProfileCard 
      showProfileCard={showProfile} 
      onToggleProfileCard={toggleProfile}
      upgradeComponent={props.upgradeComponent || 'modal'}
    />
  {/if}
</div>