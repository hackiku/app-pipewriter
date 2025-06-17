<!-- src/lib/features/addon/features/ai/PromptDropdown.svelte - FINAL WITH DELETED PROMPTS -->
<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { ChevronDown, Plus, Trash2, Edit, RotateCcw } from '@lucide/svelte';
	import PromptEditor from './PromptEditor.svelte';
	import PromptControls from './PromptControls.svelte';
	import PromptTabs from './PromptTabs.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { dropPrompt } from '$lib/services/google/html';

	const props = $props<{
		prompts: Record<string, any[]>;
		features: any;
		isProcessing?: boolean;
		isOpen?: boolean;
		activePrompt?: any;
		onPromptSelect: (prompt: any) => void;
		onPromptClear: () => void;
		onToggleOpen: () => void;
		onPromptsUpdate: () => void;
	}>();

	// State
	let editMode = $state(false);
	let createMode = $state(false);
	let selectedCategory = $state('all');
	let isOperating = $state(false);
	let deletePromptId = $state<string | null>(null);
	let deletedPrompts = $state<any[]>([]);

	// Convert to plain object
	let plainPrompts = $derived.by(() => {
		if (!props.prompts || typeof props.prompts !== 'object') {
			return {};
		}
		try {
			return { ...props.prompts };
		} catch (error) {
			return {};
		}
	});

	// Get all prompts as flat array
	let allPrompts = $derived.by(() => {
		const result = Object.values(plainPrompts).flat();
		return result;
	});

	// Generate categories with counts
	let categories = $derived.by(() => {
		const counts: Record<string, number> = {};
		Object.entries(plainPrompts).forEach(([category, prompts]) => {
			counts[category] = Array.isArray(prompts) ? prompts.length : 0;
		});

		return [
			{ id: 'all', label: 'All', count: allPrompts.length },
			...Object.entries(counts).map(([id, count]) => ({
				id,
				label: id.charAt(0).toUpperCase() + id.slice(1),
				count
			}))
		];
	});

	// Filter prompts based on selected category
	let filteredPrompts = $derived.by(() => {
		if (selectedCategory === 'all') {
			return allPrompts;
		} else {
			const categoryData = plainPrompts[selectedCategory];
			return Array.isArray(categoryData) ? categoryData : [];
		}
	});

	// Load deleted prompts when dropdown opens
	$effect(() => {
		if (props.isOpen && !editMode && !createMode) {
			loadDeletedPrompts();
		}
	});

	async function loadDeletedPrompts() {
		try {
			const response = await fetch('/api/prompts?includeDeleted=true');
			const result = await response.json();
			
			if (result.success && result.deletedPrompts) {
				deletedPrompts = result.deletedPrompts;
			}
		} catch (error) {
			console.error('Failed to load deleted prompts:', error);
		}
	}

	// Actions
	function selectPrompt(prompt) {
		props.onPromptSelect(prompt);
		editMode = false;
		createMode = false;
	}

	function clearPrompt() {
		props.onPromptClear();
		editMode = false;
		createMode = false;
	}

	function startEdit(prompt: any) {
		editMode = true;
		createMode = false;
		props.onPromptSelect(prompt);
	}

	function startCreate() {
		editMode = false;
		createMode = true;
		props.onPromptClear();
	}

	function backToList() {
		editMode = false;
		createMode = false;
	}

	// Drop prompt functionality
	async function dropPromptToDoc() {
		if (!props.activePrompt || isOperating) return;
		
		isOperating = true;
		try {
			const response = await dropPrompt({
				promptContent: props.activePrompt.content,
				promptTitle: props.activePrompt.title
			});

			if (response.success) {
				props.onToggleOpen();
			} else {
				throw new Error(response.error || 'Failed to drop prompt');
			}
		} catch (error) {
			console.error('Failed to drop prompt:', error);
		} finally {
			isOperating = false;
		}
	}

	async function copyPrompt() {
		if (!props.activePrompt) return;
		try {
			await navigator.clipboard.writeText(props.activePrompt.content);
		} catch (error) {
			console.error('Failed to copy prompt:', error);
		}
	}

	function handleDeleteClick(event: MouseEvent, promptId: string) {
		event.stopPropagation();
		if (isOperating) return;
		deletePromptId = promptId;
	}

	function confirmDelete() {
		if (deletePromptId) {
			deletePrompt(deletePromptId);
			deletePromptId = null;
		}
	}

	async function deletePrompt(promptId: string) {
		if (isOperating) return;

		isOperating = true;
		try {
			const response = await fetch(`/api/prompts?id=${promptId}`, {
				method: 'DELETE'
			});

			const result = await response.json();
			if (result.success) {
				if (props.activePrompt?.id === promptId) {
					clearPrompt();
				}
				await props.onPromptsUpdate();
				await loadDeletedPrompts(); // Refresh deleted list
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			console.error('Delete failed:', error);
		} finally {
			isOperating = false;
		}
	}

	// Restore deleted prompt
	async function restorePrompt(promptId: string) {
		if (isOperating) return;

		isOperating = true;
		try {
			const response = await fetch('/api/prompts/restore', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					promptId, 
					restoreType: 'undelete' 
				})
			});

			const result = await response.json();
			if (result.success) {
				await props.onPromptsUpdate();
				await loadDeletedPrompts(); // Refresh deleted list
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			console.error('Restore failed:', error);
		} finally {
			isOperating = false;
		}
	}

	// Restore all deleted prompts
	async function restoreAllDeleted() {
		if (isOperating || deletedPrompts.length === 0) return;

		isOperating = true;
		try {
			const response = await fetch('/api/prompts/restore-all', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ restoreType: 'undelete' })
			});

			const result = await response.json();
			if (result.success) {
				await props.onPromptsUpdate();
				await loadDeletedPrompts();
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			console.error('Restore all failed:', error);
		} finally {
			isOperating = false;
		}
	}

	// Restore to system default
	async function restoreToDefault(promptId: string) {
		if (isOperating) return;

		isOperating = true;
		try {
			const response = await fetch('/api/prompts/restore', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					promptId, 
					restoreType: 'default' 
				})
			});

			const result = await response.json();
			if (result.success) {
				await props.onPromptsUpdate();
				backToList();
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			console.error('Restore to default failed:', error);
		} finally {
			isOperating = false;
		}
	}

	async function savePrompt(promptData: any, isNew: boolean = false) {
		if (isOperating) return;

		isOperating = true;
		try {
			const method = isNew ? 'POST' : 'PUT';
			const response = await fetch('/api/prompts', {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(promptData)
			});

			const result = await response.json();
			if (result.success) {
				await props.onPromptsUpdate();
				backToList();

				if (isNew) {
					setTimeout(() => {
						const newPrompt = allPrompts.find((p) => p.id === promptData.id);
						if (newPrompt) selectPrompt(newPrompt);
					}, 100);
				}
			} else {
				throw new Error(result.error);
			}
		} catch (error) {
			console.error('Save failed:', error);
		} finally {
			isOperating = false;
		}
	}

	function truncateContent(content: string, maxLength: number = 120): string {
		if (!content || content.length <= maxLength) return content || '';
		return content.substring(0, maxLength).trim() + '...';
	}

	function getCategoryColor(category: string) {
		const colors = {
			writing: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
			ux: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950',
			marketing: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950',
			structure: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
			technical: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
			design: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
			code: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950'
		};
		return colors[category] || 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
	}

	let buttonClass = $derived(
		cn(
			'w-full justify-between px-3 h-9 font-normal text-sm',
			props.activePrompt && 'border-primary/60 bg-primary/5 hover:bg-primary/10'
		)
	);
</script>

<div class="space-y-2">
	{#if props.isOpen}
		<div
			class="overflow-hidden rounded-lg border bg-background shadow-sm"
			transition:slide={{ duration: 200 }}
		>
			{#if editMode && props.activePrompt}
				<!-- Edit Mode -->
				<div class="p-3" transition:fade={{ duration: 150 }}>
					<PromptEditor
						prompt={props.activePrompt}
						onBack={backToList}
						onSave={(data) => savePrompt(data, false)}
						onRestore={() => restoreToDefault(props.activePrompt.id)}
						isProcessing={isOperating || props.isProcessing}
					/>
				</div>

				<PromptControls
					mode="edit"
					onBack={backToList}
					onSave={() => {}}
					disabled={isOperating || props.isProcessing}
				/>
			{:else if createMode}
				<!-- Create Mode -->
				<div class="p-3" transition:fade={{ duration: 150 }}>
					<PromptEditor
						prompt={{
							id: '',
							title: '',
							content: '',
							category: selectedCategory === 'all' ? 'writing' : selectedCategory
						}}
						onBack={backToList}
						onSave={(data) =>
							savePrompt(
								{
									...data,
									id: data.title
										.toLowerCase()
										.replace(/[^a-z0-9\s]/g, '')
										.replace(/\s+/g, '-')
										.substring(0, 50)
								},
								true
							)}
						isProcessing={isOperating || props.isProcessing}
						isNew={true}
					/>
				</div>

				<PromptControls
					mode="edit"
					onBack={backToList}
					onSave={() => {}}
					disabled={isOperating || props.isProcessing}
				/>
			{:else if Object.keys(plainPrompts).length === 0}
				<!-- No prompts -->
				<div class="p-6 text-center">
					<p class="text-sm text-muted-foreground">No prompts available</p>
					<p class="mt-1 text-xs text-red-500">Check if user has prompts provisioned</p>
				</div>
			{:else}
				<!-- Browse Mode -->
				<div>
					<!-- Category Tabs -->
					<PromptTabs
						{categories}
						{selectedCategory}
						onCategoryChange={(cat) => (selectedCategory = cat)}
						disabled={isOperating}
					/>

					<!-- Prompts List -->
					<div class="h-52 overflow-y-auto">
						{#if filteredPrompts.length === 0}
							<div class="p-4 text-center">
								<p class="text-sm text-muted-foreground">
									No prompts in {selectedCategory} category
								</p>
								<p class="mt-1 text-xs text-amber-600">Try refreshing or check another category</p>
							</div>
						{:else}
							{#each filteredPrompts as prompt, index (prompt?.id || `missing-${index}`)}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<div
									class="group relative w-full cursor-pointer border-b border-border/30 p-3 transition-colors last:border-b-0 hover:bg-muted/50
                    {props.activePrompt?.id === prompt?.id
										? 'border-primary/30 bg-primary/10'
										: ''}"
									onclick={() => selectPrompt(prompt)}
									role="button"
									tabindex="0"
								>
									<!-- Main Content -->
									<div class="flex items-start justify-between gap-2 pr-2">
										<div class="min-w-0 flex-1">
											<div class="mb-1 flex items-center gap-2">
												<h4 class="truncate text-sm font-medium">
													{prompt?.title || `Prompt ${index + 1}`}
												</h4>
												<span
													class="rounded px-1.5 py-0.5 text-[0.6rem] font-medium {getCategoryColor(
														prompt?.category
													)}"
												>
													{prompt?.category}
												</span>
											</div>
											<p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
												{truncateContent(prompt?.content || 'No content')}
											</p>
										</div>
									</div>

									<!-- Action Buttons -->
									<div
										class="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<Button
											variant="ghost"
											size="sm"
											class="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
											onclick={(e) => {
												e.stopPropagation();
												startEdit(prompt);
											}}
											disabled={isOperating}
											title="Edit prompt"
										>
											<Edit class="h-3 w-3" />
										</Button>

										<Button
											variant="ghost"
											size="sm"
											class="h-6 w-6 p-0 text-destructive/60 hover:bg-destructive/10 hover:text-destructive"
											onclick={(e) => handleDeleteClick(e, prompt?.id)}
											disabled={isOperating}
											title="Delete prompt"
										>
											<Trash2 class="h-3 w-3" />
										</Button>
									</div>
								</div>
							{/each}
						{/if}

						<!-- New Prompt Button -->
						<button
							class="w-full border-2 border-dashed border-border/50 p-4 text-left text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 hover:text-foreground rounded-lg mx-3 my-2"
							onclick={startCreate}
							disabled={isOperating}
						>
							<div class="flex items-center gap-2">
								<Plus class="h-4 w-4" />
								<span class="text-sm font-medium">New Prompt</span>
							</div>
						</button>

						<!-- Deleted Prompts Section -->
						{#if deletedPrompts.length > 0}
							<div class="border-t border-border/50 mt-2">
								<div class="p-3 bg-muted/30">
									<div class="flex items-center justify-between mb-2">
										<h4 class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Deleted ({deletedPrompts.length})
										</h4>
										<Button
											variant="ghost"
											size="sm"
											class="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
											onclick={restoreAllDeleted}
											disabled={isOperating}
										>
											<RotateCcw class="h-3 w-3 mr-1" />
											Restore All
										</Button>
									</div>
									
									{#each deletedPrompts as deletedPrompt (deletedPrompt.id)}
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<div
											class="group relative w-full p-2 mb-1 rounded border border-border/30 bg-background/50 opacity-60 hover:opacity-90 transition-all last:mb-0"
											role="button"
											tabindex="0"
										>
											<div class="flex items-start justify-between gap-2 pr-8">
												<div class="min-w-0 flex-1">
													<div class="mb-1 flex items-center gap-2">
														<h5 class="truncate text-xs font-medium text-muted-foreground">
															{deletedPrompt.title}
														</h5>
														<span class="rounded px-1 py-0.5 text-[0.55rem] font-medium bg-muted text-muted-foreground">
															{deletedPrompt.category}
														</span>
													</div>
													<p class="text-[0.65rem] text-muted-foreground leading-relaxed line-clamp-1">
														{truncateContent(deletedPrompt.content, 80)}
													</p>
												</div>
											</div>

											<!-- Restore Actions -->
											<div class="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
												<Button
													variant="ghost"
													size="sm"
													class="h-5 w-5 p-0 hover:bg-green-100 dark:hover:bg-green-900 text-green-600"
													onclick={() => restorePrompt(deletedPrompt.id)}
													disabled={isOperating}
													title="Restore prompt"
												>
													<RotateCcw class="h-3 w-3" />
												</Button>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- Browse Mode Controls (only show if prompt selected) -->
					{#if props.activePrompt}
						<PromptControls
							mode="view"
							onCopy={copyPrompt}
							onEdit={() => startEdit(props.activePrompt)}
							onDrop={dropPromptToDoc}
							disabled={isOperating || props.isProcessing}
						/>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Main Button -->
	<Button
		variant="outline"
		class={buttonClass}
		onclick={props.onToggleOpen}
		disabled={props.isProcessing || isOperating}
	>
		{#if props.activePrompt}
			<span class="truncate font-medium text-foreground">{props.activePrompt.title}</span>
		{:else}
			<span class="text-muted-foreground">Select prompt...</span>
		{/if}
		<ChevronDown
			class={cn(
				'h-4 w-4 flex-shrink-0 transition-transform duration-200',
				props.isOpen && 'rotate-180'
			)}
		/>
	</Button>
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root open={!!deletePromptId} onOpenChange={(open) => !open && (deletePromptId = null)}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Prompt?</AlertDialog.Title>
			<AlertDialog.Description>
				This prompt will be moved to trash. You can restore it later.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDelete}>Move to Trash</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>