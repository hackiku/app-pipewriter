<!-- src/lib/features/addon/features/table/interactive/index.svelte -->
<script lang="ts">
  import InteractiveTable from "./InteractiveTable.svelte";
  import { resetState } from "../tableContext.svelte";
  
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
</script>

<InteractiveTable />