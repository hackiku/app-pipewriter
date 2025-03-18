<!-- $lib/iframe/tabs/ColorTab.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { Button } from "$lib/components/ui/button";
  import { Copy, Check, Loader2, ThumbsUp, AlertCircle } from 'lucide-svelte';
  import ColorPicker from "../components/ColorPicker.svelte";
  import ColorButton from "../components/ColorButton.svelte";
  import { currentColor } from '../stores';
  import { GASCommunicator } from '../gasUtils';
  import { cn } from "$lib/utils";
  
  const dispatch = createEventDispatcher();
  
  const presetColors = [
    { color: '#FFFFFF', title: 'White' },
    { color: '#E5E5E5', title: 'Light Gray' },
    { color: '#A3A3A3', title: 'Gray' },
    { color: '#171717', title: 'Black' },
  ];
  
  let showColorPicker = false;
  let isProcessing = false;
  let status: StatusUpdate | null = null;
  let gasCommunicator: GASCommunicator;
  let isCopied = false;
  let actionRowsRef: HTMLDivElement;

  interface StatusUpdate {
    type: 'success' | 'error' | 'processing';
    message: string;
    executionTime?: number;
  }

  onMount(() => {
    gasCommunicator = GASCommunicator.getInstance();
  });

  function stripAlpha(color: string): string {
    return color.replace(/FF$/, '').slice(0, 7).toUpperCase();
  }

  async function handleColorChange(color: string) {
    if (isProcessing) return;
    
    isProcessing = true;
    updateStatus({
      type: 'processing',
      message: 'Applying color...'
    });

    try {
      const cleanColor = color;
      const response = await gasCommunicator.sendMessage('changeBg', { color: cleanColor });
      
      if (response.success) {
        currentColor.set(cleanColor);
        updateStatus({
          type: 'success',
          message: 'Color applied!',
          executionTime: response.executionTime
        });
      } else {
        throw new Error(response.error || 'Failed to change color');
      }
    } catch (error) {
      console.error('Failed to change background:', error);
      updateStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to change color'
      });
    } finally {
      isProcessing = false;
    }
  }

  function updateStatus(newStatus: StatusUpdate) {
    status = newStatus;
    if (newStatus.type !== 'processing') {
      setTimeout(() => status = null, 3000);
    }
  }

  function handleColorUpdate(event: CustomEvent<{ color: string }>) {
    currentColor.set(stripAlpha(event.detail.color));
  }


  function handleSubmit() {
    handleColorChange($currentColor);
  }

  $: statusClass = status && {
    success: "bg-green-500/5 border-green-500/10 text-green-700 dark:text-green-300",
    error: "bg-red-500/5 border-red-500/10 text-red-700 dark:text-red-300",
    processing: "bg-blue-500/5 border-blue-500/10 text-blue-700 dark:text-blue-300"
  }[status.type];
</script>

<div class="relative flex flex-col items-stretch w-full gap-2 pt-4">


  {#if showColorPicker}
    <div 
      class="relative z-10 w-full p-4 mb-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg"
      transition:slide={{ duration: 150, axis: 'y' }}
    >
      <ColorPicker on:colorUpdate={handleColorUpdate} />
    </div>
  {/if}

  <!-- Action rows container -->
  <div bind:this={actionRowsRef} class="relative">
    <!-- Color input and actions -->
    <div class="flex gap-2 mb-2 px-4">
      <button
        class="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        on:click={() => showColorPicker = !showColorPicker}
        style="background: linear-gradient(to right, {$currentColor} 2rem, {showColorPicker ? '#f9fafb' : 'white'} 2rem);"
      >
        <span class="w-6"></span>
        <span class="flex items-center uppercase pl-2">{$currentColor}</span>
      </button>



      <Button 
        variant="default" 
        class="h-9 px-4 min-w-[60px]"
        disabled={isProcessing}
        on:click={handleSubmit}
      >
        {isProcessing ? '...' : 'Ok'}
      </Button>
    </div>

    <!-- Preset colors -->
    <div class="flex items-center justify-center gap-2 px-5 h-12">
      {#each presetColors as { color, title }}
        <ColorButton
          {color}
          {title}
          isSelected={$currentColor === color}
          {isProcessing}
          on:click={() => handleColorChange(color)}
        />
      {/each}
      
      <ColorButton
        color=""
        title="Custom Color"
        isGradient={true}
        isSelected={showColorPicker}
        {isProcessing}
        on:click={() => showColorPicker = !showColorPicker}
      />
    </div>

    <!-- Status overlay -->
    {#if status}
      <div 
        class="absolute inset-0 z-50 flex items-center justify-center gap-2 rounded-lg border backdrop-blur-[0.2em] transition-all duration-200 {statusClass}"
        transition:fade={{ duration: 200 }}
      >
        <div class="flex items-center gap-2 px-4 py-2">
          {#if status.type === 'processing'}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else if status.type === 'success'}
            <ThumbsUp class="h-4 w-4" />
          {:else if status.type === 'error'}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <span class="text-sm font-medium">{status.message}</span>
          {#if status.executionTime}
            <span class="text-xs text-muted-foreground">
              ({status.executionTime}ms)
            </span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>