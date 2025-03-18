<!-- $lib/iframe/features/text/TextTab.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { elementsTheme } from "../../stores";
  import { textStyles, selectedStyle as selectedStyleStore, type TextStyle } from "../../stores/textStyles";
  import TextStyleDropdown from "./TextStyleDropdown.svelte";
  import TextButtons from "./TextButtons.svelte";
  import ComingSoon from "../../components/ComingSoon.svelte";

  export let appsScript: any;
  const dispatch = createEventDispatcher();
  let isProcessing = false;
  let showDeleteConfirm = false;
  let showDropdown = false;

  async function handleStyleGuideInsert() {
    if (isProcessing) return;
    isProcessing = true;
    dispatch("processingStart");
    
    dispatch("status", {
      type: "processing",
      message: "Inserting style guide..."
    });

    try {
      const response = await appsScript.sendMessage("getElement", { 
        elementId: "styleguide" 
      });
      
      if (response.success) {
        dispatch("status", {
          type: "success",
          message: "Style guide inserted",
          executionTime: response.executionTime
        });
      } else {
        throw new Error(response.error || "Failed to insert style guide");
      }
    } catch (error) {
      dispatch("status", {
        type: "error",
        message: error instanceof Error ? error.message : "Failed to insert style guide"
      });
    } finally {
      isProcessing = false;
      dispatch("processingEnd");
    }
  }

  async function handleStyleSelect(event: CustomEvent<TextStyle>) {
    selectedStyleStore.set(event.detail);
    showDeleteConfirm = false;
  }

  function handleDeleteAll() {
    textStyles.deleteAll();
    selectedStyleStore.set(null);
    showDeleteConfirm = false;
  }
</script>

<div class="flex flex-col items-stretch w-full gap-2">
  <!-- Styles Dropdown with ComingSoon -->
  <div class="relative">
    <TextStyleDropdown
      selectedStyle={$selectedStyleStore}
      disabled={isProcessing}
      on:select={handleStyleSelect}
      bind:showDropdown
    />
    <!-- {#if showDropdown} -->
      <ComingSoon
        title="Save styles (Soon)"
        position="full"
      />
    <!-- {/if} -->
  </div>

  <!-- Buttons Section with ComingSoon -->
  
	<div class="relative">
    <TextButtons
      {isProcessing}
      {showDeleteConfirm}
      selectedStyle={$selectedStyleStore}
      savedCount={$textStyles.filter(s => s.saved).length}
      theme={$elementsTheme}
      on:insertStyleGuide={handleStyleGuideInsert}
      on:deleteAll={handleDeleteAll}
      on:toggleDeleteConfirm={() => showDeleteConfirm = !showDeleteConfirm}
    />
    <!-- <ComingSoon 
      title="Style Commands"
      position="full"
    /> -->
  </div>
</div>