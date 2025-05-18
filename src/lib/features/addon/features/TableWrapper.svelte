<!-- src/lib/features/addon/features/TableWrapper.svelte -->
<script lang="ts">
  import { Table2, Pipette, Save, Loader2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import Interactive from "./table/interactive/index.svelte";
  import { resetState } from "./table/tableContext.svelte.ts";
  import { updateTableConfig, getAppsScriptConfig, getTableConfig } from "./table/tableContext.svelte.ts";
  
  // Get any props passed from parent
  const props = $props<{
    context?: any;
    onStatusUpdate?: (status: any) => void;
    onProcessingStart?: () => void;
    onProcessingEnd?: () => void;
  }>();
  
  // Local processing state
  let isProcessing = $state(false);
  
  // Get current table properties from the document
  function getTableProperties() {
    console.log("Getting current table properties from document");
    isProcessing = true;
    
    if (props.onProcessingStart) props.onProcessingStart();
    if (props.onStatusUpdate) props.onStatusUpdate({
      type: 'processing',
      message: 'Getting table properties...'
    });
    
    // Simulate API call to Google Apps Script
    setTimeout(() => {
      // Mock response from Google Docs API
      updateTableConfig({
        alignment: {
          tableAlignment: "left",
          cellVerticalAlignment: "top"
        }
      });
      
      resetState();
      console.log("Retrieved table properties");
      isProcessing = false;
      
      if (props.onProcessingEnd) props.onProcessingEnd();
      if (props.onStatusUpdate) props.onStatusUpdate({
        type: 'success',
        message: 'Table properties retrieved'
      });
    }, 800);
  }
  
  // Apply changes to the actual table
  function applyChanges() {
    // Here we would call the Google Docs API to update the table
    const appsScriptConfig = getAppsScriptConfig();
    console.log("Applying table changes to Apps Script:", appsScriptConfig);
    isProcessing = true;
    
    if (props.onProcessingStart) props.onProcessingStart();
    if (props.onStatusUpdate) props.onStatusUpdate({
      type: 'processing',
      message: 'Applying table properties...'
    });
    
    // Simulate API call
    setTimeout(() => {
      console.log("Table properties applied");
      isProcessing = false;
      
      if (props.onProcessingEnd) props.onProcessingEnd();
      if (props.onStatusUpdate) props.onStatusUpdate({
        type: 'success',
        message: 'Table properties applied'
      });
    }, 800);
  }
</script>

<div class="w-full flex flex-col gap-4">
  <!-- Interactive table component -->
  <Interactive />
  
  <!-- Button row -->
  <div class="flex justify-between items-center w-full">
    <Button 
      variant="secondary" 
      onclick={getTableProperties}
      class="flex items-center gap-2"
      disabled={isProcessing}
    >
      {#if isProcessing}
        <Loader2 class="h-4 w-4 animate-spin" />
        <span>Getting...</span>
      {:else}
        <Pipette class="h-4 w-4" />
        <span>Get</span>
      {/if}
    </Button>
    
    <Button 
      variant="default" 
      onclick={applyChanges}
      class="flex items-center gap-2"
      disabled={isProcessing}
    >
      {#if isProcessing}
        <Loader2 class="h-4 w-4 animate-spin" />
        <span>Applying...</span>
      {:else}
        <Save class="h-4 w-4" />
        <span>Apply</span>
      {/if}
    </Button>
  </div>
</div>