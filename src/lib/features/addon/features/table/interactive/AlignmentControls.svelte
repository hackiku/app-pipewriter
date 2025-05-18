<!-- src/lib/features/addon/features/table/interactive/AlignmentControls.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical } from "lucide-svelte";
  import { resetInteractiveState } from "../tableContext.svelte";
  
  // Props using Svelte 5 runes
  const props = $props<{
    currentAlignment: {
      tableAlignment: string;
      cellVerticalAlignment: string;
    };
    onAlignmentChange: (position: {horizontal?: string, vertical?: string}) => void;
  }>();
  
  // Alignment options
  const horizontalAlignments = [
    { value: "left", icon: AlignLeft, label: "Left align" },
    { value: "center", icon: AlignCenter, label: "Center align" },
    { value: "right", icon: AlignRight, label: "Right align" }
  ];
  
  const verticalAlignments = [
    { value: "top", icon: AlignStartVertical, label: "Top align" },
    { value: "middle", icon: AlignCenterVertical, label: "Middle align" },
    { value: "bottom", icon: AlignEndVertical, label: "Bottom align" }
  ];
  
  // Handle alignment change
  function handleAlignmentChange(type: 'horizontal' | 'vertical', value: string) {
    // Reset interactive state first
    resetInteractiveState();
    
    // Update alignment
    if (type === 'horizontal') {
      props.onAlignmentChange({ horizontal: value });
    } else {
      props.onAlignmentChange({ vertical: value });
    }
  }
  
  // Get button class based on selection state
  function getButtonClass(type: string, value: string) {
    const isSelected = type === 'horizontal' 
      ? props.currentAlignment.tableAlignment === value
      : props.currentAlignment.cellVerticalAlignment === value;
      
    return cn(
      "flex items-center justify-center p-2 rounded-md transition-all duration-150",
      "border border-neutral-200 dark:border-neutral-700",
      isSelected 
        ? "bg-primary/10 border-primary text-primary" 
        : "bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700"
    );
  }
</script>

<div class="grid grid-cols-2 gap-4">
  <!-- Horizontal Alignment -->
  <div class="space-y-1">
    <div class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Horizontal Alignment</div>
    <div class="grid grid-cols-3 gap-2">
      {#each horizontalAlignments as align}
        <button 
          class={getButtonClass('horizontal', align.value)}
          onclick={() => handleAlignmentChange('horizontal', align.value)}
          title={align.label}
        >
          <svelte:component this={align.icon} class="h-5 w-5" />
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Vertical Alignment -->
  <div class="space-y-1">
    <div class="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Vertical Alignment</div>
    <div class="grid grid-cols-3 gap-2">
      {#each verticalAlignments as align}
        <button 
          class={getButtonClass('vertical', align.value)}
          onclick={() => handleAlignmentChange('vertical', align.value)}
          title={align.label}
        >
          <svelte:component this={align.icon} class="h-5 w-5" />
        </button>
      {/each}
    </div>
  </div>
</div>