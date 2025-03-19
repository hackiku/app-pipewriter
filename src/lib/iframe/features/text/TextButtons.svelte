<!-- $lib/iframe/features/text/TextButtons.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Loader2, Pipette, RefreshCw, Moon, Sun } from "lucide-svelte";
  import ElementCard from "../dropper/ElementCard.svelte";
  import { elementManager } from '$lib/data/addon/utils';
  import type { ElementTheme } from '$lib/data/addon/types';

  // Props
  const props = $props<{
    isProcessing: boolean;
    selectedStyle: any;
    theme: ElementTheme;
    onStyleGuideInsert: () => void;
    onApplyStyle: () => void;
    onResetStyle: () => void;
    onToggleTheme: () => void;
  }>();
  
  // Get the styleguide element
  const styleGuideElement = $state(elementManager.getElement("styleguide"));
</script>

<div class="flex gap-4">
  <!-- Left Column: Style Guide Element Card -->
  <div class="w-1/3">
    {#if styleGuideElement}
      <ElementCard
        element={styleGuideElement}
        onSelect={props.onStyleGuideInsert}
        theme={props.theme}
        disabled={props.isProcessing}
        isSelected={false}
      />
    {:else}
      <div class="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span class="text-muted-foreground">Style guide not found</span>
      </div>
    {/if}
  </div>
  
  <!-- Right Column: Action Buttons -->
  <div class="w-3/5 flex flex-col gap-2">
    <!-- Apply Style Button -->
    <Button
      variant={props.selectedStyle ? "default" : "outline"}
      class="h-10 text-sm w-full flex items-center gap-2"
      disabled={props.isProcessing || !props.selectedStyle}
      onclick={props.onApplyStyle}
    >
      {#if props.isProcessing}
        <Loader2 class="h-4 w-4 animate-spin mr-1" />
        Applying...
      {:else}
        <Pipette class="h-4 w-4 mr-1" />
        {props.selectedStyle ? `Apply ${props.selectedStyle.label}` : 'Select style'}
      {/if}
    </Button>
    
    <!-- Theme Toggle Button -->
    <div class="flex flex-row gap-2">
			<Button
				variant="outline"
				class="aspect-square text-sm flex items-center gap-2"
				disabled={props.isProcessing}
				onclick={props.onToggleTheme}
			>
				{#if props.theme === 'light'}
					<Moon class="h-4 w-4 mr-1" />
				{:else}
					<Sun class="h-4 w-4 mr-1" />
				{/if}
			</Button>
			
			<!-- Reset Button (only shown when a style is selected) -->
			{#if props.selectedStyle}
				<Button
					variant="outline"
					class="text-sm w-full flex items-center gap-2"
					disabled={props.isProcessing}
					onclick={props.onResetStyle}
				>
					<RefreshCw class="h-4 w-4 mr-1" />
					Reset
				</Button>
			{/if}
		</div>
  </div>
</div>