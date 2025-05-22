<!-- src/routes/addon/+page.svelte -->
<script lang="ts">
  import AddOn from "$lib/features/addon/AddOn.svelte";
  import AddonLogin from "$lib/components/auth/AddonLogin.svelte";
  import { getUser, isLoading } from '$lib/services/firebase/auth.svelte';

  // Reactive checks for auth state
  let user = $derived(getUser());
  let loading = $derived(isLoading());
  let isAuthenticated = $derived(!!user && !loading);
  let shouldShowLogin = $derived(!loading && !user);

  // Debug logging
  $effect(() => {
    console.log('Addon page auth state:', { 
      user: !!user, 
      loading, 
      isAuthenticated, 
      shouldShowLogin 
    });
  });
</script>

<div class="h-screen w-full bg-background">
  {#if loading}
    <!-- Loading state -->
    <div class="h-full flex items-center justify-center">
      <div class="flex flex-col items-center space-y-4">
        <div class="h-8 w-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
        <p class="text-sm text-muted-foreground">Loading Pipewriter...</p>
      </div>
    </div>
  {:else if shouldShowLogin}
    <!-- Show login when not authenticated -->
    <AddonLogin />
  {:else if isAuthenticated}
    <!-- Show the full addon when authenticated -->
    <div class="h-full w-full">
      <AddOn />
    </div>
  {/if}
</div>