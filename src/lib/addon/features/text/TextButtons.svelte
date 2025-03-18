<!-- src/lib/iframe/features/text/TextButtons.svelte -->

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Save, Heading, Trash2, Type } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import ElementCard from "../../components/ElementCard.svelte";
  import { getElement } from "../../elements";
  import { themeStore, type ThemeType } from "../../stores/themeStore";

  export let isProcessing = false;
  export let showDeleteConfirm = false;
  export let selectedStyle: any = null;
  export let savedCount = 0;

  const dispatch = createEventDispatcher();
  const elementId = "styleguide";
  const element = getElement(elementId);

  function dispatchEvent(event: string) {
    dispatch(event);
  }

  $: applyButtonDisabled = !selectedStyle || isProcessing;
</script>

<div class="flex items-start gap-2">
  <!-- Style Guide Card -->
  <div class="w-2/5 h-full">
    {#if element}
      <ElementCard
        {element}
        onSelect={() => dispatchEvent('insertStyleGuide')}
        theme={$themeStore}
      />
    {:else}
      <div class="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span class="text-muted-foreground">Style guide not found</span>
      </div>
    {/if}
  </div>

  <!-- Action Buttons -->
  <div class="flex flex-col w-3/5 gap-1">
    <!-- Save Button -->
    <Button
      variant="outline"
      class="h-6 text-xs w-full flex items-center gap-2"
      disabled={isProcessing}
      on:click={() => dispatchEvent('save')}
    >
      <Save class="h-3 w-3" />
      Save selection
    </Button>

    <!-- Apply Style Row -->
    <div class="flex gap-1">
      {#if savedCount > 0 && !showDeleteConfirm}
        <Button
          variant="outline"
          size="icon"
          class="h-6 w-6"
          on:click={() => dispatch('toggleDeleteConfirm')}
        >
          <Trash2 class="h-3 w-3" />
        </Button>
      {/if}

      <Button
        variant="outline"
        class="h-6 text-xs flex-1 flex items-center gap-2"
        disabled={applyButtonDisabled && !showDeleteConfirm}
        on:click={() => dispatch(showDeleteConfirm ? 'deleteAll' : 'apply')}
      >
        {#if showDeleteConfirm}
          Delete all styles?
        {:else}
          <Heading class="h-3 w-3" />
          Apply style
        {/if}
      </Button>
    </div>
  </div>
</div>