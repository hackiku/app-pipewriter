<!-- $lib/features/addon/layout/user/ProfileCard.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { X, Mail, LogOut, CheckCircle, Clock, Crown } from "@lucide/svelte";
  import { getUser, signIn, signOut } from '$lib/services/firebase/auth.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  import UpgradeDrawer from '$lib/features/pricing/UpgradeDrawer.svelte';
  
  // Props
  const props = $props<{
    showProfileCard: boolean;
    onToggleProfileCard: () => void;
  }>();
  
  // State
  let isLoggingOut = $state(false);
  let isSigningIn = $state(false);
  let showUpgradeDrawer = $state(false);
  
  // Get trial features context
  const trialFeatures = useTrialFeatures();
  
  // Get subscription status info using functions instead of $derived
  function getSubscriptionStatus() {
    if (trialFeatures.trialInfo.isPremium) return "Premium";
    if (trialFeatures.trialInfo.active) return "Trial";
    return "Free";
  }
  
  function isActive() {
    return trialFeatures.trialInfo.active;
  }
  
  function isPremium() {
    return trialFeatures.trialInfo.isPremium;
  }
  
  function getDaysLeft() {
    return trialFeatures.trialInfo.daysLeft;
  }
  
  // Generate initials for avatar
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
  
  function openUpgradeDrawer() {
    showUpgradeDrawer = true;
    // Close the profile card when opening the upgrade drawer
    props.onToggleProfileCard();
  }
  
  function handleOpenChange(open: boolean) {
    showUpgradeDrawer = open;
  }
</script>

<!-- Upgrade Drawer -->
<UpgradeDrawer isOpen={showUpgradeDrawer} onOpenChange={handleOpenChange} />

{#if props.showProfileCard}
  <div 
    class="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
    onclick={closeCard}
    onkeydown={(e) => e.key === "Escape" && closeCard()}
    role="dialog"
    aria-modal="true"
  >
    <!-- Profile Card content -->
    <div
      class="fixed right-2 top-16 w-80 max-w-[90vw]"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
      onclick={stopPropagation}
    >
      <Card.Root class="border-border">
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
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Avatar.Root class="h-10 w-10">
                  {#if getUser().photoURL}
                    <Avatar.Image 
                      src={getUser().photoURL} 
                      alt={getUser().displayName || 'User'} 
                    />
                  {/if}
                  <Avatar.Fallback class="bg-primary/10 text-primary">
                    {getInitials()}
                  </Avatar.Fallback>
                </Avatar.Root>
                
                <div class="overflow-hidden">
                  <div class="font-medium truncate">{getUser().displayName || 'User'}</div>
                  {#if getUser().email}
                    <div class="text-xs text-muted-foreground flex items-center">
                      <Mail class="h-3 w-3 mr-1 flex-shrink-0" />
                      <span class="truncate">{getUser().email}</span>
                    </div>
                  {/if}
                </div>
              </div>
              
              <!-- Subscription Information -->
              <div class="p-3 rounded-md border">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-sm font-medium">Subscription</h3>
                  
                  {#if isPremium()}
                    <div class="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex items-center">
                      <Crown class="h-3 w-3 mr-1" />
                      Premium
                    </div>
                  {:else if isActive()}
                    <div class="text-xs font-medium bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center">
                      <Clock class="h-3 w-3 mr-1" />
                      Trial
                    </div>
                  {:else}
                    <div class="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      Free
                    </div>
                  {/if}
                </div>
                
                <div class="space-y-3">
                  {#if isPremium()}
                    <div class="flex items-center text-sm gap-2">
                      <CheckCircle class="h-4 w-4 text-primary shrink-0" />
                      <span class="text-xs">All premium features</span>
                    </div>
                    <div class="flex items-center text-sm gap-2">
                      <CheckCircle class="h-4 w-4 text-primary shrink-0" />
                      <span class="text-xs">Premium elements</span>
                    </div>
                    <div class="flex items-center text-sm gap-2">
                      <CheckCircle class="h-4 w-4 text-primary shrink-0" />
                      <span class="text-xs">Color customization</span>
                    </div>
                  {:else if isActive()}
                    <p class="text-xs text-muted-foreground">
                      Trial active: <span class="font-medium text-foreground">{getDaysLeft()} {getDaysLeft() === 1 ? 'day' : 'days'}</span> remaining
                    </p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      class="w-full mt-2 text-xs h-8" 
                      onclick={openUpgradeDrawer}
                    >
                      Upgrade to Premium
                    </Button>
                  {:else}
                    <p class="text-xs text-muted-foreground">
                      Your trial has ended. Upgrade to access premium features.
                    </p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      class="w-full mt-2 text-xs h-8" 
                      onclick={openUpgradeDrawer}
                    >
                      Upgrade to Premium
                    </Button>
                  {/if}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                class="w-full text-destructive hover:bg-destructive/10"
                onclick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut class="h-4 w-4 mr-2" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          {:else}
            <div class="space-y-3 mb-4">
              <div class="p-3 bg-muted/50 rounded-md text-center">
                <p class="text-sm text-muted-foreground">Sign in to access your account</p>
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
        
        <Card.Footer class="text-center border-t pt-2">
          <p class="text-xs text-muted-foreground">
            Pipewriter v1.0.0
          </p>
        </Card.Footer>
      </Card.Root>
    </div>
  </div>
{/if}