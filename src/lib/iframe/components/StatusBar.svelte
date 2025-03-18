<!-- $lib/iframe/components/StatusBar.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { Loader2, ThumbsUp, AlertCircle, ChevronDown, ChevronUp } from "lucide-svelte";
  
  // Props
  const { status } = $props();
  
  // State
  let showDetails = $state(false);
  
  // Derived values
  let statusColor = $derived(() => {
    if (!status) return '';
    
    const colors = {
      'processing': 'text-blue-600 dark:text-blue-400',
      'success': 'text-green-600 dark:text-green-400',
      'error': 'text-red-600 dark:text-red-400'
    };
    
    return colors[status.type] || '';
  });
  
  let hasDetails = $derived(() => {
    return status?.details || (status?.error && status.type === 'error');
  });
  
  function toggleDetails() {
    showDetails = !showDetails;
  }
  
  function handleClickOutside() {
    showDetails = false;
  }
</script>

{#if status}
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
        <div class="flex items-center gap-2 {statusColor}">
          {#if status.type === 'processing'}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else if status.type === 'success'}
            <ThumbsUp class="h-4 w-4" />
          {:else if status.type === 'error'}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <span class="text-sm">{status.message}</span>
          {#if status.executionTime}
            <span class="text-xs opacity-60">({status.executionTime}ms)</span>
          {/if}
        </div>

        {#if hasDetails}
          <button 
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full 
                   transition-colors {statusColor}"
            onclick={(e) => { e.stopPropagation(); toggleDetails(); }}
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
      {#if showDetails && hasDetails}
        <div 
          class="px-4 py-2 border-t border-gray-200 dark:border-gray-700
                 text-xs whitespace-pre-wrap bg-gray-50 
                 dark:bg-gray-900/50"
          transition:fade={{ duration: 150 }}
        >
          {#if status.details}
            <div class="text-muted-foreground">{status.details}</div>
          {/if}
          {#if status.error && status.type === 'error'}
            <div class="text-red-600 dark:text-red-400 text-xs mt-1">
              {JSON.stringify(status.error, null, 2)}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}