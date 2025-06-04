<!-- $lib/features/addon/components/StatusBar.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { Loader2, ThumbsUp, AlertCircle, ChevronDown, ChevronUp } from "@lucide/svelte";
  
  // Props with proper typing
  const props = $props<{
    status: {
      type: 'processing' | 'success' | 'error';
      message: string;
      details?: string;
      executionTime?: number;
      error?: any;
      elementId?: string; // Add elementId for better messaging
    } | null;
    onStatusClose?: () => void; // Callback when status should be closed
  }>();
  
  // Local state
  let showDetails = $state(false);
  let autoCloseTimer: number | null = null;
  
  // Helper functions for computed values
  function getStatusColor() {
    if (!props.status) return '';
    
    const colors = {
      'processing': 'text-blue-600 dark:text-blue-400',
      'success': 'text-green-600 dark:text-green-400',
      'error': 'text-red-600 dark:text-red-400'
    };
    
    return colors[props.status.type] || '';
  }
  
  function hasDetails() {
    return (props.status?.details || (props.status?.error && props.status.type === 'error'));
  }
  
  // Format element ID for better readability
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
  
  function toggleDetails(e: MouseEvent) {
    e.stopPropagation();
    showDetails = !showDetails;
    
    // Clear auto-close timer when details are opened
    if (showDetails && autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }
  
  function handleClickOutside() {
    if (showDetails) {
      showDetails = false;
      // Start auto-close timer when details are manually closed
      startAutoCloseTimer();
    }
  }
  
  function startAutoCloseTimer() {
    if (props.status?.type !== 'processing' && props.onStatusClose) {
      autoCloseTimer = window.setTimeout(() => {
        props.onStatusClose?.();
      }, 2000);
    }
  }
  
  function clearAutoCloseTimer() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }
  
  // Start timer when status appears (if not details are shown)
  $effect(() => {
    if (props.status && !showDetails) {
      startAutoCloseTimer();
    }
    
    return () => {
      clearAutoCloseTimer();
    };
  });
  
  // Clear timer when details are shown
  $effect(() => {
    if (showDetails) {
      clearAutoCloseTimer();
    }
  });
</script>

{#if props.status}
  <div 
    class="absolute top-0 left-0 right-0 z-50"
    transition:fade={{ duration: 150 }}
    onclick={handleClickOutside}
  >
    <!-- Main Status Bar -->
    <div 
      class="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border-b rounded-t-2xl mx-2
             border-neutral-200 dark:border-neutral-700 shadow-sm"
    >
      <div class="h-8 px-3 flex items-center justify-between">
        <div class="flex items-center gap-2 {getStatusColor()}">
          {#if props.status.type === 'processing'}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else if props.status.type === 'success'}
            <ThumbsUp class="h-4 w-4" />
          {:else if props.status.type === 'error'}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <span class="text-xs font-medium">{getFormattedMessage()}</span>
          {#if props.status.executionTime}
            <span class="text-xs opacity-60 font-normal">({props.status.executionTime}ms)</span>
          {/if}
        </div>

        {#if hasDetails()}
          <button 
            class="p-1  hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full 
                   transition-colors {getStatusColor()}"
            onclick={toggleDetails}
          >
            {#if showDetails}
              <ChevronUp class="h-5 w-5" />
            {:else}
              <ChevronDown class="h-5 w-5" />
            {/if}
          </button>
        {/if}
      </div>

      <!-- Details Panel with continuous background -->
      {#if showDetails && hasDetails()}
        <div 
          class="px-4 py-3 text-xs whitespace-pre-wrap
                 bg-white/95 dark:bg-neutral-800/95 
                 border-t border-neutral-200/50 dark:border-neutral-700/50"
          transition:fade={{ duration: 150 }}
        >
          {#if props.status.details}
            <div class="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {props.status.details}
            </div>
          {/if}
          {#if props.status.error && props.status.type === 'error'}
            <div class="text-red-600 dark:text-red-400 text-xs mt-2 p-2 
                        bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <div class="font-medium mb-1">Error Details:</div>
              <pre class="text-xs overflow-x-auto">{JSON.stringify(props.status.error, null, 2)}</pre>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}