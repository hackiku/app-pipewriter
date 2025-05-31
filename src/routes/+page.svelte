<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import ModeToggle from "$lib/components/ui/mode-toggle.svelte";
  import { signIn } from '$lib/services/auth';
  import { ArrowRight } from 'lucide-svelte';

  // Get server data to check if user is already logged in
  const { data } = $props();

  // If user is already authenticated (server knows), show different content
  const isAuthenticated = data?.user != null;

  // Local state
  let isSigningIn = $state(false);
  let showTutorial = $state(true);
  let authError = $state<string | null>(null);

  async function handleGoogleSignIn() {
    if (isSigningIn) return;
    
    isSigningIn = true;
    authError = null;
    
    try {
      // Save tutorial preference
      localStorage.setItem('pipewriter-show-tutorial', showTutorial.toString());
      
      // Simple sign in - will reload page on success
      await signIn();
      
    } catch (error) {
      console.error('Sign in error:', error);
      authError = error instanceof Error ? error.message : 'Sign in failed';
    } finally {
      isSigningIn = false;
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
          
          <Button class="w-full h-11" onclick={goToApp}>
            <span>Open Pipewriter</span>
            <ArrowRight class="h-4 w-4 ml-2" />
          </Button>
        </div>
        
      {:else}
        <!-- User needs to sign in -->
        
        <!-- Auth Error -->
        {#if authError}
          <div class="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-md border border-destructive/20">
            {authError}
          </div>
        {/if}

        <!-- Google Sign In Button -->
        <Button 
          class="w-full h-11 text-sm sm:text-base"
          onclick={handleGoogleSignIn}
          disabled={isSigningIn}
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

        <!-- Tutorial Checkbox -->
        <div class="flex items-start space-x-3">
          <Checkbox 
            id="show-tutorial" 
            bind:checked={showTutorial}
            class="mt-0.5"
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