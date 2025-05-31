<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import ModeToggle from "$lib/components/ui/mode-toggle.svelte";
  import { signIn, getError, getUser, isLoading } from '$lib/services/firebase/auth.svelte';
  import { ArrowRight } from 'lucide-svelte';

  // Local state
  let isSigningIn = $state(false);
  let showTutorial = $state(true);
  let mounted = $state(false);

  // Check if user is already authenticated and redirect
  $effect(() => {
    const user = getUser();
    const loading = isLoading();
    
    if (mounted && !loading && user) {
      console.log('User already authenticated, redirecting to addon...');
      goto('/addon');
    }
  });

  onMount(() => {
    mounted = true;
  });

  async function handleGoogleSignIn() {
    isSigningIn = true;
    try {
      await signIn();
      localStorage.setItem('pipewriter-show-tutorial', showTutorial.toString());
      console.log('Sign in successful, tutorial preference saved:', showTutorial);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      isSigningIn = false;
    }
  }

  let authError = $derived(getError());
</script>

<div class="min-h-screen bg-background relative">
  <!-- Fixed Mode Toggle -->
  <div class="fixed top-4 right-4 z-10">
    <ModeToggle />
  </div>

  <!-- Main Content - positioned upper-center -->
  <div class="flex flex-col items-center pt-24 pb-16 px-6 min-h-screen">
    {#if mounted}
      <div class="w-full max-w-xs sm:max-w-sm space-y-8">
        

        <!-- Headlines -->
        <div class="text-center space-y-4">
          <h4 class="text-[0.5em] text-foreground/40">homepage</h4>
					<h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome to Pipewriter
          </h1>
          <p class="text-muted-foreground text-sm sm:text-base">
            Beautiful content elements for Google Docs
          </p>
        </div>

        <!-- Auth Error -->
        {#if authError}
          <div class="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-md border border-destructive/20">
            {authError}
          </div>
        {/if}

        <!-- Google Sign In Button - Responsive for narrow widths -->
        <Button 
          class="w-full h-11 text-sm sm:text-base"
          onclick={handleGoogleSignIn}
          disabled={isSigningIn}
        >
          {#if isSigningIn}
            <div class="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2 flex-shrink-0"></div>
            <span class="truncate">Signing in...</span>
          {:else}
            <!-- Use the proper Google logo -->
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
            class="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
          >
            Show tutorial
          </label>
        </div>

      </div>

      <!-- Bottom tagline -->
      <div class="mt-auto pt-8 text-center">
        <p class="text-sm text-muted-foreground">
          Prototypes start with words
        </p>
      </div>
    {/if}
  </div>
</div>

<!-- Add responsive breakpoint for very small screens -->
<style>
  @media (min-width: 475px) {
    .xs\:block {
      display: block;
    }
  }
</style>