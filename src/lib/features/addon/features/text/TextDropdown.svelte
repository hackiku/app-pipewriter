<!-- Updated src/lib/features/addon/features/text/TextDropdown.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { ChevronUp, Pipette } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import type { HeadingType } from '$lib/services/google/text';

  // Props with SvelteKit 5 syntax
  const props = $props<{
    selectedStyle: any;
    disabled: boolean;
    onSelect: (style: any) => void;
  }>();
  
  // Local state
  let showOptions = $state(false);
  
  // Text styles matching your style guide exactly
  const textStyles = [
    { headingType: 'NORMAL', tag: 'p', label: 'Normal', fontSize: 11, font: 'DM Sans', weight: 'Normal', color: '#000000' },
    { headingType: 'HEADING1', tag: 'h1', label: 'Heading 1', fontSize: 32, font: 'Inter Tight', weight: 'Semibold', color: '#000000' },
    { headingType: 'HEADING2', tag: 'h2', label: 'Heading 2', fontSize: 22, font: 'Inter Tight', weight: 'Semibold', color: '#000000' },
    { headingType: 'HEADING3', tag: 'h3', label: 'Heading 3', fontSize: 16, font: 'Inter Tight', weight: 'Bold', color: '#000000' },
    { headingType: 'HEADING4', tag: 'h4', label: 'Heading 4', fontSize: 14, font: 'Inter Tight', weight: 'Bold', color: '#000000' },
    { headingType: 'HEADING5', tag: 'h5', label: 'Heading 5', fontSize: 11, font: 'Inter Tight', weight: 'Semibold', color: '#b7b7b7' },
    { headingType: 'HEADING6', tag: 'h6', label: 'Heading 6', fontSize: 13, font: 'Inter Tight', weight: 'Semibold', color: '#666666' }
  ];

  // Style mapping functions (moved from parent)
  export function determineHeadingType(docHeading: any): HeadingType {
    // Handle both string names and actual DocumentApp enum values
    if (typeof docHeading === 'string') {
      const headingMap: Record<string, HeadingType> = {
        'NORMAL': 'NORMAL',
        'HEADING1': 'HEADING1', 
        'HEADING2': 'HEADING2',
        'HEADING3': 'HEADING3',
        'HEADING4': 'HEADING4',
        'HEADING5': 'HEADING5',
        'HEADING6': 'HEADING6'
      };
      return headingMap[docHeading] || 'NORMAL';
    }
    
    // If it's an enum value, convert to string first
    const headingStr = docHeading?.toString?.() || 'NORMAL';
    return determineHeadingType(headingStr);
  }

  export function getTagForHeading(headingType: HeadingType): string {
    const tagMap: Record<HeadingType, string> = {
      'NORMAL': 'p',
      'HEADING1': 'h1',
      'HEADING2': 'h2', 
      'HEADING3': 'h3',
      'HEADING4': 'h4',
      'HEADING5': 'h5',
      'HEADING6': 'h6'
    };
    return tagMap[headingType];
  }

  export function getLabelForHeading(headingType: HeadingType): string {
    const style = textStyles.find(s => s.headingType === headingType);
    return style?.label || 'Unknown';
  }

  // Create extracted style from Google Docs response
  export function createExtractedStyle(responseData: any) {
    const { textAttributes, paragraphAttributes, heading } = responseData;
    
    // Determine heading type from response
    const headingType = determineHeadingType(heading);
    
    // Create extracted style object
    return {
      headingType: headingType,
      tag: getTagForHeading(headingType),
      label: getLabelForHeading(headingType),
      fontSize: textAttributes?.FONT_SIZE || textStyles.find(s => s.headingType === headingType)?.fontSize,
      extracted: true,
      attributes: {
        text: textAttributes || {},
        paragraph: paragraphAttributes || {}
      }
    };
  }

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

    // Add font size if available and different from default
    if (textAttrs.FONT_SIZE && textAttrs.FONT_SIZE !== null) {
      attributes.push(`${textAttrs.FONT_SIZE}pt`);
    }

    // Add font family if available and not default
    if (textAttrs.FONT_FAMILY && textAttrs.FONT_FAMILY !== null && textAttrs.FONT_FAMILY !== 'Default') {
      attributes.push(textAttrs.FONT_FAMILY);
    }

    // Add bold if true
    if (textAttrs.BOLD === true) {
      attributes.push('Bold');
    }

    // Add italic if true  
    if (textAttrs.ITALIC === true) {
      attributes.push('Italic');
    }

    // Add underline if true
    if (textAttrs.UNDERLINE === true) {
      attributes.push('Underlined');
    }

    // Add color if available (but not default black)
    if (textAttrs.FOREGROUND_COLOR && 
        textAttrs.FOREGROUND_COLOR !== '#000000' && 
        textAttrs.FOREGROUND_COLOR !== null &&
        textAttrs.FOREGROUND_COLOR !== 'Default') {
      attributes.push(`Color: ${textAttrs.FOREGROUND_COLOR}`);
    }

    // Add background color if available
    if (textAttrs.BACKGROUND_COLOR && 
        textAttrs.BACKGROUND_COLOR !== null &&
        textAttrs.BACKGROUND_COLOR !== 'Default') {
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

  // Get display font size for style items
  function getDisplayFontSize(style: any) {
    if (props.selectedStyle?.fontSize) {
      return Math.min(props.selectedStyle.fontSize, 16);
    }
    return Math.min(style.fontSize, 16);
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
              <span class="text-muted-foreground text-xs w-6">{style.tag}</span>
              <span 
                class="text-foreground flex-1"
                style="font-size: {Math.min(style.fontSize, 16)}px; color: {style.color}; font-weight: {style.weight === 'Bold' ? 'bold' : style.weight === 'Semibold' ? '600' : 'normal'};"
              >
                {style.label}
              </span>
              <span class="text-muted-foreground text-xs">
                {style.fontSize}pt
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
            <span class="text-muted-foreground text-xs w-6">{display.tag}</span>
            <span 
              class="text-foreground font-medium"
              style="font-size: {Math.min(props.selectedStyle.fontSize || 14, 16)}px"
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