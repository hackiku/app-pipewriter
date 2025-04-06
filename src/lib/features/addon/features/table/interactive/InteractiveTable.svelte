<!-- src/lib/features/addon/features/table/interactive/InteractiveTable.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { onMount } from "svelte";
  import { getTableConfig, updateTableConfig } from "../data.svelte";
  import { 
    handleHover, 
    handleSelect, 
    handleVerticalAlignmentSelect,
    isPositionHovered, 
    isPositionSelected,
    columnWidths,
    getHorizontalAlignmentForColumn,
    syncSelectedPositionWithConfig,
    resetState
  } from "../tableContext.svelte";
  import { AlignStartVertical, AlignCenterVertical, AlignEndVertical } from "lucide-svelte";
  
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
  
  // Get cell alignment class
  function getCellAlignClass() {
    switch (tableConfig.alignment.cellVerticalAlignment) {
      case "top": return "items-start";
      case "middle": return "items-center";
      case "bottom": return "items-end";
      default: return "items-center";
    }
  }
  
  // Content elements for each cell
  const contentElements = 9; // 3x3 grid of elements
</script>

<div class="space-y-4">
  <!-- Table Mockup -->
  <div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
    <!-- Table Container with Horizontal Alignment -->
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
              <!-- Interactive Cell -->
              <button 
                class={cn(
                  "h-24 p-3 flex w-full transition-all duration-150",
                  getCellAlignClass(),
                  getHorizontalAlignmentForColumn(col) === "left" && "justify-start",
                  getHorizontalAlignmentForColumn(col) === "center" && "justify-center",
                  getHorizontalAlignmentForColumn(col) === "right" && "justify-end"
                )}
                onclick={() => handleSelect({ row: 0, col })}
                onmouseenter={() => handleHover({ row: 0, col })}
                onmouseleave={() => handleHover(null)}
              >
                <!-- Grid of interactive elements -->
                <div class="grid grid-cols-3 gap-2 max-w-min">
                  {#each Array(contentElements) as _, i}
                    <div 
                      class={cn(
                        "w-5 h-5 rounded-md transition-all duration-150",
                        "bg-neutral-300 dark:bg-neutral-500",
                        isPositionHovered(0, col) && "bg-primary/30 dark:bg-primary/30",
                        isPositionSelected(0, col) && "bg-primary dark:bg-primary"
                      )}
                    ></div>
                  {/each}
                </div>
							</button>
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