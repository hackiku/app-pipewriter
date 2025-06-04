<!-- src/lib/features/addon/components/StatusManager.svelte -->
<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { Loader2, ThumbsUp, AlertCircle, X, ChevronUp, ChevronDown } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  
  // Props - unified interface for all status displays
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
    variant?: 'bar' | 'sonner'; // 'bar' for top overlay, 'sonner' for bottom-right toast
    position?: 'top' | 'bottom-right';
  }>();
  
  // Local state
  let showDetails = $state(false);
  let autoCloseTimer: number | null = null;
  
  // Default to sonner variant if not specified
  const variant = props.variant || 'sonner';
  const position = props.position || 'bottom-right';
  
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
    
    const baseStyles = variant === 'bar' 
      ? 'bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700'
      : 'border-l-4 shadow-lg bg-background/95 border border-border backdrop-blur-sm';
    
    if (variant === 'sonner') {
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
    
    return baseStyles;
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
      const timeout = variant === 'bar' ? 2000 : 4000; // Bar closes faster
      autoCloseTimer = window.setTimeout(() => {
        handleClose();
      }, timeout);
    }
  }
  
  function hasDetails() {
    return (props.status?.details || (props.status?.error && props.status.type === 'error'));
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
  {#if variant === 'bar'}
    <!-- Bar variant - Top overlay style -->
    <div 
      class="absolute top-0 left-0 right-0 z-50"
      transition:fade={{ duration: 150 }}
    >
      <!-- Main Status Bar -->
      <div class={getStatusStyles()}>
        <div class="h-8 px-3 flex items-center justify-between">
          <div class="flex items-center gap-2 {getIconStyles()}">
            {@const IconComponent = getStatusIcon()}
            {#if props.status.type === 'processing'}
              <IconComponent class="h-4 w-4 animate-spin" />
            {:else}
              <IconComponent class="h-4 w-4" />
            {/if}
            <span class="text-xs font-medium">{getFormattedMessage()}</span>
            {#if props.status.executionTime}
              <span class="text-xs opacity-60 font-normal">({props.status.executionTime}ms)</span>
            {/if}
          </div>

          {#if hasDetails()}
            <button 
              class="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full 
                     transition-colors {getIconStyles()}"
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

        <!-- Details Panel -->
        {#if showDetails && hasDetails()}
          <div 
            class="px-4 py-3 text-xs whitespace-pre-wrap border-t border-neutral-200/50 dark:border-neutral-700/50"
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
  {:else}
    <!-- Sonner variant - Bottom-right toast style -->
    <div 
      class="fixed bottom-4 right-4 z-50 max-w-sm"
      transition:fly={{ duration: 300, x: 100, opacity: 0 }}
    >
      <div class={cn("rounded-lg p-4", getStatusStyles())}>
        <!-- Main toast content -->
        <div class="flex items-start gap-3">
          <!-- Status icon -->
          <div class={cn("flex-shrink-0 mt-0.5", getIconStyles())}>
            {@const IconComponent = getStatusIcon()}
            {#if props.status.type === 'processing'}
              <IconComponent class="h-5 w-5 animate-spin" />
            {:else}
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
            {#if hasDetails()}
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
        {#if showDetails && hasDetails()}
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
{/if}