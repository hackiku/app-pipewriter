<!-- src/lib/components/user/UserAvatar.svelte -->
<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import ProfileCard from './ProfileCard.svelte';

  // Simple props - no contexts
  const props = $props<{
    user: {
      uid: string;
      email: string;
      displayName?: string;
      photoURL?: string;
    };
    isPro: boolean;
    trialActive: boolean;
    trialDaysLeft: number;
    onSignOut: () => Promise<void>;
  }>();

  // Local state
  let showProfile = $state(false);

  // Get subscription status
  function getSubscriptionStatus() {
    if (props.isPro) return "Pro";
    if (props.trialActive) return "Trial";
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
    if (props.user.displayName) {
      return props.user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    if (props.user.email) {
      return props.user.email[0].toUpperCase();
    }

    return 'U';
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
      {#if props.user.photoURL}
        <Avatar.Image 
          src={props.user.photoURL} 
          alt="User avatar" 
        />
      {/if}
      <Avatar.Fallback class="bg-neutral-300 text-sm dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium">
        {getInitials()}
      </Avatar.Fallback>
    </Avatar.Root>
    
    <!-- Status Badge -->
    <div class="absolute -top-2 -right-3 rounded-md text-[0.5rem] font-bold px-1 min-w-5 h-5 flex items-center justify-center {getBadgeColor()} shadow-sm">
      {getSubscriptionStatus()}
    </div>
  </button>
  
  {#if showProfile}
    <ProfileCard 
      showProfileCard={showProfile} 
      onToggleProfileCard={toggleProfile}
      user={props.user}
      isPro={props.isPro}
      trialActive={props.trialActive}
      trialDaysLeft={props.trialDaysLeft}
      onSignOut={props.onSignOut}
    />
  {/if}
</div>