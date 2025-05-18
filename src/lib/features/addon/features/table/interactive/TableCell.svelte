<!-- src/lib/features/addon/features/table/TableCell.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { 
    handleHover, 
    handleSelect, 
    isPositionHovered, 
    isPositionSelected,
    getHorizontalAlignmentForColumn
  } from "./tableContext.svelte";
  
  // Props using Svelte 5 runes
  const props = $props<{
    position: {
      row: number;
      col: number;
    };
    cellVerticalAlignment: string;
  }>();
  
  // Local state
  let isHovered = $derived(isPositionHovered(props.position.row, props.position.col));
  let isSelected = $derived(isPositionSelected(props.position.row, props.position.col));
  
  // Get horizontal alignment for this cell
  let horizontalAlignment = $derived(getHorizontalAlignmentForColumn(props.position.col));
  
  // Handle cell click
  function handleCellClick() {
    handleSelect(props.position);
  }
  
  // Handle mouse interactions
  function onMouseEnter() {
    handleHover(props.position);
  }
  
  function onMouseLeave() {
    handleHover(null);
  }
  
  // Generate content elements (3x3 grid of dots/squares)
  const contentElements = 9;
</script>

<button 
  class={cn(
    "h-20 p-3 flex w-full transition-all duration-150",
    props.cellVerticalAlignment === "top" && "items-start",
    props.cellVerticalAlignment === "middle" && "items-center",
    props.cellVerticalAlignment === "bottom" && "items-end",
    horizontalAlignment === "left" && "justify-start",
    horizontalAlignment === "center" && "justify-center",
    horizontalAlignment === "right" && "justify-end"
  )}
  onclick={handleCellClick}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
>
  <!-- Grid of interactive elements -->
  <div class="grid grid-cols-3 gap-2 max-w-min">
    {#each Array(contentElements) as _, i}
      <div 
        class={cn(
          "w-5 h-5 rounded-md transition-all duration-150",
          "bg-neutral-300 dark:bg-neutral-500",
          isHovered && "bg-primary/30 dark:bg-primary/30",
          isSelected && "bg-primary dark:bg-primary"
        )}
      ></div>
    {/each}
  </div>
</button>