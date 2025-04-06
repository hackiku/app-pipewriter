<!-- src/lib/features/addon/features/Table.svelte -->
<script lang="ts">
  import { Table2, Pipette, Save } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import Interactive from "./table/interactive/index.svelte";
  import { getTableConfig, updateTableConfig, getAppsScriptConfig } from "./table/data.svelte";
  import { resetState } from "./table/tableContext.svelte";
  
  // Local processing state
  let isProcessing = $state(false);
  
  // Get table configuration from store
  let tableConfig = $derived(getTableConfig());
  
  // Get current table properties from the document
  function getTableProperties() {
    console.log("Getting current table properties from document");
    isProcessing = true;
    
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
    }, 800);
  }
  
  // Apply changes to the actual table
  function applyChanges() {
    // Here we would call the Google Docs API to update the table
    const appsScriptConfig = getAppsScriptConfig();
    console.log("Applying table changes to Apps Script:", appsScriptConfig);
    isProcessing = true;
    
    // Simulate API call
    setTimeout(() => {
      console.log("Table properties applied");
      isProcessing = false;
    }, 800);
  }
</script>

<!-- <div class="w-full ___p-6 flex flex-col gap-6 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-700"> -->
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
      <Pipette class="h-4 w-4" />
      <span>{isProcessing ? 'Getting...' : 'Get'}</span>
    </Button>
    
    <Button 
      variant="default" 
      onclick={applyChanges}
      class="flex items-center gap-2"
      disabled={isProcessing}
    >
      <Save class="h-4 w-4" />
      <span>{isProcessing ? 'Applying...' : 'Apply'}</span>
    </Button>
  </div>
</div>