<!-- Updated src/lib/features/addon/features/text/TextDropdown.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { ChevronUp, Pipette } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  // Props with SvelteKit 5 syntax
  const props = $props<{
    selectedStyle: any;
    disabled: boolean;
    onSelect: (style: any) => void;
  }>();
  
  // Local state
  let showOptions = $state(false);
  
  // Default text styles that are always available
  const textStyles = [
    { headingType: 'NORMAL', tag: 'p', label: 'Normal text', fontSize: 11 },
    { headingType: 'HEADING1', tag: 'h1', label: 'Heading 1', fontSize: 24 },
    { headingType: 'HEADING2', tag: 'h2', label: 'Heading 2', fontSize: 20 },
    { headingType: 'HEADING3', tag: 'h3', label: 'Heading 3', fontSize: 16 },
    { headingType: 'HEADING4', tag: 'h4', label: 'Heading 4', fontSize: 14 },
    { headingType: 'HEADING5', tag: 'h5', label: 'Heading 5', fontSize: 12 },
    { headingType: 'HEADING6', tag: 'h6', label: 'Heading 6', fontSize: 11 }
  ];

  // Toggle options visibility
  function toggleOptions() {
    if (!props.disabled) {
      showOptions = !showOptions;
    }
  }

  // Select a style and close dropdown
  function handleSelect(style: any) {
    props.onSelect(style);
    showOptions = false;
  }
  
  function getStyleItemClass(style: any) {
    return cn(
      "flex items-center justify-between px-2 py-1.5 rounded-sm transition-colors",
      props.selectedStyle?.headingType === style.headingType && "bg-accent text-accent-foreground",
      "hover:bg-accent hover:text-accent-foreground"
    );
  }

  // Helper to get extracted style attributes for display
  function getExtractedAttributes(selectedStyle: any) {
    if (!selectedStyle?.extracted || !selectedStyle?.attributes?.text) {
      return null;
    }

    const textAttrs = selectedStyle.attributes.text;
    const attributes = [];

    // Add font size if available
    if (textAttrs.FONT_SIZE) {
      attributes.push(`${textAttrs.FONT_SIZE}pt`);
    }

    // Add bold if true
    if (textAttrs.BOLD) {
      attributes.push('Bold');
    }

    // Add italic if true
    if (textAttrs.ITALIC) {
      attributes.push('Italic');
    }

    // Add underline if true
    if (textAttrs.UNDERLINE) {
      attributes.push('Underlined');
    }

    // Add color if available (but not default black)
    if (textAttrs.FOREGROUND_COLOR && textAttrs.FOREGROUND_COLOR !== '#000000') {
      attributes.push(`Color: ${textAttrs.FOREGROUND_COLOR}`);
    }

    // Add background color if available
    if (textAttrs.BACKGROUND_COLOR) {
      attributes.push(`Highlight: ${textAttrs.BACKGROUND_COLOR}`);
    }

    return attributes.length > 0 ? attributes : null;
  }

  // Get display text for selected style with extracted attributes
  function getSelectedStyleDisplay() {
    if (!props.selectedStyle) return null;

    const extractedAttrs = getExtractedAttributes(props.selectedStyle);
    
    return {
      main: props.selectedStyle.label,
      tag: props.selectedStyle.tag,
      attributes: extractedAttrs,
      isExtracted: props.selectedStyle.extracted
    };
  }
</script>

<div class="flex flex-col">
  {#if showOptions}
    <!-- Styles Options Panel -->
    <div 
      class="w-full p-2 bg-popover text-popover-foreground
             rounded-lg border border-border shadow-md mb-2"
      transition:slide={{ duration: 150 }}
    >
      <div class="flex flex-col gap-0.5">
        {#each textStyles as style}
          <button
            class={getStyleItemClass(style)}
            onclick={() => handleSelect(style)}
          >
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground text-xs">{style.tag}</span>
              <span 
                class="text-foreground"
                style={style.fontSize ? `font-size: ${style.fontSize}px` : ''}
              >
                {style.label}
              </span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Main selector button -->
  <button
    class="w-full min-h-10 px-3 py-2 flex items-center justify-between rounded-lg
           border border-input bg-background text-sm shadow-sm 
           transition-all duration-200 hover:bg-accent hover:text-accent-foreground
           disabled:cursor-not-allowed disabled:opacity-50"
    onclick={toggleOptions}
    disabled={props.disabled}
  >
    {#if props.selectedStyle}
      {@const display = getSelectedStyleDisplay()}
      {#if display}
        <div class="flex flex-col items-start gap-0.5 min-w-0 flex-1">
          <!-- Main label with tag -->
          <div class="flex items-center gap-2">
            {#if display.isExtracted}
              <Pipette class="h-3 w-3 text-primary flex-shrink-0" />
            {/if}
            <span class="text-muted-foreground text-xs">{display.tag}</span>
            <span 
              class="text-foreground font-medium"
              style={props.selectedStyle.fontSize ? `font-size: ${Math.min(props.selectedStyle.fontSize, 16)}px` : ''}
            >
              {display.main}
            </span>
          </div>
          
          <!-- Extracted attributes if available -->
          {#if display.attributes}
            <div class="text-xs text-muted-foreground truncate w-full">
              {display.attributes.join(' • ')}
            </div>
          {/if}
        </div>
      {/if}
    {:else}
      <span class="text-muted-foreground">Select text style...</span>
    {/if}
    
    <ChevronUp
      class={cn(
        "h-4 w-4 transition-transform duration-200 text-muted-foreground flex-shrink-0 ml-2",
        !showOptions && "rotate-180"
      )}
    />
  </button>
</div>