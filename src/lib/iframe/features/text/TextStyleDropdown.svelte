<!-- $lib/iframe/features/text/TextStyleDropdown.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { ChevronUp } from "lucide-svelte";
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

  function handleSelect(style: any) {
    props.onSelect(style);
    showOptions = false;
  }
  
  function toggleDropdown() {
    if (!props.disabled) {
      showOptions = !showOptions;
    }
  }
  
  function getStyleItemClass(style: any) {
    return cn(
      "flex items-center justify-between px-2 py-1.5 rounded-sm transition-colors",
      props.selectedStyle?.headingType === style.headingType && "bg-gray-100 dark:bg-gray-700",
      "hover:bg-gray-50 dark:hover:bg-gray-700"
    );
  }
</script>

<div class="relative">
  <!-- Main Button -->
  <button
    class="w-full h-10 px-3 flex items-center justify-between rounded-lg
           border border-input bg-white dark:bg-gray-800 text-sm shadow-sm 
           transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
    onclick={toggleDropdown}
    disabled={props.disabled}
  >
    {#if props.selectedStyle}
      <div class="flex items-center gap-2">
        <span class="opacity-70">{props.selectedStyle.tag}</span>
        <span 
          class="text-muted-foreground"
          style={props.selectedStyle.fontSize ? `font-size: ${props.selectedStyle.fontSize}px` : ''}
        >
          {props.selectedStyle.label}
        </span>
      </div>
    {:else}
      <span class="text-muted-foreground">Select text style...</span>
    {/if}
    <ChevronUp
      class={cn(
        "h-4 w-4 transition-transform duration-200",
        !showOptions && "rotate-180"
      )}
    />
  </button>

  <!-- Dropdown Options -->
  {#if showOptions}
    <div
      class="absolute bottom-full mb-1 w-full p-2 bg-white dark:bg-gray-800 
             rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-20"
      transition:slide={{ duration: 150, axis: "y" }}
    >
      <div class="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
        {#each textStyles as style}
          <button
            class={getStyleItemClass(style)}
            onclick={() => handleSelect(style)}
          >
            <div class="flex items-center gap-2">
              <span class="opacity-70 text-xs">{style.tag}</span>
              <span 
                class="text-muted-foreground"
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
</div>