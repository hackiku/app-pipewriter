<!-- src/lib/components/auth/AddonLogin.svelte -->
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { ArrowRight, RefreshCw } from 'lucide-svelte';
	import ModeToggle from "../ui/mode-toggle.svelte";
	import { signIn, switchAccount } from '$lib/services/auth';
	
	// Local state
	let isSigningIn = $state(false);
	let isSwitching = $state(false);
	let showTutorial = $state(true);
	let errorMessage = $state('');
	
	async function handleGoogleSignIn() {
		if (isSigningIn || isSwitching) return;
		
		isSigningIn = true;
		errorMessage = '';
		
		try {
			localStorage.setItem('pipewriter-show-tutorial', showTutorial.toString());
			await signIn();
		} catch (error) {
			console.error('Sign in error:', error);
			errorMessage = error.message || 'Sign in failed';
		} finally {
			isSigningIn = false;
		}
	}
	
	async function handleSwitchAccount() {
		if (isSigningIn || isSwitching) return;
		
		isSwitching = true;
		errorMessage = '';
		
		try {
			localStorage.setItem('pipewriter-show-tutorial', showTutorial.toString());
			await switchAccount();
		} catch (error) {
			console.error('Account switch error:', error);
			errorMessage = error.message || 'Account switch failed';
		} finally {
			isSwitching = false;
		}
	}
</script>

<div class="min-h-full bg-background flex flex-col">
	<div class="fixed top-3 right-3 scale-120 origin-top-right">
		<ModeToggle />
	</div>
	
	<div class="flex-1 flex flex-col items-center justify-center py-8 px-4 mb-32">
		<div class="w-full max-w-[240px] space-y-6">
			
			<div class="text-center space-y-3">
				<h1 class="text-xl font-bold tracking-tight">
					Welcome to Pipewriter
				</h1>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Sign in to access your elements
				</p>
			</div>

			{#if errorMessage}
				<div class="p-3 text-xs text-destructive-foreground bg-destructive/10 rounded-md border border-destructive/20">
					{errorMessage}
				</div>
			{/if}

			<div class="px-2 space-y-3">
				<!-- Primary Sign In Button -->
				<Button 
					class="w-full h-10 text-sm"
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
						<ArrowRight class="h-4 w-4 ml-2 flex-shrink-0" />
					{/if}
				</Button>
				
				<!-- Switch Account Button -->
				<Button 
					variant="outline"
					class="w-full h-8 text-xs"
					onclick={handleSwitchAccount}
					disabled={isSigningIn || isSwitching}
				>
					{#if isSwitching}
						<div class="h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin mr-2 flex-shrink-0"></div>
						<span class="truncate">Switching...</span>
					{:else}
						<RefreshCw class="h-3 w-3 mr-2 flex-shrink-0" />
						<span class="truncate">Use different account</span>
					{/if}
				</Button>
			</div>

			<div class="flex items-center justify-center space-x-3 px-2">
				<Checkbox 
					id="show-tutorial-iframe" 
					bind:checked={showTutorial}
					disabled={isSigningIn || isSwitching}
				/>
				<label 
					for="show-tutorial-iframe" 
					class="text-sm leading-none cursor-pointer select-none"
				>
					Show tutorial
				</label>
			</div>

		</div>
	</div>

	<div class="pb-6 text-center space-y-3">
		<div>
			<Button 
				variant="ghost" 
				size="sm"
				class="h-8 px-3 text-xs font-medium"
				onclick={() => window.open('/', '_blank')}
				disabled={isSigningIn || isSwitching}
			>
				Main App
				<ArrowRight class="h-3 w-3 ml-1" />
			</Button>
		</div>
	</div>
</div>