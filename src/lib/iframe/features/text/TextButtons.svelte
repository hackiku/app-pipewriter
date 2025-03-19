<!-- $lib/iframe/features/text/TextButtons.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Pipette, RefreshCw, Moon, Sun, Heading } from "lucide-svelte";
  import ElementCard from "../dropper/ElementCard.svelte";
  import { elementManager } from '$lib/data/addon/utils';
  import type { ElementTheme } from '$lib/data/addon/types';

  // Props
  const props = $props<{
    isProcessing: boolean;
    selectedStyle: any;
    theme: ElementTheme;
    layout: 'left' | 'right';
    onStyleGuideInsert: () => void;
    onExtractStyle: () => void;
    onApplyStyle: () => void;
    onResetStyle: () => void;
    onToggleTheme: () => void;
  }>();
  
  // Get the styleguide element
  const styleGuideElement = $state(elementManager.getElement("styleguide"));
</script>

{#if props.layout === 'left'}
  <!-- Left Pane - ElementCard -->
  <div class="w-full h-full">
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
{:else}
  <!-- Right Pane - Buttons Layout with Flex Rows -->
  <div class="w-full h-full flex flex-col gap-2">
    <!-- Row 1: Extract Style & Reset -->
    <div class="flex gap-2 h-[46px]">
      <Button
        variant="outline"
        class="h-full flex-1 flex items-center justify-center"
        disabled={props.isProcessing}
        onclick={props.onExtractStyle}
      >
        <Pipette class="h-4 w-4 mr-2" />
        <span>Extract Style</span>
      </Button>
      
      <Button
        variant="outline"
        class="h-full aspect-square"
        disabled={props.isProcessing || !props.selectedStyle}
        onclick={props.onResetStyle}
        title="Reset style selection"
      >
        <RefreshCw class="h-4 w-4" />
      </Button>
    </div>
    
    <!-- Row 2: Theme Toggle & Apply -->
    <div class="flex gap-2 h-[46px]">
      <Button
        variant="outline"
        class="h-full aspect-square"
        disabled={props.isProcessing}
        onclick={props.onToggleTheme}
        title={props.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      >
        {#if props.theme === 'light'}
          <Moon class="h-4 w-4" />
        {:else}
          <Sun class="h-4 w-4" />
        {/if}
      </Button>
      
      <Button
        variant={props.selectedStyle ? "default" : "outline"}
        class="h-full flex-1 flex items-center justify-center"
        disabled={props.isProcessing || !props.selectedStyle}
        onclick={props.onApplyStyle}
      >
        <Heading class="h-4 w-4 mr-2" />
        <span>Apply Style</span>
      </Button>
    </div>
  </div>
{/if}