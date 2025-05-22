<!-- $lib/iframe/features/dropper/ElementCard.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { Plus, AlertCircle, Lock, Star } from '@lucide/svelte';
	import type { Element, ElementTheme } from '$lib/data/addon/types';
	import { onMount, onDestroy } from 'svelte';

	import { useTrialFeatures } from '$lib/context/trial.svelte';
	const trialFeatures = useTrialFeatures();

	// Props
	const props = $props<{
		element: Element;
		onSelect: (id: string) => void;
		theme: ElementTheme;
		disabled?: boolean;
		isSelected?: boolean;
		isLocked?: boolean;
		chainMode?: boolean;
		chainPosition?: number; // Position in chain (1, 2, 3, etc.) - 0 means not in chain
		onChainToggle?: (id: string) => void;
	}>();

	const isLocked = props.isLocked;
	const isPro = props.element.metadata?.tier === 'pro';

	// Fix: Use a regular function to determine lock status (not $derived)
	function checkIfElementLocked() {
		const elementTier = props.element.metadata?.tier || 'free';

		if (trialFeatures.trialInfo.isPro) return false;
		if (trialFeatures.trialInfo.active) return elementTier === 'pro';
		return elementTier !== 'free';
	}

	// Local state - minimal reactivity
	let isProcessing = $state(false);
	let imageError = $state(false);
	let appTheme = $state<ElementTheme>('light');
	let observer: MutationObserver | null = null;

	// Setup mutation observer to detect theme changes on document
	onMount(() => {
		// Initial dark mode check
		appTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

		// Watch for dark mode changes
		observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.attributeName === 'class') {
					const newAppTheme = document.documentElement.classList.contains('dark')
						? 'dark'
						: 'light';
					if (appTheme !== newAppTheme) {
						appTheme = newAppTheme;
					}
				}
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});
	});

	// Clean up observer on component destroy
	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});

	// Handle click on the element card
	async function handleClick(e: MouseEvent) {
		if (props.disabled || isProcessing) return;

		// In chain mode, handle chain toggle instead of direct selection
		if (props.chainMode && props.onChainToggle) {
			e.preventDefault();
			e.stopPropagation();
			props.onChainToggle(props.element.id);
			return;
		}

		// Don't proceed if locked
		if (isLocked) return;

		isProcessing = true;

		try {
			await props.onSelect(props.element.id);
		} finally {
			isProcessing = false;
		}
	}

	// Function to get the correct image path based on both element theme and app theme
	function getSvgUrl(): string {
		const element = props.element;
		const baseId = element.id.endsWith('-dark') ? element.id.replace(/-dark$/, '') : element.id;

		// In app dark mode, we invert the theme logic
		const shouldUseDarkVariant =
			appTheme === 'dark'
				? props.theme === 'light' // In dark app, light elements should be dark
				: props.theme === 'dark'; // In light app, dark elements stay dark

		const svgPath = shouldUseDarkVariant ? `${baseId}-dark.svg` : `${baseId}.svg`;
		return `/elements/${svgPath}`;
	}

	// Card styling based on theme
	const cardStyles = {
		light:
			'bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700/80 hover:bg-neutral-400/30 dark:hover:bg-neutral-900/80',
		dark: 'bg-neutral-950 dark:bg-white hover:bg-neutral-900/80 dark:hover:bg-neutral-400/30 border border-neutral-300'
	};

	const baseButtonClasses = cn(
		'group relative w-full h-full p-0 rounded-lg overflow-hidden',
		'transition-all duration-200 ease-out cursor-pointer'
	);

	// Pure function to get button class - no reactive dependencies
	function getButtonClass() {
		const isLockedElement = checkIfElementLocked();

		return cn(
			baseButtonClasses,
			cardStyles[props.theme],
			// Keep hover animations for pro elements but gray them out
			!isLockedElement &&
				'hover:-translate-y-1 hover:-translate-x-1 hover:rotate-[-2deg] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]',
			!isLockedElement && 'active:translate-y-0 active:translate-x-0 active:shadow-none',
			props.isSelected && 'ring-2 ring-primary ring-offset-2',
			(props.disabled || isProcessing) && 'opacity-90 cursor-not-allowed pointer-events-none',
			isLockedElement && 'opacity-60 grayscale'
		);
	}

	// Handle image loading errors
	function handleImageError() {
		console.error(`Failed to load image: ${getSvgUrl()}`);
		imageError = true;
	}
</script>

<div class="relative">
	<Button
		variant="ghost"
		class={getButtonClass()}
		onclick={handleClick}
		disabled={props.disabled || isProcessing}
		title={checkIfElementLocked() ? 'Upgrade to access this element' : props.element.description}
	>
		<div class="relative h-full w-full">
			{#if imageError}
				<div class="flex h-full flex-col items-center justify-center p-2 text-center">
					<AlertCircle class="mb-1 h-6 w-6 text-neutral-400" />
					<span class="text-xs text-neutral-500">{props.element.id}</span>
				</div>
			{:else}
				<!-- Element Image -->
				<img
					src={getSvgUrl()}
					alt={props.element.alt}
					class="h-full w-full object-cover transition-opacity group-hover:opacity-40"
					onerror={handleImageError}
				/>

				<!-- Pro Star Icon (top-right, subtle)
				{#if isPro}
					<div class="absolute right-1 top-1">
						<Star size={10} class="fill-amber-400/60 text-amber-400/60" />
					</div>
				{/if} -->
			{/if}

			<!-- Chain Mode Selection Button with Radial Gradient Attention -->
			{#if props.chainMode && !checkIfElementLocked()}
				<div class="pointer-events-none absolute left-0 top-0">
					<!-- Radial gradient for attention - tasteful and breathable -->
					<div
						class="bg-gradient-radial absolute inset-0 h-12
                      w-12 from-accent/20 from-30% via-accent/10
                      via-60% to-transparent to-100%"
					></div>
				</div>

				<div class="absolute left-1 top-1 z-10">
					<div
						class="pointer-events-auto flex h-5 w-5 items-center justify-center
                   rounded-full border-2 bg-background/95 backdrop-blur-sm
                   {props.chainPosition > 0
							? 'border-primary bg-primary text-primary-foreground shadow-sm'
							: 'border-primary/60 bg-background hover:border-primary hover:bg-primary/5'} 
                   transition-all duration-150 hover:scale-105"
					>
						{#if props.chainPosition > 0}
							<span class="text-xs font-medium">{props.chainPosition}</span>
						{:else}
							<Plus class="h-2.5 w-2.5 text-primary/70" />
						{/if}
					</div>
				</div>
			{/if}

			{#if !props.chainMode && !checkIfElementLocked()}
				<!-- Normal Hover Effect for Unlocked Elements (only when not in chain mode) -->
				<div
					class="bg-gradient-radial absolute inset-0 flex items-center
                    justify-center from-background/30 from-20%
                    via-background/10 via-50% to-transparent to-100%
                    opacity-0 transition-opacity group-hover:opacity-100"
				>
					<div class="rounded-full border border-border/50 bg-background/90 p-2 backdrop-blur-sm">
						<Plus class="text-foreground/80" size={20} />
					</div>
				</div>
			{:else if !props.chainMode && checkIfElementLocked()}
				<!-- Locked Element Hover Effect - Shows "Get Pro" -->
				<div
					class="bg-gradient-radial absolute inset-0 flex items-center
                    justify-center from-background/30 from-20%
                    via-background/10 via-50% to-transparent to-100%
                    opacity-0 transition-opacity group-hover:opacity-100"
				>
					<div class="rounded-full border border-border/50 bg-background/90 px-2 py-1 backdrop-blur-sm">
						<span class="text-xs font-medium text-foreground/80">Get Pro</span>
					</div>
				</div>
			{/if}

			{#if isProcessing}
				<!-- Processing State Overlay with gradient backdrop -->
				<div
					class="bg-gradient-radial absolute inset-0 flex items-center
                    justify-center from-background/80 from-20% via-background/60
                    via-50% to-background/40 to-100% backdrop-blur-sm"
				>
					<div
						class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
					></div>
				</div>
			{/if}
		</div>
	</Button>

	<!-- External Locked Overlay - fades from bottom without affecting hover -->
	{#if checkIfElementLocked()}
		<div
			class="pointer-events-none absolute inset-0 z-10 
			       bg-gradient-to-t from-background via-background/60 to-transparent 
			       from-0% via-25% to-70%
			       border-b border-background"
		>
			<div class="absolute bottom-1 right-1 flex items-center gap-1 opacity-70">
				<Lock class="h-3 w-3 text-muted-foreground" />
			</div>
		</div>
	{/if}
</div>

<style>
	/* Custom radial gradient utility */
	.bg-gradient-radial {
		background: radial-gradient(var(--tw-gradient-stops));
	}
</style>