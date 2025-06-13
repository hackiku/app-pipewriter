<!-- $lib/features/addon/layout/BottomBar.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
	import { ExternalLink, HelpCircle, ChevronDown, Crown } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import AppAbout from './AppAbout.svelte';
  import UserAvatar from '$lib/components/user/UserAvatar.svelte';
  import UpgradeDrawer from '$lib/components/pricing/UpgradeDrawer.svelte';
  import { docLinks, DRIVE_FOLDER_URL } from '$lib/data/addon/templateDocs';
  

  // Props instead of context - same functionality
  const props = $props<{
    onToggleAboutModal: () => void;
    user: any;
    isPro: boolean;
    trialActive: boolean;
    trialDaysLeft: number;
    onSignOut: () => Promise<void>;
  }>();
  
  // State variables - same as before
  let showAboutModal = $state(false);
  let dropdownOpen = $state(false);
  let showUpgradeDrawer = $state(false);
  
  function openUrl(url: string) {
    window.open(url, '_blank');
  }

  function toggleAboutModal() {
    showAboutModal = !showAboutModal;
    if (typeof props.onToggleAboutModal === 'function') {
      props.onToggleAboutModal();
    }
  }
  
  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }
  
  function openUpgradeFlow() {
    showUpgradeDrawer = true;
  }
  
  function handleUpgradeDrawerChange(open: boolean) {
    showUpgradeDrawer = open;
  }
  
  // Same logic, just using props instead of context
  function isPro() {
    return props.isPro;
  }
  
  function isActive() {
    return props.trialActive;
  }
</script>

<div class="w-full pr-5 h-12 flex items-center justify-between">
  <!-- Docs Dropdown - same as before -->
  <div class="relative">
    <Button
      variant="outline"
      size="sm"
      class="h-8 flex items-center gap-1"
      onclick={toggleDropdown}
    >
      Docs
      <ChevronDown class="h-4 w-4 transition-transform {dropdownOpen ? 'rotate-180' : ''}" />
    </Button>

    {#if dropdownOpen}
      <div 
        class="absolute bottom-full mb-1 w-64 rounded-md border border-neutral-200 
               dark:border-neutral-700 bg-card text-card-foreground shadow-lg z-50"
        transition:fade={{ duration: 150 }}
      >
        <div class="py-1 px-2 text-xs font-medium text-muted-foreground">
          Templates
        </div>
        
        <div class="border-t border-neutral-200 dark:border-neutral-700"></div>
        
        <div class="py-1">
          {#each docLinks as link}
            <button 
              class="w-full text-sm text-left px-2 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm"
              onclick={() => openUrl(link.url)}
            >
              <div class="flex items-start gap-2">
                <img class="h-4 w-4 mt-1" src="/icons/gdocs-square.svg" alt="Google Docs icon"/>
                <div class="flex flex-col">
                  <span>{link.title}</span>
                  <span class="text-xs text-muted-foreground">{link.desc}</span>
                </div>
              </div>
            </button>
          {/each}
        </div>
        
        <div class="border-t border-neutral-200 dark:border-neutral-700"></div>
        
        <button 
          class="w-full text-left px-2 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm"
          onclick={() => openUrl(DRIVE_FOLDER_URL)}
        >
          <div class="flex items-center gap-2">
            <img class="h-4 w-4" src="/icons/google-drive.svg" alt="Google Drive icon"/>
            <span>Drive Folder</span>
            <ExternalLink class="h-4 w-4 ml-auto" />
          </div>
        </button>
      </div>
    {/if}
  </div>

  <!-- Right side: Upgrade Button and User Avatar - same as before -->
  <div class="flex items-center gap-2 mr-2">
    <!-- Round Upgrade Button - same styling -->
    <!-- <Button
      variant={isPro() ? "default" : "outline"}
      size="icon"
      class="h-6 w-6 rounded-full flex items-center justify-center
        {isPro() 
          ? 'bg-primary text-primary-foreground' 
          : isActive() 
            ? 'border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950' 
            : 'border-muted-foreground/60 hover:bg-muted'
        }"
      onclick={openUpgradeFlow}
      title={isPro() ? 'Manage Subscription' : 'Upgrade to Pro'}
    >
      <Crown class="h-3 w-4" />
    </Button> -->

    <!-- User Avatar with props -->
    <UserAvatar 
      user={props.user}
      isPro={props.isPro}
      trialActive={props.trialActive}
      trialDaysLeft={props.trialDaysLeft}
      onSignOut={props.onSignOut}
    />
  </div>
  
  <!-- Upgrade Drawer - same as before -->
  <UpgradeDrawer isOpen={showUpgradeDrawer} onOpenChange={handleUpgradeDrawerChange} />

  <!-- About Modal - same as before -->
  <AppAbout 
    showAboutModal={showAboutModal}
    onToggleAboutModal={toggleAboutModal}
  />
</div>