<!-- $lib/iframe/features/text/TextTab.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import TextStyleDropdown from "./TextStyleDropdown.svelte";
  import TextButtons from "./TextButtons.svelte";
  
  // Props
  const { context } = $props();
  
  // State
  let isProcessing = $state(false);
  let showDeleteConfirm = $state(false);
  let selectedStyle = $state(null);
  let savedStyles = $state([]);
  let theme = $state('light');
  
  const dispatch = createEventDispatcher();

  async function handleStyleGuideInsert() {
    if (isProcessing) return;
    isProcessing = true;
    dispatch("processingStart");
    
    dispatch("status", {
      type: "processing",
      message: "Inserting style guide..."
    });

    try {
      const appsScript = context?.appsScript;
      
      if (!appsScript) {
        throw new Error("AppsScript client not available");
      }
      
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

  async function handleStyleSelect(event) {
    selectedStyle = event.detail;
    showDeleteConfirm = false;
  }
  
  function handleSaveStyle() {
    // Save style logic
    savedStyles = [...savedStyles, selectedStyle];
  }
  
  function handleApplyStyle() {
    // Apply style logic
  }

  function handleDeleteAll() {
    savedStyles = [];
    selectedStyle = null;
    showDeleteConfirm = false;
  }
  
  function handleDeleteStyle(style) {
    savedStyles = savedStyles.filter(s => s.id !== style.id);
    if (selectedStyle && selectedStyle.id === style.id) {
      selectedStyle = null;
    }
  }
</script>

<div class="flex flex-col items-stretch w-full gap-2">
  <!-- Styles Dropdown -->
  <div class="relative">
    <TextStyleDropdown
      {selectedStyle}
      {savedStyles}
      disabled={isProcessing}
      on:select={handleStyleSelect}
      on:deleteStyle={e => handleDeleteStyle(e.detail)}
    />
  </div>

  <!-- Buttons Section -->
  <div class="relative">
    <TextButtons
      {isProcessing}
      {showDeleteConfirm}
      {selectedStyle}
      savedCount={savedStyles.length}
      {theme}
      on:insertStyleGuide={handleStyleGuideInsert}
      on:save={handleSaveStyle}
      on:apply={handleApplyStyle}
      on:deleteAll={handleDeleteAll}
      on:toggleDeleteConfirm={() => showDeleteConfirm = !showDeleteConfirm}
    />
  </div>
</div>