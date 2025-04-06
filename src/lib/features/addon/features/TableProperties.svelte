<!-- src/lib/iframe/features/TableProperties.svelte -->
<script lang="ts">
  import TableAlignment from "./table/TableAlignment.svelte";
  import TableDimensions from "./table/TableDimensions.svelte";
  import TablePreview from "./table/TablePreview.svelte";
  import ButtonRow from "./table/ButtonRow.svelte";
  
  // State using Svelte 5 runes
  let tableState = $state({
    alignment: {
      tableAlignment: "center",
      cellVerticalAlignment: "middle"
    },
    dimensions: {
      columns: 2,
      rows: 2,
      columnWidth: 2.5,
      rowHeight: 0.75
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
  
  // Update dimensions settings
  function updateDimensions(dimensions) {
    tableState.dimensions = dimensions;
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

<div class="w-full p-3 flex flex-col gap-6 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-700">
  <!-- Header section -->
  <!-- <div class="flex items-center gap-2 mb-2">
    <Table2 class="h-5 w-5" />
    <h3 class="text-lg font-medium">Table Properties</h3>
  </div> -->
  
  <!-- Shared preview that updates based on all settings -->

  <!-- TableAlignment component -->
  <div class="grid grid-cols-2 gap-3">
    <TableAlignment 
      values={tableState.alignment} 
      onUpdate={updateAlignment} 
    />
	
		<TablePreview 
			tableAlignment={tableState.alignment.tableAlignment}
			cellVerticalAlignment={tableState.alignment.cellVerticalAlignment}
			columns={tableState.dimensions.columns}
			rows={tableState.dimensions.rows}
		/>
  </div>
  
	<TableDimensions
		values={tableState.dimensions}
		onUpdate={updateDimensions}
	/>
  
  <!-- Borders component (commented out for now) -->
  <!-- <div class="mb-4">
    <div class="text-sm font-medium mb-3">Table Borders</div>
    <TableBorders
      values={tableState.borders}
      onUpdate={updateBorders}
    />
  </div> -->
  
  <!-- Button row -->
  <ButtonRow 
    onGet={getTableProperties}
    onApply={applyChanges}
  />
</div>