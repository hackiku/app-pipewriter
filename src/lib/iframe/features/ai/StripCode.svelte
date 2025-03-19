<!-- $lib/iframe/features/ai/StripCode.svelte -->
<script lang="ts">
  import { Trash2 } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { stripHtml } from "$lib/services/google/html";

  // Props with SvelteKit 5 syntax
  const props = $props<{
    disabled?: boolean;
    onStatusUpdate: (status: any) => void;
    onProcessingStart: () => void;
    onProcessingEnd: () => void;
  }>();

  // Button classes - similar to original HtmlButton
  let buttonClass = $derived(cn(
    "h-10 text-xs",
    "relative",
    "flex items-center justify-between px-4",
    "w-full rounded-lg",
    "border border-input bg-background",
    "hover:bg-accent hover:text-accent-foreground",
    props.disabled && "opacity-50 cursor-not-allowed"
  ));

  let miniButtonClass = $derived(cn(
    "h-7",
    "px-3",
    "flex items-center justify-center",
    "rounded-md",
    "border border-input bg-background",
    "hover:bg-accent hover:text-accent-foreground",
    props.disabled && "opacity-50 cursor-not-allowed"
  ));

  async function handleStripHtml(params: any = {}) {
    if (props.disabled) return;
    
    props.onProcessingStart();
    props.onStatusUpdate({
      type: "processing",
      message: "Removing code..."
    });

    try {
      const response = await stripHtml(params, (status) => {
        props.onStatusUpdate(status);
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      props.onStatusUpdate({
        type: "success",
        message: params.all ? "All code removed" : "Code tags removed",
        executionTime: response.executionTime
      });
    } catch (error) {
      console.error("Failed to strip code:", error);
      props.onStatusUpdate({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to strip code"
      });
    } finally {
      props.onProcessingEnd();
    }
  }
</script>

<div class={buttonClass}>
  <!-- Left side with label and icon -->
  <div class="flex items-center gap-2">
    <Trash2 class="h-4 w-4" />
    <span>Strip HTML</span>
  </div>
  
  <!-- Right side with action buttons -->
  <div class="flex items-center gap-2">
    <button 
      class={miniButtonClass}
      onclick={() => handleStripHtml({ all: false })}
      disabled={props.disabled}
    >
      Tags
    </button>
    
    <button 
      class={miniButtonClass}
      onclick={() => handleStripHtml({ all: true })}
      disabled={props.disabled}
    >
      All
    </button>
  </div>
</div>