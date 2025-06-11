<!-- src/routes/+page.svelte - Simplified login experience -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import ModeToggle from "$lib/components/ui/mode-toggle.svelte";
  import { signIn, switchAccount } from '$lib/services/auth';
  import { ArrowRight, RefreshCw } from '@lucide/svelte';
  import { onMount } from 'svelte';

  // Get server data
  const { data } = $props();
  const isAuthenticated = data?.user != null;

  // Local state
  let isSigningIn = $state(false);
  let isSwitching = $state(false);
  let authError = $state<string | null>(null);
  let isRedirecting = $state(false);

  // Auto-redirect authenticated users to dashboard
  onMount(() => {
    if (isAuthenticated) {
      isRedirecting = true;
      console.log('[LANDING] Redirecting authenticated user to dashboard');
      window.location.href = '/dashboard';
    }
  });

  async function handleGoogleSignIn() {
    if (isSigningIn || isSwitching) return;
    
    isSigningIn = true;
    authError = null;
    
    try {
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
      await switchAccount();
    } catch (error) {
      console.error('Account switch error:', error);
      authError = error instanceof Error ? error.message : 'Account switch failed';
    } finally {
      isSwitching = false;
    }
  }

  function goToDashboard() {
    window.location.href = '/dashboard';
  }
</script>

<svelte:head>
  <title>Pipewriter - UX Writing App for Google Docs</title>
  <meta name="description" content="Beautiful content elements and AI-powered writing tools for Google Docs. Perfect for UX writers, content strategists, and product teams." />
</svelte:head>

<div class="min-h-screen bg-background relative">
  <!-- Fixed Mode Toggle -->
  <div class="fixed top-4 right-4 z-10">
    <ModeToggle />
  </div>

  <!-- Main Content -->
  <div class="flex flex-col items-center pt-24 pb-16 px-6 min-h-screen">
    <div class="w-full max-w-xs sm:max-w-sm space-y-8">
      
      <!-- Logo and Headlines -->
      <div class="text-center space-y-6">
        <!-- Logo Placeholder -->
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-primary/30"></div>
          </div>
        </div>
        
        <div class="space-y-3">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
            Pipewriter
          </h1>
          <p class="text-muted-foreground text-sm sm:text-base leading-relaxed">
            UX writing tools for Google Docs.<br />
            Content elements, AI assistance, and professional templates.
          </p>
        </div>
      </div>

      {#if isRedirecting}
        <!-- Redirect loading -->
        <div class="text-center space-y-4">
          <div class="p-4 bg-primary/10 text-primary rounded-lg">
            <div class="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin mx-auto mb-2"></div>
            Taking you to your dashboard...
          </div>
        </div>

      {:else if isAuthenticated}
        <!-- User is already logged in -->
        <div class="text-center space-y-4">
          <div class="p-4 bg-primary/10 text-primary rounded-lg">
            ✅ Signed in as {data.user.email}
          </div>
          
          <div class="space-y-3">
            <Button class="w-full h-11" onclick={goToDashboard}>
              <span>Open Dashboard</span>
              <ArrowRight class="h-4 w-4 ml-2 flex-shrink-0 hidden sm:block" />
            </Button>
            
            <!-- Account switch option -->
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

        <div class="space-y-4">
          <!-- Sign In Form -->
          <div class="space-y-3">
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
                <ArrowRight class="h-4 w-4 ml-2 flex-shrink-0 hidden xs-block" />
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
                Switching...
              {:else}
                <RefreshCw class="h-3 w-3 mr-2" />
                Choose account
              {/if}
            </Button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Bottom info -->
    <div class="mt-auto pt-8 text-center space-y-2">
      <p class="text-sm text-muted-foreground">
        Professional writing tools for product teams
      </p>
      <div class="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <a href="https://pipewriter.io/privacy" class="hover:text-foreground">Privacy</a>
        <a href="https://pipewriter.io/terms" class="hover:text-foreground">Terms</a>
        <a href="https://pipewriter.io" class="hover:text-foreground">Marketing Site</a>
      </div>
    </div>
  </div>
</div>

