<!-- src/lib/iframe/features/text/TextButtons.svelte -->

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Save, Heading, Trash2, Sun, Moon } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import type { ElementTheme } from '$lib/data/addon/types';
  
  // Props with SvelteKit 5 syntax
  const props = $props<{
    isProcessing: boolean;
    showDeleteConfirm: boolean;
    selectedStyle: any;
    savedCount: number;
    theme: ElementTheme;
  }>();
  
  const dispatch = createEventDispatcher();

  // Computed state
  let applyButtonDisabled = $derived(
    !props.selectedStyle || props.isProcessing
  );
  
  function dispatchEvent(event: string) {
    dispatch(event);
  }
  
  function getThemeIcon() {
    return props.theme === 'light' ? Moon : Sun;
  }
</script>

<div class="flex items-start gap-2">
  <!-- Theme Button and Style Guide -->
  <div class="w-2/5 h-full">
    <Button
      variant="outline"
      class="h-8 text-xs w-full mb-1 flex items-center gap-2"
      disabled={props.isProcessing}
      on:click={() => dispatch('insertStyleGuide')}
    >
      <Heading class="h-3 w-3" />
      Insert Style Guide
    </Button>
    
    <Button
      variant="outline"
      class="h-8 text-xs w-full flex items-center gap-2"
      disabled={props.isProcessing}
      on:click={() => dispatch('toggleTheme')}
    >
      <svelte:component this={getThemeIcon()} class="h-3 w-3" />
      {props.theme === 'light' ? 'Dark' : 'Light'} Theme
    </Button>
  </div>

  <!-- Action Buttons -->
  <div class="flex flex-col w-3/5 gap-1">
    <!-- Save Button -->
    <Button
      variant="outline"
      class="h-8 text-xs w-full flex items-center gap-2"
      disabled={props.isProcessing || !props.selectedStyle}
      on:click={() => dispatchEvent('save')}
    >
      <Save class="h-3 w-3" />
      Save selection
    </Button>

    <!-- Apply Style Row -->
    <div class="flex gap-1">
      {#if props.savedCount > 0 && !props.showDeleteConfirm}
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          disabled={props.isProcessing}
          on:click={() => dispatch('toggleDeleteConfirm')}
        >
          <Trash2 class="h-3 w-3" />
        </Button>
      {/if}

      <Button
        variant="outline"
        class="h-8 text-xs flex-1 flex items-center gap-2"
        disabled={applyButtonDisabled && !props.showDeleteConfirm}
        on:click={() => dispatch(props.showDeleteConfirm ? 'deleteAll' : 'apply')}
      >
        {#if props.showDeleteConfirm}
          Delete all styles?
        {:else}
          <Heading class="h-3 w-3" />
          Apply style
        {/if}
      </Button>
    </div>
  </div>
</div>