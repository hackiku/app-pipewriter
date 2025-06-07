<!-- src/lib/features/addon/features/table/PaddingControls.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";

  // Props - simplified for padding only
  const props = $props<{
    cellPadding: number; // in points
    isProcessing: boolean;
    onPaddingChange: (points: number) => void;
  }>();

  // 8 padding values in 2 rows of 4
  const paddingValues = [
    [0, 4, 8, 12],    // Row 1
    [16, 20, 24, 30]  // Row 2
  ];

  // Get button class for padding values
  function getPaddingClass(points: number) {
    const isSelected = props.cellPadding === points;
    return cn(
      "px-1.5 py-1 text-[0.5em] border rounded-md transition-colors flex-1 font-medium",
      isSelected 
        ? "bg-primary/10 border-primary text-primary" 
        : "border-border hover:bg-accent",
      props.isProcessing && "opacity-50 cursor-not-allowed"
    );
  }

  // Handle padding click
  function handlePaddingClick(points: number) {
    if (!props.isProcessing) {
      props.onPaddingChange(points);
    }
  }
</script>

<div class="flex flex-col gap-2 h-full">
  <!-- Header -->
  <h3 class="text-[0.6em] font-medium text-muted-foreground">
    Padding
  </h3>

  <!-- 2 Rows of 4 Padding Values -->
  <div class="flex flex-col gap-1 flex-1">
    {#each paddingValues as row}
      <div class="flex gap-1 w-full">
        {#each row as paddingValue}
          <button
            class={getPaddingClass(paddingValue)}
            onclick={() => handlePaddingClick(paddingValue)}
            disabled={props.isProcessing}
            title={`Set padding to ${paddingValue} points`}
          >
            {paddingValue}
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>