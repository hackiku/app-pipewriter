<!-- $lib/iframe/features/ai/DropCode.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Code, ArrowUp, ArrowDown, Clipboard } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { insertHtml } from "$lib/services/google/html";

  // Props with SvelteKit 5 syntax
  const props = $props<{
    disabled?: boolean;
    activePrompt?: any;
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
    "h-7 w-7",
    "flex items-center justify-center",
    "rounded-md",
    "border border-input bg-background",
    "hover:bg-accent hover:text-accent-foreground",
    props.disabled && "opacity-50 cursor-not-allowed"
  ));

  async function handleDropHtml(params: any = {}) {
    if (props.disabled) return;
    
    props.onProcessingStart();
    props.onStatusUpdate({
      type: "processing",
      message: "Inserting code..."
    });

    try {
      const payload = {
        ...params,
        ...(props.activePrompt ? {
          prompt: props.activePrompt.content
        } : {})
      };

      const response = await insertHtml(payload, (status) => {
        props.onStatusUpdate(status);
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      if (response.clipboardContent) {
        await navigator.clipboard.writeText(response.clipboardContent);
        props.onStatusUpdate({
          type: "success",
          message: "Code copied to clipboard",
          executionTime: response.executionTime
        });
      } else {
        props.onStatusUpdate({
          type: "success",
          message: "Code inserted successfully",
          executionTime: response.executionTime
        });
      }
    } catch (error) {
      console.error("Failed to drop code:", error);
      props.onStatusUpdate({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to drop code"
      });
    } finally {
      props.onProcessingEnd();
    }
  }
</script>

<div class={buttonClass}>
  <!-- Left side with label and icon -->
  <div class="flex items-center gap-2">
    <Code class="h-4 w-4" />
    <span>Drop HTML</span>
  </div>
  
  <!-- Right side with action buttons -->
  <div class="flex items-center gap-2">
    <button 
      class={miniButtonClass}
      onclick={() => handleDropHtml({ position: 'start' })}
      disabled={props.disabled}
      title="Start"
    >
      <ArrowUp class="h-4 w-4" />
    </button>
    
    <button 
      class={miniButtonClass}
      onclick={() => handleDropHtml({ position: 'end' })}
      disabled={props.disabled}
      title="End"
    >
      <ArrowDown class="h-4 w-4" />
    </button>
    
    <button 
      class={miniButtonClass}
      onclick={() => handleDropHtml({ copyToClipboard: true })}
      disabled={props.disabled}
      title="Copy"
    >
      <Clipboard class="h-4 w-4" />
    </button>
  </div>
</div>