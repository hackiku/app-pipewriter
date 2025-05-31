<!-- src/routes/(addon)/addon/+page.svelte -->
<script lang="ts">
  import AddOn from "$lib/features/addon/AddOn.svelte";
  
  const { data } = $props();
  
  // Debug logging
  $effect(() => {
    console.log('Addon page rendered:', {
      route: data.route,
      showApp: data.showApp,
      user: data.user?.email || 'none'
    });
  });
</script>

<div class="h-screen w-full bg-background">
  {#if data.showApp}
    <!-- Server confirmed: show app -->
    <AddOn {data} />
  {:else}
    <!-- Fallback: should not happen with proper server redirects -->
    <div class="h-full flex items-center justify-center">
      <div class="flex flex-col items-center space-y-2">
        <div class="h-6 w-6 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
        <p class="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  {/if}
</div>