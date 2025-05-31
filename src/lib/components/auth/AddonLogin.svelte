<!-- src/lib/components/auth/AddonLogin.svelte -->
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { signIn, getError } from '$lib/services/firebase/auth.svelte';
	import { ArrowRight } from '@lucide/svelte';
	import ModeToggle from "../ui/mode-toggle.svelte";
	
	// Local state
	let isSigningIn = $state(false);
	let showTutorial = $state(true);
	
	async function handleGoogleSignIn() {
		isSigningIn = true;
		try {
			await signIn();
			localStorage.setItem('pipewriter-show-tutorial', showTutorial.toString());
			console.log('Sign in successful in iframe, tutorial preference saved:', showTutorial);
			// NO NAVIGATION - Let the server reload handle the state change
		} catch (error) {
			console.error('Sign in error:', error);
		} finally {
			isSigningIn = false;
		}
	}
	
	let authError = $derived(getError());
</script>

<!-- Iframe-optimized login with safe padding and spacing -->
<div class="min-h-full bg-background flex flex-col">
	
	<!-- Scaled up mode toggle -->
	<div class="fixed top-3 right-3 scale-120 origin-top-right">
		<ModeToggle />
	</div>
	
	<!-- Safe top padding for iframe -->
	<div class="flex-1 flex flex-col items-center justify-center py-8 px-4 mb-32">
		<div class="w-full max-w-[240px] space-y-6">
			
			<!-- Compact Headlines for iframe -->
			<div class="text-center space-y-3">
				<h1 class="text-xl font-bold tracking-tight">
					Welcome to Pipewriter
				</h1>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Sign in to access your elements
				</p>
			</div>

			<!-- Auth Error -->
			{#if authError}
				<div class="p-3 text-xs text-destructive-foreground bg-destructive/10 rounded-md border border-destructive/20">
					{authError}
				</div>
			{/if}

			<!-- Google Sign In Button with proper spacing -->
			<div class="px-2">
				<Button 
					class="w-full h-10 text-sm"
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
						<ArrowRight class="h-4 w-4 ml-2 flex-shrink-0" />
					{/if}
				</Button>
			</div>

			<!-- Centered Tutorial Checkbox -->
			<div class="flex items-center justify-center space-x-3 px-2">
				<Checkbox 
					id="show-tutorial-iframe" 
					bind:checked={showTutorial}
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

	<!-- Styled bottom footer -->
	<div class="pb-6 text-center space-y-3">
		<!-- Main App Button -->
		<div>
			<Button 
				variant="ghost" 
				size="sm"
				class="h-8 px-3 text-xs font-medium"
				onclick={() => window.open('/', '_blank')}
			>
				Main App
				<ArrowRight class="h-3 w-3 ml-1" />
			</Button>
		</div>
		
		<!-- Footer Links -->
		<div class="flex items-center justify-center gap-4 text-xs">
			<a 
				href="https://pipewriter.io" 
				target="_blank"
				class="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
			>
				Website
			</a>
			<span class="text-muted-foreground/50">•</span>
			<a 
				href="https://pipewriter.io/terms" 
				target="_blank"
				class="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
			>
				Terms
			</a>
			<span class="text-muted-foreground/50">•</span>
			<a 
				href="https://pipewriter.io/privacy" 
				target="_blank"
				class="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
			>
				Privacy
			</a>
		</div>
	</div>
</div>