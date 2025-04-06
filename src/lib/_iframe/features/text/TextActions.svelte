<!-- $lib/iframe/features/text/TextActions.svelte -->
<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable";
  import { Button } from "$lib/components/ui/button";
  import { Pipette, RefreshCw, Heading } from "lucide-svelte";
  import StyleDropper from "./StyleDropper.svelte";
  import type { ElementTheme } from '$lib/data/addon/types';

  // Props
  const props = $props<{
    isProcessing: boolean;
    selectedStyle: any;
    theme: ElementTheme;
    onStyleGuideInsert: () => void;
    onExtractStyle: () => void;
    onApplyStyle: () => void;
    onResetStyle: () => void;
    onToggleTheme: () => void;
  }>();

  // State for responsive UI
  let rightPaneWidth = $state(0);
  let rightPaneElement = $state<HTMLDivElement | null>(null);
  let compactMode = $derived(rightPaneWidth < 120);

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
</script>

<Resizable.PaneGroup direction="horizontal" class="h-36 gap-2">
  <!-- Left Pane: StyleDropper -->
  <Resizable.Pane defaultSize={40} minSize={25} maxSize={60}>
    <StyleDropper
      isProcessing={props.isProcessing}
      theme={props.theme}
      onStyleGuideInsert={props.onStyleGuideInsert}
      onToggleTheme={props.onToggleTheme}
    />
  </Resizable.Pane>
  
  <Resizable.Handle />
  
  <!-- Right Pane: Action Buttons -->
  <Resizable.Pane defaultSize={60} minSize={40} maxSize={75}>
    <div bind:this={rightPaneElement} class="h-full flex flex-col gap-2">
      <!-- Row 1: Extract Style & Reset -->
      <div class="flex-1 flex gap-2">
        <!-- Extract Style Button -->
        <Button
          variant="outline"
          class="flex-1 flex items-center justify-center text-xs"
          disabled={props.isProcessing}
          onclick={props.onExtractStyle}
        >
          <Pipette class="h-3 w-3 {!compactMode && 'mr-1'}" />
          {#if !compactMode}
            <span>Get</span>
          {/if}
        </Button>
        
        <!-- Reset Button -->
        <Button
          variant="outline"
          class={compactMode ? "flex-1" : "aspect-square"}
          disabled={props.isProcessing || !props.selectedStyle}
          onclick={props.onResetStyle}
          title="Reset style selection"
        >
          <RefreshCw class="h-3 w-3" />
        </Button>
      </div>
      
      <!-- Row 2: Apply Style Button -->
      <div class="flex-1">
        <Button
          variant={props.selectedStyle ? "default" : "outline"}
          class="w-full h-full flex items-center justify-center text-xs"
          disabled={props.isProcessing || !props.selectedStyle}
          onclick={props.onApplyStyle}
        >
          <Heading class="h-3 w-3 mr-1" />
          <span>{compactMode ? "Apply" : `Apply ${props.selectedStyle ? props.selectedStyle.label : 'Style'}`}</span>
        </Button>
      </div>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>