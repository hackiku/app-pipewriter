<!-- src/routes/addon/+page.svelte -->
<script lang="ts">
	import AddOn from "$lib/features/addon/AddOn.svelte";
	import AddonLogin from "$lib/components/auth/AddonLogin.svelte";
	
	// Get server-calculated data - NO CLIENT-SIDE AUTH LOGIC
	const { data } = $props();
	
	// Debug logging for iframe
	$effect(() => {
		console.log('Addon page rendered:', {
			showLogin: data.showLogin,
			showApp: data.showApp,
			user: data.user?.email || 'none',
			iframeMode: data.iframeMode
		});
	});
</script>

<div class="h-screen w-full bg-background">
	{#if data.showLogin}
		<!-- Server decided: show login (user not authenticated) -->
		<AddonLogin />
	{:else if data.showApp}
		<!-- Server decided: show app (user authenticated) -->
		<AddOn {data} />
	{:else}
		<!-- Fallback: should never happen with proper server logic -->
		<div class="h-full flex items-center justify-center">
			<div class="flex flex-col items-center space-y-2">
				<div class="h-6 w-6 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
				<p class="text-sm text-muted-foreground">Initializing Pipewriter...</p>
			</div>
		</div>
	{/if}
</div>