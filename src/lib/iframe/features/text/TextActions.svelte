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
</script>

<Resizable.PaneGroup direction="horizontal" class="h-36 gap-3">
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
    <div class="h-full flex flex-col _gap-1">
      <!-- Row 1: Extract Style & Reset -->
      <div class="flex-1 flex __gap-2">
        <Button
          variant="outline"
          class="flex-1 flex items-center justify-center text-xs"
          disabled={props.isProcessing}
          onclick={props.onExtractStyle}
        >
          <Pipette class="h-2 w-2 mr-1" />
          <span>Get</span>
        </Button>
        
        <Button
          variant="outline"
          class="aspect-square"
          disabled={props.isProcessing || !props.selectedStyle}
          onclick={props.onResetStyle}
          title="Reset style selection"
        >
          <RefreshCw class="h-3 w-3" />
        </Button>
      </div>
      
      <!-- Row 2: Apply Style -->
      <div class="flex-1">
        <Button
          variant={props.selectedStyle ? "default" : "outline"}
          class="w-full h-full flex items-center justify-center text-xs"
          disabled={props.isProcessing || !props.selectedStyle}
          onclick={props.onApplyStyle}
        >
          <Heading class="h-2 w-2 mr-1" />
          <span>Apply {props.selectedStyle ? props.selectedStyle.label : 'Style'}</span>
        </Button>
      </div>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>