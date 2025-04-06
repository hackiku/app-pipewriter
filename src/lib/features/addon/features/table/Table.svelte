<!-- src/lib/features/addon/features/table/Table.svelte -->
<script lang="ts">
  import { Table2 } from "lucide-svelte";
  import TableGrid from "./TableGrid.svelte";
  import ButtonRow from "./ButtonRow.svelte";
  import {
    getTableConfig,
    updateTableConfig,
    getAppsScriptConfig,
    resetState
  } from "./index";
  
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

<div class="w-full p-6 flex flex-col gap-6 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-700">
  <!-- Header section -->
  <div class="flex items-center gap-2 mb-0">
    <Table2 class="h-5 w-5" />
    <h3 class="text-sm font-medium">Table Alignment</h3>
  </div>
  
  <!-- Table Grid Component -->
  <TableGrid />
  
  <!-- Button Row Component -->
  <ButtonRow 
    onGet={getTableProperties}
    onApply={applyChanges}
    isProcessing={isProcessing}
  />
</div>