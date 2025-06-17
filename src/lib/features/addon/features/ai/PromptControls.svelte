<!-- src/lib/features/addon/features/ai/PromptControls.svelte -->
<script lang="ts">
	import { Copy, Edit, ArrowLeft, Play, Save, Trash2, Check } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";

	const props = $props<{
		onBack?: () => void;
		onCopy?: () => void;
		onDrop?: () => void;
		onSave?: () => void;
		onEdit?: () => void;
		onDelete?: () => void;
		disabled?: boolean;
		mode?: 'view' | 'edit';
	}>();

	// Copy confirmation state
	let copyConfirmed = $state(false);

	async function handleCopy() {
		if (props.onCopy) {
			await props.onCopy();
			
			// Show confirmation
			copyConfirmed = true;
			setTimeout(() => {
				copyConfirmed = false;
			}, 2000);
		}
	}
</script>

<div class="flex items-center gap-2 p-2 border-t bg-muted/20">
	<!-- Back Button -->
	{#if props.onBack}
		<Button 
			variant="ghost" 
			size="sm" 
			class="h-7 w-7 p-0"
			onclick={props.onBack}
			disabled={props.disabled}
		>
			<ArrowLeft class="h-3 w-3" />
		</Button>
	{/if}

	{#if props.mode === 'edit'}
		<!-- Edit Mode: Delete (left) + Save (right) -->
		<div class="flex items-center gap-1">
			{#if props.onDelete}
				<Button 
					variant="outline" 
					size="sm" 
					class="h-7 w-7 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
					onclick={props.onDelete}
					disabled={props.disabled}
					title="Delete prompt"
				>
					<Trash2 class="h-3 w-3" />
				</Button>
			{/if}
		</div>

		<div class="ml-auto flex items-center gap-1">
			{#if props.onSave}
				<Button 
					size="sm" 
					class="h-7 px-3 gap-1"
					onclick={props.onSave}
					disabled={props.disabled}
				>
					<Save class="h-3 w-3" />
					<span class="text-xs">Save</span>
				</Button>
			{/if}
		</div>
	{:else}
		<!-- View Mode: Edit (left) + Copy + Drop (right) -->
		<div class="flex items-center gap-1">
			{#if props.onEdit}
				<Button 
					variant="outline" 
					size="sm" 
					class="h-7 px-2 gap-1"
					onclick={props.onEdit}
					disabled={props.disabled}
				>
					<Edit class="h-3 w-3" />
					<span class="text-xs">Edit</span>
				</Button>
			{/if}
		</div>

		<div class="ml-auto flex items-center gap-1">
			{#if props.onCopy}
				<Button 
					variant="secondary" 
					size="sm" 
					class="h-7 w-7 p-0 transition-all duration-200"
					onclick={handleCopy}
					disabled={props.disabled}
				>
					{#if copyConfirmed}
						<Check class="h-3 w-3 text-green-600" />
					{:else}
						<Copy class="h-3 w-3" />
					{/if}
				</Button>
			{/if}
			
			{#if props.onDrop}
				<Button 
					size="sm" 
					class="h-7 px-2 gap-1"
					onclick={props.onDrop}
					disabled={props.disabled}
				>
					<Play class="h-3 w-3" />
					<span class="text-xs">Drop</span>
				</Button>
			{/if}
		</div>
	{/if}
</div>