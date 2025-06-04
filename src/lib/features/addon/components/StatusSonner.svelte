<!-- src/lib/features/addon/components/StatusSonner.svelte -->
<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { Loader2, ThumbsUp, AlertCircle, X } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  
  // Props
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
  let showDetails = $state(false);
  let autoCloseTimer: number | null = null;
  
  // Helper functions
  function getStatusIcon() {
    if (!props.status) return null;
    
    switch (props.status.type) {
      case 'processing':
        return Loader2;
      case 'success':
        return ThumbsUp;
      case 'error':
        return AlertCircle;
      default:
        return null;
    }
  }
  
  function getStatusStyles() {
    if (!props.status) return '';
    
    const baseStyles = 'border-l-4 shadow-lg';
    
    switch (props.status.type) {
      case 'processing':
        return cn(baseStyles, 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200');
      case 'success':
        return cn(baseStyles, 'border-l-green-500 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200');
      case 'error':
        return cn(baseStyles, 'border-l-red-500 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200');
      default:
        return baseStyles;
    }
  }
  
  function getIconStyles() {
    if (!props.status) return '';
    
    switch (props.status.type) {
      case 'processing':
        return 'text-blue-600 dark:text-blue-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return '';
    }
  }
  
  // Format element name for better readability
  function formatElementName(elementId: string): string {
    if (!elementId) return '';
    return elementId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Get formatted message with element name
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
  
  function handleClose() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
    props.onStatusClose?.();
  }
  
  function toggleDetails(e: MouseEvent) {
    e.stopPropagation();
    showDetails = !showDetails;
    
    // Clear auto-close timer when details are opened
    if (showDetails && autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }
  
  function startAutoCloseTimer() {
    if (props.status?.type !== 'processing' && props.onStatusClose) {
      autoCloseTimer = window.setTimeout(() => {
        handleClose();
      }, 4000); // Longer timeout for better UX
    }
  }
  
  // Start timer when status appears
  $effect(() => {
    if (props.status && !showDetails) {
      startAutoCloseTimer();
    }
    
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
      }
    };
  });
  
  // Clear timer when details are shown
  $effect(() => {
    if (showDetails && autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  });
</script>

{#if props.status}
  <!-- Sonner-style toast positioned bottom-right -->
  <div 
    class="fixed bottom-4 right-4 z-50 max-w-sm"
    transition:fly={{ duration: 300, x: 100, opacity: 0 }}
  >
    <div 
      class={cn(
        "rounded-lg p-4 backdrop-blur-sm",
        "bg-background/95 border border-border",
        getStatusStyles()
      )}
    >
      <!-- Main toast content -->
      <div class="flex items-start gap-3">
        <!-- Status icon -->
        <div class={cn("flex-shrink-0 mt-0.5", getIconStyles())}>
          {#if props.status.type === 'processing'}
            {@const IconComponent = getStatusIcon()}
            <IconComponent class="h-5 w-5 animate-spin" />
          {:else}
            {@const IconComponent = getStatusIcon()}
            <IconComponent class="h-5 w-5" />
          {/if}
        </div>
        
        <!-- Message content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-tight">
            {getFormattedMessage()}
          </p>
          
          {#if props.status.executionTime}
            <p class="text-xs opacity-70 mt-1">
              Completed in {props.status.executionTime}ms
            </p>
          {/if}
          
          <!-- Details toggle for errors or when details exist -->
          {#if props.status.details || (props.status.error && props.status.type === 'error')}
            <button 
              class="text-xs underline opacity-70 hover:opacity-100 mt-1"
              onclick={toggleDetails}
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          {/if}
        </div>
        
        <!-- Close button -->
        <button 
          class="flex-shrink-0 p-1 rounded-full hover:bg-background/50 transition-colors opacity-70 hover:opacity-100"
          onclick={handleClose}
        >
          <X class="h-4 w-4" />
        </button>
      </div>
      
      <!-- Expandable details -->
      {#if showDetails && (props.status.details || (props.status.error && props.status.type === 'error'))}
        <div 
          class="mt-3 pt-3 border-t border-current/20"
          transition:fade={{ duration: 200 }}
        >
          {#if props.status.details}
            <pre class="text-xs opacity-80 whitespace-pre-wrap font-mono bg-background/30 rounded p-2">
{props.status.details}</pre>
          {/if}
          
          {#if props.status.error && props.status.type === 'error'}
            <div class="mt-2">
              <p class="text-xs font-medium mb-1">Error Details:</p>
              <pre class="text-xs opacity-80 whitespace-pre-wrap font-mono bg-background/30 rounded p-2">
{JSON.stringify(props.status.error, null, 2)}</pre>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}