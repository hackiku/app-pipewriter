<!-- src/lib/features/addon/components/CompactStatus.svelte -->
<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { Loader2, CheckCircle2, AlertCircle, X } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  
  const props = $props<{
    status: {
      type: 'processing' | 'success' | 'error';
      message: string;
      details?: string;
      executionTime?: number;
      error?: any;
      elementId?: string;
    } | null;
    onStatusClose?: () => void;
  }>();
  
  // Local state
  let autoCloseTimer: number | null = null;
  
  // Auto-close timer for non-processing states
  function startAutoCloseTimer() {
    if (props.status?.type !== 'processing' && props.onStatusClose) {
      autoCloseTimer = window.setTimeout(() => {
        props.onStatusClose?.();
      }, 3000); // 3 second auto-close
    }
  }
  
  function clearAutoCloseTimer() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }
  
  function handleClose() {
    clearAutoCloseTimer();
    props.onStatusClose?.();
  }
  
  // Start timer when status appears
  $effect(() => {
    if (props.status) {
      startAutoCloseTimer();
    }
    
    return () => {
      clearAutoCloseTimer();
    };
  });
  
  // Helper functions
  function getIcon() {
    switch (props.status?.type) {
      case 'processing':
        return Loader2;
      case 'success':
        return CheckCircle2;
      case 'error':
        return AlertCircle;
      default:
        return null;
    }
  }
  
  function getIconClass() {
    const base = "h-3 w-3 flex-shrink-0";
    switch (props.status?.type) {
      case 'processing':
        return `${base} animate-spin text-blue-500`;
      case 'success':
        return `${base} text-green-500`;
      case 'error':
        return `${base} text-red-500`;
      default:
        return base;
    }
  }
  
  function getBgClass() {
    switch (props.status?.type) {
      case 'processing':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30';
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30';
      default:
        return 'bg-background border-border';
    }
  }
  
  // Format element name for better readability
  function formatElementName(elementId: string): string {
    if (!elementId) return '';
    return elementId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Get formatted message
  function getFormattedMessage(): string {
    if (!props.status) return '';
    
    const { message, elementId } = props.status;
    
    if (elementId) {
      const elementName = formatElementName(elementId);
      
      if (message.includes('inserted') || message.includes('Inserting')) {
        return message.replace(/element|Element/, `"${elementName}"`);
      } else if (message.includes('Added to queue')) {
        return `Added "${elementName}" to queue`;
      }
    }
    
    return message;
  }
</script>

{#if props.status}
  <!-- Compact top-right positioned status -->
  <div 
    class="fixed top-2 left-2 z-50 max-w-xs"
    transition:fly={{ duration: 200, y: -20, opacity: 0 }}
  >
    <div 
      class={cn(
        "flex items-center gap-2 px-3 py-1 rounded-lg border shadow-sm backdrop-blur-sm",
        "text-xs font-medium",
        getBgClass()
      )}
    >
      <!-- Status Icon -->
      {#if getIcon()}
        {@const IconComponent = getIcon()}
        <IconComponent class={getIconClass()} />
      {/if}
      
      <!-- Message -->
      <span class="flex-1 truncate text-foreground/90">
        {getFormattedMessage()}
      </span>
      
      <!-- Execution Time (success only) -->
      {#if props.status.executionTime && props.status.type === 'success'}
        <span class="text-[0.75em] opacity-60 whitespace-nowrap">
          {props.status.executionTime}ms
        </span>
      {/if}
      
      <!-- Close Button (non-processing only) -->
      {#if props.status.type !== 'processing'}
        <button 
          class="p-0.5 rounded-sm hover:bg-background/50 transition-colors opacity-60 hover:opacity-100"
          onclick={handleClose}
          title="Dismiss"
        >
          <X class="h-3 w-3" />
        </button>
      {/if}
    </div>
  </div>
{/if}