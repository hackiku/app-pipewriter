<!-- Updated src/lib/features/addon/features/text/TextActions.svelte -->
<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable";
  import { RefreshCcw, Heading, Pipette, AlertCircle } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import type { ElementTheme } from '$lib/types/elements';

  // Props
  const props = $props<{
    isProcessing: boolean;
    selectedStyle: any;
    theme: ElementTheme;
    svgUrl: string;
    onStyleGuideInsert: () => void;
    onExtractStyle: () => void;
    onApplyStyle: () => void;
    onUpdateAll: () => void;
    onResetStyle: () => void;
    onToggleTheme: () => void;
  }>();

  // State for responsive UI
  let rightPaneWidth = $state(0);
  let rightPaneElement = $state<HTMLDivElement | null>(null);
  let compactMode = $derived(rightPaneWidth < 120);
  let imageError = $state(false);

  // Resize observer to detect width changes
  $effect(() => {
    if (!rightPaneElement) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        rightPaneWidth = entry.contentRect.width;
      }
    });
    
    resizeObserver.observe(rightPaneElement);
    
    return () => {
      resizeObserver.disconnect();
    };
  });

  // Handle image loading errors
  function handleImageError() {
    console.error(`Failed to load styleguide image: ${props.svgUrl}`);
    imageError = true;
  }

  // Card styling based on element theme
  const cardStyles = {
    light: 'bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700/80 hover:bg-neutral-400/30 dark:hover:bg-neutral-900/80',
    dark: 'bg-neutral-950 dark:bg-white hover:bg-neutral-900/80 dark:hover:bg-neutral-400/30 border border-neutral-300'
  };
</script>

<Resizable.PaneGroup direction="horizontal" class="h-36 gap-2">
  <!-- Left Pane: Style Guide Element -->
  <Resizable.Pane defaultSize={40} minSize={25} maxSize={60}>
    <div class="h-full flex flex-col">
      <!-- Style Guide Element (main area) -->
      <div class="flex-1">
        <button
          class="group relative w-full h-full p-0 rounded-lg overflow-hidden
                 transition-all duration-200 ease-out cursor-pointer
                 {cardStyles[props.theme]}
                 hover:-translate-y-1 hover:-translate-x-1 hover:rotate-[-1deg] 
                 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] 
                 dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]
                 active:translate-y-0 active:translate-x-0 active:shadow-none
                 {props.isProcessing && 'opacity-90 cursor-not-allowed pointer-events-none'}"
          onclick={props.onStyleGuideInsert}
          disabled={props.isProcessing}
          title="Insert style guide"
        >
          <div class="relative w-full h-full overflow-hidden">
            {#if imageError}
              <div class="flex h-full flex-col items-center justify-center p-2 text-center">
                <AlertCircle class="mb-1 h-6 w-6 text-neutral-400" />
                <span class="text-xs text-neutral-500">styleguide</span>
              </div>
            {:else}
              <img
                src={props.svgUrl}
                alt="Style guide template"
                class="w-full h-full object-contain transition-opacity group-hover:opacity-40"
                onerror={handleImageError}
              />
            {/if}

            <!-- Hover Overlay -->
            <div class="absolute inset-0 flex items-center justify-center 
                        bg-gradient-radial from-background/30 from-20% via-background/10 via-50% to-transparent to-100%
                        opacity-0 transition-opacity group-hover:opacity-100">
              <div class="rounded-full border border-border/50 bg-background/90 px-2 py-1 backdrop-blur-sm">
                <span class="text-xs font-medium text-foreground/80">Insert</span>
              </div>
            </div>

            <!-- Processing State -->
            {#if props.isProcessing}
              <div class="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            {/if}
          </div>
        </button>
      </div>
      
      <!-- Controls Row (bottom) -->
      <div class="flex justify-between items-center h-6 px-1 mt-1">
        <!-- Theme Toggle Button -->
        <Button
          variant="ghost"
          size="sm"
          class="h-5 w-12 text-[0.6rem] opacity-60 hover:opacity-100"
          disabled={props.isProcessing}
          onclick={props.onToggleTheme}
          title={`Switch to ${props.theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {props.theme}
        </Button>
        
        <!-- Empty space for balance -->
        <div></div>
      </div>
    </div>
  </Resizable.Pane>
  
  <Resizable.Handle />
  
  <!-- Right Pane: Action Buttons -->
  <Resizable.Pane defaultSize={60} minSize={40} maxSize={75}>
    <div bind:this={rightPaneElement} class="h-full flex flex-col gap-2">
      <!-- Row 1: Get | Apply (same width, both with icons left) -->
      <div class="flex-1 flex gap-2">
        <!-- Get Style Button -->
        <Button
          variant="outline"
          class="flex-1 flex items-center justify-center text-[0.7em] h-full"
          disabled={props.isProcessing}
          onclick={props.onExtractStyle}
          title="Extract style from cursor position"
        >
          <Pipette class="h-3 w-3 -ml-2" />
          <span>{compactMode ? "Get" : "Get"}</span>
        </Button>
        
        <!-- Apply Style Button -->
        <Button
          variant={props.selectedStyle ? "default" : "outline"}
          class="flex-1 flex items-center justify-center text-xs h-full"
          disabled={props.isProcessing || !props.selectedStyle}
          onclick={props.onApplyStyle}
          title="Apply style to text at cursor"
        >
          <Heading class="h-3 w-3 -ml-2" />
          <span>{compactMode ? "Apply" : "Apply"}</span>
        </Button>
      </div>
      
      <!-- Row 2: Update All | Reset (icon only) -->
      <div class="flex-1 flex gap-2">
        <!-- Update All Button -->
        <Button
          variant="outline"
          class="flex-1 flex items-center justify-center text-xs h-full"
          disabled={props.isProcessing}
          onclick={props.onUpdateAll}
          title="Update all matching headings to match cursor style"
        >
          <span>{compactMode ? "All" : "Update All"}</span>
        </Button>
        
        <!-- Reset Button (icon only) -->
        <Button
          variant="outline"
          class="aspect-square h-full p-0"
          disabled={props.isProcessing || !props.selectedStyle}
          onclick={props.onResetStyle}
          title="Reset style selection"
        >
          <RefreshCcw class="h-3 w-3" />
        </Button>
      </div>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>

<style>
  .bg-gradient-radial {
    background: radial-gradient(var(--tw-gradient-stops));
  }
</style>