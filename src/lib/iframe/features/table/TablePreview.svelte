<!-- src/lib/iframe/features/table/TablePreview.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  
  // Props using Svelte 5 runes
  const props = $props<{
    alignment: {
      tableAlignment: string;
      cellVerticalAlignment: string;
    };
    borders: {
      width: number;
      color: string;
      style: string;
    };
  }>();
  
  // Derived values for styling
  let tableAlignmentClass = $derived(() => {
    switch (props.alignment.tableAlignment) {
      case "left": return "justify-start";
      case "center": return "justify-center";
      case "right": return "justify-end";
      default: return "justify-center";
    }
  });
  
  let cellAlignmentClass = $derived(() => {
    switch (props.alignment.cellVerticalAlignment) {
      case "top": return "items-start";
      case "middle": return "items-center";
      case "bottom": return "items-end";
      default: return "items-center";
    }
  });
  
  let borderStyle = $derived(() => {
    return `${props.borders.width}px ${props.borders.style} ${props.borders.color}`;
  });
</script>

<div class={cn("flex", tableAlignmentClass)}>
  <div class="border border-gray-300 dark:border-gray-600 w-full" style:border={borderStyle}>
    <div class="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-1">
      <div class="h-4 bg-gray-300 dark:bg-gray-500 w-2/3 rounded"></div>
    </div>
    <div class="grid grid-cols-2">
      <div class="border-r border-gray-300 dark:border-gray-600">
        <div class={cn("h-12 p-1 flex", cellAlignmentClass)}>
          <div class="h-3 bg-gray-300 dark:bg-gray-500 w-1/2 rounded"></div>
        </div>
      </div>
      <div>
        <div class={cn("h-12 p-1 flex", cellAlignmentClass)}>
          <div class="h-3 bg-gray-300 dark:bg-gray-500 w-3/4 rounded"></div>
        </div>
      </div>
    </div>
  </div>
</div>