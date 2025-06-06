<!-- $lib/iframe/features/text/StyleDropper.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";
  import { Moon, Sun } from "@lucide/svelte";
  import ElementCard from "../dropper/ElementCard.svelte";
  import { elementManager } from '$lib/data/addon/utils';
  import type { ElementTheme } from '$lib/types/elements';

  // Props
  const props = $props<{
    isProcessing: boolean;
    theme: ElementTheme;
    onStyleGuideInsert: () => void;
    onToggleTheme: () => void;
  }>();
  
  // Local state
  let styleMode = $state("local");
  
  // Get the styleguide element
  const styleGuideElement = $state(elementManager.getElement("styleguide"));
  
  // Handle style mode change
  function handleStyleModeChange(value) {
    styleMode = value;
  }
</script>

<div class="flex flex-col h-full">
  <!-- Element Card (takes most of the height) -->
  <div class="flex-1">
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
  
  <!-- Controls Row (smaller height) -->
  <div class="flex justify-between items-center h-6 px-1">
    <!-- Theme Toggle Button -->
    <Button
      variant="ghost"
      size="icon"
      class="h-5 w-5"
      disabled={props.isProcessing}
      onclick={props.onToggleTheme}
      title={props.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {#if props.theme === 'light'}
				<Sun class="h-3 w-3" />
      {:else}
				<Moon class="h-3 w-3" />
      {/if}
    </Button>
    
    <!-- Spacer to push select to the right -->
    <div class="flex-grow"></div>
    
    <!-- Style Mode Select -->
    <div class="w-11">
      <Select.Root 
        type="single" 
        value={styleMode}
        onValueChange={handleStyleModeChange} 
        disabled={props.isProcessing}
      >
        <Select.Trigger class="h-6 text-[0.6em] bg-transparent border-0 p-0 w-full px-1 justify-end">
          {styleMode === "local" ? "local" : "base"}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="local" class="text-xs">Local</Select.Item>
          <Select.Item value="original" class="text-xs">Base</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  </div>
</div>