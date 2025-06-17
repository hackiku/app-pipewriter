<!-- src/lib/features/addon/features/ai/DeletedPrompts.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { RotateCcw, Trash2 } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	const props = $props<{
		deletedPrompts: any[];
		isOperating: boolean;
		onRestore: (promptId: string) => Promise<void>;
		onPermanentDelete: (promptId: string) => Promise<void>;
		onRestoreAll: () => void;
	}>();

	// Local state for dialogs
	let permanentDeleteId = $state<string | null>(null);
	let showRestoreAllDialog = $state(false);

	function handlePermanentDeleteClick(promptId: string) {
		permanentDeleteId = promptId;
	}

	async function confirmPermanentDelete() {
		if (permanentDeleteId) {
			await props.onPermanentDelete(permanentDeleteId);
			permanentDeleteId = null;
		}
	}

	function confirmRestoreAll() {
		props.onRestoreAll();
		showRestoreAllDialog = false;
	}

	function truncateContent(content: string, maxLength: number = 80): string {
		if (!content || content.length <= maxLength) return content || '';
		return content.substring(0, maxLength).trim() + '...';
	}
</script>

{#if props.deletedPrompts.length > 0}
	<div class="border-t border-border/50">
		<div class="p-3 bg-muted/30">
			<div class="flex items-center justify-between mb-2">
				<h4 class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
					Deleted ({props.deletedPrompts.length})
				</h4>
				<Button
					variant="ghost"
					size="sm"
					class="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
					onclick={() => showRestoreAllDialog = true}
					disabled={props.isOperating}
				>
					<RotateCcw class="h-3 w-3 mr-1" />
					Restore All
				</Button>
			</div>
			
			{#each props.deletedPrompts as deletedPrompt (deletedPrompt.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					class="group relative w-full p-2 mb-1 rounded border border-border/30 bg-background/50 opacity-60 hover:opacity-90 transition-all last:mb-0"
					role="button"
					tabindex="0"
				>
					<div class="flex items-start justify-between gap-2 pr-16">
						<div class="min-w-0 flex-1">
							<div class="mb-1 flex items-center gap-2">
								<h5 class="truncate text-xs font-medium text-muted-foreground">
									{deletedPrompt.title}
								</h5>
								<span class="rounded px-1 py-0.5 text-[0.55rem] font-medium bg-muted text-muted-foreground">
									{deletedPrompt.category}
								</span>
								{#if deletedPrompt.metadata?.isDefault}
									<span class="text-[0.5rem] text-blue-500">default</span>
								{/if}
							</div>
							<p class="text-[0.65rem] text-muted-foreground leading-relaxed line-clamp-1">
								{truncateContent(deletedPrompt.content)}
							</p>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
						<!-- Restore Button -->
						<Button
							variant="ghost"
							size="sm"
							class="h-5 w-5 p-0 hover:bg-green-100 dark:hover:bg-green-900 text-green-600"
							onclick={() => props.onRestore(deletedPrompt.id)}
							disabled={props.isOperating}
							title="Restore prompt"
						>
							<RotateCcw class="h-3 w-3" />
						</Button>

						<!-- Permanent Delete Button -->
						<Button
							variant="ghost"
							size="sm"
							class="h-5 w-5 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
							onclick={() => handlePermanentDeleteClick(deletedPrompt.id)}
							disabled={props.isOperating}
							title="Delete permanently"
						>
							<Trash2 class="h-3 w-3" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<!-- Permanent Delete Confirmation -->
<AlertDialog.Root open={!!permanentDeleteId} onOpenChange={(open) => !open && (permanentDeleteId = null)}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Permanently?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete the prompt. This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action 
				onclick={confirmPermanentDelete}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
			>
				Delete Forever
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Restore All Deleted Prompts Confirmation -->
<AlertDialog.Root open={showRestoreAllDialog} onOpenChange={(open) => !open && (showRestoreAllDialog = false)}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Restore All Deleted Prompts?</AlertDialog.Title>
			<AlertDialog.Description>
				This will restore all {props.deletedPrompts.length} deleted prompts back to your active library.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action 
				onclick={confirmRestoreAll}
				class="bg-green-600 text-white hover:bg-green-700"
			>
				Restore All ({props.deletedPrompts.length})
			</AlertDialog.Action>
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
</style>