<!-- src/lib/features/addon/features/table/interactive/index.svelte -->
<script lang="ts">
  import TableMockup from "./TableMockup.svelte";
  import AlignmentControls from "./AlignmentControls.svelte";
  import { cn } from "$lib/utils";
  
  // Props using Svelte 5 runes
  const props = $props<{
    alignment: {
      tableAlignment: string;
      cellVerticalAlignment: string;
    };
    dimensions: {
      columns: number;
      rows: number;
    };
    onAlignmentChange: (alignment: any) => void;
  }>();
  
  // Local reactive state for hover preview
  let hoveredAlignment = $state<{
    tableAlignment?: string;
    cellVerticalAlignment?: string;
  } | null>(null);
  
  // Handle click on alignment position
  function handleAlignmentChange(position: {horizontal?: string, vertical?: string}) {
    const newAlignment = {
      tableAlignment: position.horizontal || props.alignment.tableAlignment,
      cellVerticalAlignment: position.vertical || props.alignment.cellVerticalAlignment
    };
    
    props.onAlignmentChange(newAlignment);
  }
  
  function handleMouseEnter(position: {horizontal?: string, vertical?: string}) {
    hoveredAlignment = position;
  }
  
  function handleMouseLeave() {
    hoveredAlignment = null;
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Interactive Table Mockup -->
  <TableMockup 
    tableAlignment={props.alignment.tableAlignment}
    cellVerticalAlignment={props.alignment.cellVerticalAlignment}
    rows={props.dimensions.rows}
    hoveredAlignment={hoveredAlignment}
  />
  
  <!-- Alignment Controls -->
  <AlignmentControls 
    currentAlignment={props.alignment}
    onAlignmentChange={handleAlignmentChange}
    onHoverStart={handleMouseEnter}
    onHoverEnd={handleMouseLeave}
  />
</div>