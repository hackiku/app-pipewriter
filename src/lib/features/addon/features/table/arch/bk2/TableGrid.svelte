<!-- src/lib/features/addon/features/table/TableGrid.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { onMount } from "svelte";
  import { getTableConfig } from "./data.svelte";
  import { 
    columnWidths,
    syncSelectedPositionWithConfig
  } from "./tableContext.svelte";
  import { AlignStartVertical, AlignCenterVertical, AlignEndVertical } from "lucide-svelte";
  import { handleVerticalAlignmentSelect } from "./tableContext.svelte";
  import TableCell from "./TableCell.svelte";
  
  // Local state
  let tableConfig = $derived(getTableConfig());
  
  // Initialize selected position based on current config
  onMount(() => {
    syncSelectedPositionWithConfig();
  });
  
  // Vertical alignment options
  const verticalAlignments = [
    { value: "top", icon: AlignStartVertical, label: "Top align" },
    { value: "middle", icon: AlignCenterVertical, label: "Middle align" },
    { value: "bottom", icon: AlignEndVertical, label: "Bottom align" }
  ];
  
  // Get vertical alignment button class
  function getVerticalAlignClass(value: string) {
    const isSelected = tableConfig.alignment.cellVerticalAlignment === value;
    return cn(
      "flex h-8 w-8 items-center justify-center transition-all duration-150",
      "rounded-md border",
      isSelected 
        ? "bg-primary/10 border-primary text-primary" 
        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
    );
  }
  
  // Get table alignment class
  function getTableAlignClass() {
    switch (tableConfig.alignment.tableAlignment) {
      case "left": return "justify-start";
      case "center": return "justify-center";
      case "right": return "justify-end";
      default: return "justify-center";
    }
  }
</script>

<div class="space-y-4">
  <!-- Table Container -->
  <div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
    <!-- Alignment Container -->
    <div class={cn("flex w-full transition-all duration-150", getTableAlignClass())}>
      <!-- Table with border styling -->
      <div class="border border-neutral-300 dark:border-neutral-600 w-full overflow-hidden rounded-sm shadow-sm">
        <!-- Table Row -->
        <div class="grid" style="grid-template-columns: {columnWidths.map(w => w + '%').join(' ')}">
          <!-- Generate 3 columns -->
          {#each [0, 1, 2] as col}
            <div class={cn(
              "border-neutral-300 dark:border-neutral-600",
              col < 2 && "border-r"
            )}>
              <!-- Table Cell Component -->
              <TableCell 
                position={{ row: 0, col }} 
                cellVerticalAlignment={tableConfig.alignment.cellVerticalAlignment}
              />
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Vertical Alignment Controls -->
  <div class="flex justify-center gap-2">
    {#each verticalAlignments as align}
      <button 
        class={getVerticalAlignClass(align.value)}
        onclick={() => handleVerticalAlignmentSelect(align.value)}
        title={align.label}
      >
        <svelte:component this={align.icon} class="h-4 w-4" />
      </button>
    {/each}
  </div>
</div>