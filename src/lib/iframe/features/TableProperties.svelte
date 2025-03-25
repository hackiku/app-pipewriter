<!-- src/lib/iframe/features/TableProperties.svelte -->
<script lang="ts">
  import { Table2 } from "lucide-svelte";
  import TableAlignment from "./table/TableAlignment.svelte";
  import ButtonRow from "./table/ButtonRow.svelte";
  
  // State using Svelte 5 runes
  let tableState = $state({
    alignment: {
      tableAlignment: "center",
      cellVerticalAlignment: "middle"
    },
    borders: {
      width: 1,
      color: "#000000",
      style: "solid"
    }
  });
  
  // Update alignment settings
  function updateAlignment(alignment) {
    tableState.alignment = alignment;
  }
  
  // Update border settings
  function updateBorders(borders) {
    tableState.borders = borders;
  }
  
  // Get current table properties from the document
  function getTableProperties() {
    console.log("Getting current table properties from document");
    // TODO: Implement actual API call to get properties
    // For now, just log that we're trying to get properties
  }
  
  // Apply changes to the actual table
  function applyChanges() {
    // Here we would call the Google Docs API to update the table
    console.log("Applying table changes:", tableState);
    // TODO: Implement the actual API call
  }
</script>

<div class="w-full p-3 flex flex-col gap-3
						shadow-sm __bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
  <!-- <div class="flex items-center gap-2 mb-4">
    <Table2 class="h-5 w-5" />
    <h3 class="text-lg font-medium">Table Properties</h3>
  </div> -->

  <!-- TableAlignment component -->
	<TableAlignment 
		values={tableState.alignment} 
		onUpdate={updateAlignment} 
	/>
  
	<!-- <TableBorders
		values={tableState.borders}
		onUpdate={updateBorders}
	/> -->
  
	<ButtonRow 
		onGet={getTableProperties}
		onApply={applyChanges}
	/>
</div>