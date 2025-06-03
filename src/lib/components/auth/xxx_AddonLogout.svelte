<!-- src/lib/components/auth/AddonLogout.svelte -->
<script lang="ts">
	import { LogOut } from '@lucide/svelte';
	
	const { disabled = false, class: className = '' } = $props();
	
	let isLoggingOut = $state(false);
	
	async function handleAddonLogout() {
		isLoggingOut = true;
		try {
			// Import Firebase auth
			const { signOut: firebaseSignOut } = await import('firebase/auth');
			const { getFirebaseService } = await import('$lib/services/firebase/client');
			
			const { auth } = getFirebaseService();
			
			// Sign out from Firebase
			await firebaseSignOut(auth);
			
			// Delete server session
			await fetch('/api/auth/session', { method: 'DELETE' });
			
			// For addon route, just reload - this will show login UI
			window.location.reload();
			
		} catch (error) {
			console.error('Addon logout failed:', error);
		} finally {
			isLoggingOut = false;
		}
	}
</script>

<button
	class="flex items-center gap-2 {className}"
	onclick={handleAddonLogout}
	disabled={disabled || isLoggingOut}
>
	{#if isLoggingOut}
		<div class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
		Signing out...
	{:else}
		<LogOut class="h-4 w-4" />
		Sign out
	{/if}
</button>