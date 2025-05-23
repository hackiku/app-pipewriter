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
  import { AlignStartVertical, AlignCenterVertical, AlignEndVertical, Delete } from "@lucide/svelte";
  
  // Local statex
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
  
	const tableScope = [
    { value: "whole", label: "Top align" },
    { value: "center", icon: AlignCenterVertical, label: "Middle align" },
    { value: "reset", icon: AlignEndVertical, label: "Bottom align" }
  ];
  
  // Get vertical alignment button class
  function getVerticalAlignClass(value: string) {
    const isSelected = tableConfig.alignment.cellVerticalAlignment === value;
    return cn(
      "flex h-7 w-7 items-center justify-center transition-all duration-150",
      "rounded-md",
      isSelected 
        ? "border bg-primary/10 border-primary text-primary" 
        : "__bg-white __dark:bg-neutral-800 __border-neutral-200 __dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
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




<div class="flex flex-row w-full gap-4 h-28">

  <!-- Table Mockup -->
  <div class="w-full h-full bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
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
                  "h-full p-1 flex w-full transition-all duration-150",
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


	<div class="flex flex-col justify-center gap-2">
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


	<div class="flex items-center justify-start gap-3 w-full">
		<button 
			class={getVerticalAlignClass("whole")}
			onclick={() => handleVerticalAlignmentSelect("top")}
			title="all"
		>
			<div class="text-sm h-4">Table</div>
		</button>
		<button 
			class="w-"
			onclick={() => handleVerticalAlignmentSelect("middle")}
			title="all"
		>
			<div class="text-sm h-4 __w-full">Cell</div>
		</button>
		
		<div class="text-sm">
			<input 
				class="w-10 h-6 rounded-md text-center text-xs"
				placeholder=2.102
				onclick={() => handleVerticalAlignmentSelect("middle")}
				title="all"
				/>
			<span>in</span>

		</div>
	<!-- </input> -->
		
		<button 
			class="w-"
			onclick={() => handleVerticalAlignmentSelect("bottom")}
			title="all"
		>
			<Delete class="h-4 w-4" />
		</button>
  </div>