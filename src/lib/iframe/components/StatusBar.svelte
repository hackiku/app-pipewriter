<!-- $lib/iframe/components/StatusBar.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { Loader2, ThumbsUp, AlertCircle, ChevronDown, ChevronUp } from "lucide-svelte";
  
  // Props with proper typing
  const props = $props<{
    status: {
      type: 'processing' | 'success' | 'error';
      message: string;
      details?: string;
      executionTime?: number;
      error?: any;
    } | null;
  }>();
  
  // Local state
  let showDetails = $state(false);
  
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
  
  function toggleDetails(e: MouseEvent) {
    e.stopPropagation();
    showDetails = !showDetails;
  }
  
  function handleClickOutside() {
    showDetails = false;
  }
</script>

{#if props.status}
  <div 
    class="absolute top-0 left-0 right-0 z-50"
    transition:fade={{ duration: 150 }}
    onclick={handleClickOutside}
  >
    <!-- Main Status Bar -->
    <div 
      class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b 
             border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div class="h-8 px-4 flex items-center justify-between">
        <div class="flex items-center gap-2 {getStatusColor()}">
          {#if props.status.type === 'processing'}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else if props.status.type === 'success'}
            <ThumbsUp class="h-4 w-4" />
          {:else if props.status.type === 'error'}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <span class="text-sm">{props.status.message}</span>
          {#if props.status.executionTime}
            <span class="text-xs opacity-60">({props.status.executionTime}ms)</span>
          {/if}
        </div>

        {#if hasDetails()}
          <button 
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full 
                   transition-colors {getStatusColor()}"
            onclick={toggleDetails}
          >
            {#if showDetails}
              <ChevronUp class="h-4 w-4" />
            {:else}
              <ChevronDown class="h-4 w-4" />
            {/if}
          </button>
        {/if}
      </div>

      <!-- Details Panel -->
      {#if showDetails && hasDetails()}
        <div 
          class="px-4 py-2 border-t border-gray-200 dark:border-gray-700
                 text-xs whitespace-pre-wrap bg-gray-50 
                 dark:bg-gray-900/50"
          transition:fade={{ duration: 150 }}
        >
          {#if props.status.details}
            <div class="text-muted-foreground">{props.status.details}</div>
          {/if}
          {#if props.status.error && props.status.type === 'error'}
            <div class="text-red-600 dark:text-red-400 text-xs mt-1">
              {JSON.stringify(props.status.error, null, 2)}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}