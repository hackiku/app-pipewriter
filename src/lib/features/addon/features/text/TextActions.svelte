<!-- Updated src/lib/features/addon/features/text/TextActions.svelte -->
<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable";
  import { AlertCircle, TextCursor, BookOpenCheck, Heading, Sun, Moon } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import type { ElementTheme } from '$lib/types/elements';

  // Props
  const props = $props<{
    isProcessing: boolean;
    selectedStyle: any;
    theme: ElementTheme;
    svgUrl: string;
    onStyleGuideInsert: () => void;
    onExtractStyle: () => void;
    onExtractAllStyles: () => void;
    onUpdateAllStyles: () => void;
    onToggleTheme: () => void;
  }>();

  // State for responsive UI
  let rightPaneWidth = $state(0);
  let rightPaneElement = $state<HTMLDivElement | null>(null);
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

  // Button classes matching DropCode/StripCode pattern
  let buttonClass = $derived(cn(
    "h-10 text-xs aspect-square",
    "relative",
    "flex items-center justify-between px-1.5",
    "w-full rounded-lg",
    "border border-input bg-background",
    "hover:bg-accent hover:text-accent-foreground",
    props.isProcessing && "opacity-50 cursor-not-allowed"
  ));

  let miniButtonClass = $derived(cn(
    "h-7 w-7",
    "flex items-center justify-center",
    "rounded-md",
    "border border-input bg-background",
    "hover:bg-accent hover:text-accent-foreground",
    props.isProcessing && "opacity-50 cursor-not-allowed"
  ));

  // Get heading display for selected style
  function getHeadingDisplay() {
    if (!props.selectedStyle) return "H1";
    
    const headingMap = {
      'NORMAL': 'p',
      'HEADING1': 'H1',
      'HEADING2': 'H2',
      'HEADING3': 'H3',
      'HEADING4': 'H4',
      'HEADING5': 'H5',
      'HEADING6': 'H6'
    };
    
    return headingMap[props.selectedStyle.headingType] || 'H1';
  }
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
      
      <!-- Theme Toggle (bottom) -->
      <div class="flex justify-center items-center h-6 mt-1">
        <Button
          variant="ghost"
          size="sm"
          class="h-5 px-2 text-[0.6rem] opacity-60 hover:opacity-100 flex items-center gap-1"
          disabled={props.isProcessing}
          onclick={props.onToggleTheme}
          title={`Switch to ${props.theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {#if props.theme === 'light'}
            <Sun class="h-2.5 w-2.5" />
          {:else}
            <Moon class="h-2.5 w-2.5" />
          {/if}
          {props.theme}
        </Button>
      </div>
    </div>
  </Resizable.Pane>
  
  <Resizable.Handle />
  
  <!-- Right Pane: Action Buttons -->
  <Resizable.Pane defaultSize={70} minSize={40} maxSize={90}>
    <div bind:this={rightPaneElement} class="h-full flex flex-col gap-2">
      
      <!-- Get Style Actions -->
      <div class={buttonClass}>
        <!-- Left side with label and icon -->
        <div class="flex items-center gap-2 text-[0.9em] ml-1">
          <!-- <TextCursor class="h-4 w-4" /> -->
          <span>Get Styles</span>
        </div>
        
        <!-- Right side with action buttons -->
        <div class="flex items-center gap-1">
          <button 
            class={miniButtonClass}
            onclick={props.onExtractStyle}
            disabled={props.isProcessing}
            title="Get style from cursor position"
          >
            <TextCursor class="h-3 w-3" />
          </button>
          
          <button 
            class={miniButtonClass}
            onclick={props.onExtractAllStyles}
            disabled={props.isProcessing}
            title="Get all document styles"
          >
            <BookOpenCheck class="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <!-- Update Style Actions -->
      <div class={buttonClass}>
        <!-- Left side with label and icon -->
					<div class="flex items-center gap-2 text-[0.9em] ml-1">
          <!-- <Heading class="h-4 w-4" /> -->
          <span>Update</span>
        </div>
        
        <!-- Right side with action buttons -->
        <div class="flex items-center gap-1">
          <button 
            class="{miniButtonClass} {props.isProcessing && 'opacity-50 cursor-not-allowed'}"
            onclick={props.onUpdateAllStyles}
            disabled={props.isProcessing}
            title="Update all matching headings at cursor position"
          >
						<TextCursor class="h-3 w-3" />
          </button>
          
          <button 
            class="{miniButtonClass}
                   {props.isProcessing && 'opacity-50 cursor-not-allowed'}
                   {!props.selectedStyle && 'opacity-30 cursor-not-allowed'}"
            onclick={props.onUpdateAllStyles}
            disabled={props.isProcessing || !props.selectedStyle}
            title="Update all {getHeadingDisplay()} headings to match selected style"
          >
            {getHeadingDisplay()}
          </button>
        </div>
      </div>
      
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>

<style>
  .bg-gradient-radial {
    background: radial-gradient(var(--tw-gradient-stops));
  }
</style>