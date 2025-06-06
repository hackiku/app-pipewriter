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

  // Get style attributes for display - simplified
  function getDisplayAttributes(selectedStyle: any) {
    if (!selectedStyle) return null;

    const attributes = [];

    if (selectedStyle.extracted && selectedStyle.attributes?.text) {
      // Extracted style - show what we have
      const textAttrs = selectedStyle.attributes.text;
      
      if (textAttrs.FONT_SIZE) attributes.push(`${textAttrs.FONT_SIZE}pt`);
      if (textAttrs.FONT_FAMILY) attributes.push(textAttrs.FONT_FAMILY);
      if (textAttrs.BOLD === true) attributes.push('Bold');
      if (textAttrs.ITALIC === true) attributes.push('Italic');
      if (textAttrs.UNDERLINE === true) attributes.push('Underlined');
      if (textAttrs.FOREGROUND_COLOR && textAttrs.FOREGROUND_COLOR !== '#000000') {
        attributes.push(`Color: ${textAttrs.FOREGROUND_COLOR}`);
      }
      if (textAttrs.BACKGROUND_COLOR) {
        attributes.push(`Highlight: ${textAttrs.BACKGROUND_COLOR}`);
      }
    } else {
      // Default style - show template info
      const defaultStyle = textStyles.find(s => s.headingType === selectedStyle.headingType);
      if (defaultStyle) {
        attributes.push(`${defaultStyle.fontSize}pt`);
        attributes.push(defaultStyle.font);
        if (defaultStyle.weight !== 'Normal') attributes.push(defaultStyle.weight);
        if (defaultStyle.color !== '#000000') attributes.push(`Color: ${defaultStyle.color}`);
      }
    }

    return attributes.length > 0 ? attributes : null;
  }

  // Get color for text display - simplified
  function getTextColor(selectedStyle: any) {
    if (selectedStyle?.extracted && selectedStyle.attributes?.text?.FOREGROUND_COLOR) {
      return selectedStyle.attributes.text.FOREGROUND_COLOR;
    }
    
    const defaultStyle = textStyles.find(s => s.headingType === selectedStyle?.headingType);
    return defaultStyle?.color || '#000000';
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
            <div class="flex items-center gap-2 min-w-0 w-full">
              <span class="text-muted-foreground text-xs w-6 flex-shrink-0">{style.tag}</span>
              <span 
                class="text-foreground flex-1 truncate text-left"
                style="font-size: {Math.min(style.fontSize, 16)}px; color: {style.color}; font-weight: {style.weight === 'Bold' ? 'bold' : style.weight === 'Semibold' ? '600' : 'normal'};"
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
    class="w-full min-h-12 px-3 py-2 flex items-center justify-between rounded-lg
           border border-input bg-background text-sm shadow-sm 
           transition-all duration-200 hover:bg-accent hover:text-accent-foreground
           disabled:cursor-not-allowed disabled:opacity-50"
    onclick={toggleOptions}
    disabled={props.disabled}
  >
    {#if props.selectedStyle}
      <div class="flex flex-col items-start gap-0.5 min-w-0 flex-1">
        <!-- Main label with tag -->
        <div class="flex items-center gap-2 min-w-0 w-full">
          {#if props.selectedStyle.extracted}
            <Pipette class="h-3 w-3 text-primary flex-shrink-0" />
          {/if}
          <span class="text-muted-foreground text-xs w-6 flex-shrink-0">{props.selectedStyle.tag}</span>
          <span 
            class="text-foreground flex-1 truncate text-left"
            style="color: {getTextColor(props.selectedStyle)};"
          >
            {props.selectedStyle.label}
          </span>
        </div>
        
        <!-- Style attributes - always show if selected -->
        {#if getDisplayAttributes(props.selectedStyle)}
          <div class="text-xs text-muted-foreground truncate w-full pl-6">
            {getDisplayAttributes(props.selectedStyle).join(' • ')}
          </div>
        {/if}
      </div>
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