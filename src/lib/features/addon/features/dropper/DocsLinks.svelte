<!-- src/lib/features/addon/features/dropper/DocsLinks.svelte - CLEAN -->
<script lang="ts">
	import { ExternalLink, Crown, FileText, Folder } from '@lucide/svelte';
	// Tooltips removed for now - will add back with simpler approach
	import { cn } from '$lib/utils';

	// Keep props for future use
	let {
		userAccess,
		showInfo
	}: {
		userAccess?: any;
		showInfo?: boolean;
	} = $props();

	// Template documents with REAL links
	const templateDocs = [
		{
			id: 'starter-template',
			title: 'Starter',
			description:
				'Basic wireframe elements and layouts for getting started with content-first design',
			url: 'https://docs.google.com/document/d/1VsjRgy_dAccHhRF2iG_jEknv8bQn6t47wX3GD-_uoaQ',
			tier: 'free',
			type: 'doc'
		},
		{
			id: 'pro-template',
			title: 'Pro',
			description:
				'Advanced wireframe system with complex layouts, data tables, and premium components',
			url: 'https://docs.google.com/document/d/1hjIdUjCRPGLFJhK6NNmV24zxZxGivWOQX959aUPfXR0',
			tier: 'pro',
			type: 'doc'
		},
		{
			id: 'dark-template',
			title: 'Dark',
			description: 'Complete dark-mode wireframe collection for modern app and website designs',
			url: 'https://docs.google.com/document/d/1MBSDZ7EDJ4JBenwoUnna5dbbXr7oCAOv1__m8LVJfSA',
			tier: 'pro',
			type: 'doc'
		}
	];

	// Drive folders with REAL links
	const driveFolders = [
		{
			id: 'pro-folder',
			title: 'Pro Templates',
			description: 'Complete collection of 100+ premium wireframe elements organized by category',
			url: 'https://drive.google.com/drive/folders/1dxgvwlakeZpK9nwP4Uu4MfQefn6Uz5Ur',
			tier: 'pro',
			type: 'drive'
		},
		{
			id: 'prompts-folder',
			title: 'AI Prompts',
			description: 'Curated library of copywriting and UX writing prompts for content generation',
			url: 'https://drive.google.com/drive/folders/1WYJObf1OWdxrFFWYyxc6aAAP2TZShm-L',
			tier: 'pro',
			type: 'drive'
		},
		{
			id: 'samples-folder',
			title: 'Sample Docs',
			description: 'Real-world examples and case studies from successful copywriting projects',
			url: 'https://drive.google.com/drive/folders/1egnPOFg2I4dRn4v87GUC00WAwQxXrjHb',
			tier: 'pro',
			type: 'drive'
		}
	];

	// Handle link clicks
	function handleLinkClick(url: string) {
		window.open(url, '_blank');
	}

	// CLEAN: Simple card styling for 300px width
	function getCardClass() {
		return cn(
			'group relative w-full h-16 p-2 rounded-lg border transition-all duration-200 cursor-pointer',
			'bg-card hover:bg-accent border-border',
			'hover:-translate-y-0.5 hover:shadow-sm'
		);
	}
</script>

<div class="space-y-3 px-2 pb-4">
	<!-- Template Documents Section -->
	<section>
		{#if showInfo}
			<h3 class="mb-2 ml-1 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
				Template Documents
			</h3>
		{/if}

		<!-- Documents Grid - tight 3 columns -->
		<div class="mb-4 grid grid-cols-3 gap-1.5">
			{#each templateDocs as doc}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class={getCardClass()}
					onclick={() => handleLinkClick(doc.url)}
					title={doc.description}
				>
					<div class="flex h-full flex-col justify-between">
						<!-- Header with Google Docs icon -->
						<div class="relative flex items-center justify-between">
							<div class="flex min-w-0 flex-col items-start gap-1">
								<img
									src="/icons/google-docs.svg"
									alt="Google Docs"
									class="h-4 w-4 flex-shrink-0"
								/>
								<span class="truncate text-xs font-medium">{doc.title}</span>
							</div>

							<!-- Crown for pro items -->
							{#if doc.tier === 'pro'}
								<div
									class="absolute -right-1 -top-1 flex items-center gap-0.5 rounded px-1 py-0.5 backdrop-blur-sm"
								>
									<Crown class="h-2.5 w-2.5 text-amber-600" />
								</div>
							{/if}
						</div>

						<!-- Bottom right external link -->
						<div class="flex justify-end">
							<ExternalLink
								class="h-2.5 w-2.5 text-muted-foreground/60 transition-colors group-hover:text-muted-foreground"
							/>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Drive Folders Section -->
	<section>
		{#if showInfo}
			<h3 class="mb-2 ml-1 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
				Drive Folders
			</h3>
		{/if}

		<!-- Folders Grid - same tight layout -->
		<div class="mb-3 grid grid-cols-3 gap-1.5">
			{#each driveFolders as folder}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class={getCardClass()}
					onclick={() => handleLinkClick(folder.url)}
					title={folder.description}
				>
					<div class="flex h-full flex-col justify-between">
						<!-- Header with Google Drive icon -->
						<div class="relative flex items-center justify-between">
							<div class="flex min-w-0 flex-col items-start gap-1">
								<img
									src="/icons/google-drive.svg"
									alt="Google Drive"
									class="h-4 w-4 flex-shrink-0"
								/>
								<span class="truncate text-[0.7rem] font-medium">{folder.title}</span>
							</div>

							<!-- Crown for pro folders -->
							{#if folder.tier === 'pro'}
								<div
									class="absolute -right-1 -top-1 flex items-center gap-0.5 rounded px-1 py-0.5 backdrop-blur-sm"
								>
									<Crown class="h-2.5 w-2.5 text-amber-600" />
								</div>
							{/if}
						</div>

						<!-- Bottom right external link -->
						<div class="flex justify-end">
							<ExternalLink
								class="h-2.5 w-2.5 text-muted-foreground/60 transition-colors group-hover:text-muted-foreground"
							/>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Bottom CTA copy -->
		<div class="mt-3 px-1">
			<p class="text-center text-[0.6rem] leading-relaxed text-muted-foreground">
				Pro templates include 100+ elements. 
				<a href="https://pipewriter.io/pricing" target="_blank"
				class="border-b border-foreground/20 hover:border-foreground hover:font-bold">See pricing</a>  →
			</p>
		</div>
	</section>
</div>