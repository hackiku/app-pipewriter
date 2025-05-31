<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import ModeToggle from "$lib/components/ui/mode-toggle.svelte";
  import { signIn, switchAccount } from '$lib/services/auth';
  import { ArrowRight, RefreshCw } from 'lucide-svelte';

  // Get server data
  const { data } = $props();
  const isAuthenticated = data?.user != null;

  // Local state
  let isSigningIn = $state(false);
  let isSwitching = $state(false);
  let showTutorial = $state(true);
  let authError = $state<string | null>(null);

  async function handleGoogleSignIn() {
    if (isSigningIn || isSwitching) return;
    
    isSigningIn = true;
    authError = null;
    
    try {
      localStorage.setItem('pipewriter-show-tutorial', showTutorial.toString());
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
      authError = error instanceof Error ? error.message : 'Sign in failed';
    } finally {
      isSigningIn = false;
    }
  }
  
  async function handleSwitchAccount() {
    if (isSigningIn || isSwitching) return;
    
    isSwitching = true;
    authError = null;
    
    try {
      localStorage.setItem('pipewriter-show-tutorial', showTutorial.toString());
      await switchAccount();
    } catch (error) {
      console.error('Account switch error:', error);
      authError = error instanceof Error ? error.message : 'Account switch failed';
    } finally {
      isSwitching = false;
    }
  }

  function goToApp() {
    window.location.href = '/addon';
  }
</script>

<div class="min-h-screen bg-background relative">
  <!-- Fixed Mode Toggle -->
  <div class="fixed top-4 right-4 z-10">
    <ModeToggle />
  </div>

  <!-- Main Content -->
  <div class="flex flex-col items-center pt-24 pb-16 px-6 min-h-screen">
    <div class="w-full max-w-xs sm:max-w-sm space-y-8">
      
      <!-- Headlines -->
      <div class="text-center space-y-4">
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome to Pipewriter
        </h1>
        <p class="text-muted-foreground text-sm sm:text-base">
          Beautiful content elements for Google Docs
        </p>
      </div>

      {#if isAuthenticated}
        <!-- User is already logged in -->
        <div class="text-center space-y-4">
          <div class="p-4 bg-primary/10 text-primary rounded-lg">
            ✅ You're signed in as {data.user.email}
          </div>
          
          <div class="space-y-3">
            <Button class="w-full h-11" onclick={goToApp}>
              <span>Open Pipewriter</span>
              <ArrowRight class="h-4 w-4 ml-2" />
            </Button>
            
            <!-- Always show account switch option -->
            <Button 
              variant="outline" 
              class="w-full h-9 text-sm"
              onclick={handleSwitchAccount}
              disabled={isSwitching}
            >
              {#if isSwitching}
                <div class="h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin mr-2"></div>
                Switching account...
              {:else}
                <RefreshCw class="h-3 w-3 mr-2" />
                Use different account
              {/if}
            </Button>
          </div>
        </div>
        
      {:else}
        <!-- User needs to sign in -->
        
        <!-- Auth Error -->
        {#if authError}
          <div class="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-md border border-destructive/20">
            {authError}
          </div>
        {/if}

        <div class="space-y-3">
          <!-- Primary Google Sign In Button -->
          <Button 
            class="w-full h-11 text-sm sm:text-base"
            onclick={handleGoogleSignIn}
            disabled={isSigningIn || isSwitching}
          >
            {#if isSigningIn}
              <div class="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2 flex-shrink-0"></div>
              <span class="truncate">Signing in...</span>
            {:else}
              <img 
                src="/logos/google.svg" 
                alt="Google" 
                class="h-4 w-4 mr-2 flex-shrink-0"
              />
              <span class="truncate">Sign in with Google</span>
              <ArrowRight class="h-4 w-4 ml-2 flex-shrink-0 hidden xs:block" />
            {/if}
          </Button>
          
          <!-- Account Picker Button -->
          <Button 
            variant="outline"
            class="w-full h-9 text-sm"
            onclick={handleSwitchAccount}
            disabled={isSigningIn || isSwitching}
          >
            {#if isSwitching}
              <div class="h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin mr-2"></div>
              Choosing account...
            {:else}
              <RefreshCw class="h-3 w-3 mr-2" />
              Choose account
            {/if}
          </Button>
        </div>

        <!-- Tutorial Checkbox -->
        <div class="flex items-start space-x-3">
          <Checkbox 
            id="show-tutorial" 
            bind:checked={showTutorial}
            class="mt-0.5"
            disabled={isSigningIn || isSwitching}
          />
          <label 
            for="show-tutorial" 
            class="text-sm leading-relaxed cursor-pointer flex-1"
          >
            Show tutorial when opening app
          </label>
        </div>
      {/if}
    </div>

    <!-- Bottom tagline -->
    <div class="mt-auto pt-8 text-center">
      <p class="text-sm text-muted-foreground">
        Prototypes start with words
      </p>
    </div>
  </div>
</div>

<style>
  @media (min-width: 475px) {
    .xs\:block {
      display: block;
    }
  }
</style>