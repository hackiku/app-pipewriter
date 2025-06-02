<!-- src/lib/features/addon/features/ai/PromptControls.svelte -->
<script lang="ts">
	import { Copy, Plus, ArrowLeft, Play, Edit } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";

	const props = $props<{
		onBack?: () => void;
		onCopy?: () => void;
		onDrop?: () => void;
		onSave?: () => void;
		onEdit?: () => void;
		includeCode?: boolean;
		onIncludeCodeChange?: (value: boolean) => void;
		disabled?: boolean;
		mode?: 'view' | 'edit'; // view = copy/drop/edit, edit = save/drop
		showCodeOption?: boolean;
	}>();

	let includeCode = $state(props.includeCode || false);

	function handleIncludeCodeChange() {
		includeCode = !includeCode;
		props.onIncludeCodeChange?.(includeCode);
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

	<!-- Code Option Checkbox -->
	{#if props.showCodeOption}
		<div class="flex items-center space-x-2">
			<Checkbox 
				id="include-code"
				checked={includeCode}
				onCheckedChange={handleIncludeCodeChange}
				disabled={props.disabled}
			/>
			<label 
				for="include-code" 
				class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Context
			</label>
		</div>
	{/if}

	<!-- Right Side Actions -->
	<div class="ml-auto flex items-center gap-1">
		{#if props.mode === 'edit'}
			<!-- Edit Mode: Save + Drop -->
			{#if props.onSave}
				<Button 
					variant="outline" 
					size="sm" 
					class="h-7 px-2"
					onclick={props.onSave}
					disabled={props.disabled}
				>
					<span class="text-xs">Save</span>
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
		{:else}
			<!-- View Mode: Copy + Edit + Drop -->
			{#if props.onEdit}
				<Button 
					variant="outline" 
					size="sm" 
					class="h-7 w-7 p-0"
					onclick={props.onEdit}
					disabled={props.disabled}
				>
					<Edit class="h-3 w-3" />
				</Button>
			{/if}
			
			{#if props.onCopy}
				<Button 
					variant="secondary" 
					size="sm" 
					class="h-7 w-7 p-0"
					onclick={props.onCopy}
					disabled={props.disabled}
				>
					<Copy class="h-3 w-3" />
				</Button>
			{/if}
			
			{#if props.onDrop}
				<Button 
					size="sm" 
					class="h-7 px-2 gap-1"
					onclick={props.onDrop}
					disabled={props.disabled}
				>
					<Plus class="h-3 w-3" />
					<span class="text-xs">Drop</span>
				</Button>
			{/if}
		{/if}
	</div>
</div>