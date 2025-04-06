<!-- src/lib/features/addon/features/table/interactive/InteractiveCell.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import type { CellPosition, CellAlignment } from "../tableContext.svelte";
  import { 
    generateCellElements, 
    isPositionHovered, 
    isPositionSelected, 
    handleHover, 
    handleSelect 
  } from "../tableContext.svelte";
  
  // Props using Svelte 5 runes
  const props = $props<{
    position: CellPosition;
    alignment: CellAlignment;
  }>();
  
  // Derived values
  let isHovered = $derived(isPositionHovered(props.position.row, props.position.col));
  let isSelected = $derived(isPositionSelected(props.position.row, props.position.col));
  
  // Cell elements (dots, squares, etc.)
  const elements = generateCellElements();
  
  // Handle mouse interactions
  function onMouseEnter() {
    handleHover(props.position);
  }
  
  function onMouseLeave() {
    handleHover(null);
  }
  
  function onClick() {
    handleSelect(props.position);
  }
  
  // Get cell element class based on position and type
  function getElementClass(index: number) {
    return cn(
      "transition-all duration-150",
      "bg-neutral-300 dark:bg-neutral-500",
      "rounded-md", // Using rounded squares by default
      isHovered && "bg-primary/30 dark:bg-primary/30 scale-110",
      isSelected && "bg-primary dark:bg-primary scale-110"
    );
  }
  
  // Calculate grid columns based on number of elements
  const gridClass = cn(
    "grid gap-2",
    elements.length <= 3 ? "grid-cols-3" : "grid-cols-4"
  );
</script>

<div 
  class="h-16 p-2 flex"
  onclick={onClick}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
>
  <div class={cn(
    "flex w-full transition-all duration-200",
    props.alignment.horizontal === "left" && "justify-start",
    props.alignment.horizontal === "center" && "justify-center",
    props.alignment.horizontal === "right" && "justify-end",
    props.alignment.vertical === "top" && "items-start",
    props.alignment.vertical === "middle" && "items-center",
    props.alignment.vertical === "bottom" && "items-end"
  )}>
    <!-- Interactive cell content - grid of elements -->
    <div class={gridClass}>
      {#each elements as _, index}
        <div 
          class={getElementClass(index)}
          style="width: 16px; height: 16px;"
        ></div>
      {/each}
    </div>
  </div>
</div>