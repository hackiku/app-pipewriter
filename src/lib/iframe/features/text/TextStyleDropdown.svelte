<!-- src/lib/iframe/features/text/TextStyleDropdown.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import { ChevronUp, X } from "lucide-svelte";
  import { cn } from "$lib/utils";

  // Props with SvelteKit 5 syntax
  const props = $props<{
    selectedStyle: any;
    savedStyles: any[];
    disabled: boolean;
  }>();
  
  // Local state
  let showOptions = $state(false);
  
  const dispatch = createEventDispatcher();

  // Default text styles that are always available
  const defaultStyles = [
    { headingType: 'NORMAL', tag: 'p', label: 'Normal text', fontSize: 11 },
    { headingType: 'HEADING1', tag: 'h1', label: 'Heading 1', fontSize: 24 },
    { headingType: 'HEADING2', tag: 'h2', label: 'Heading 2', fontSize: 20 },
    { headingType: 'HEADING3', tag: 'h3', label: 'Heading 3', fontSize: 16 },
    { headingType: 'HEADING4', tag: 'h4', label: 'Heading 4', fontSize: 14 },
    { headingType: 'HEADING5', tag: 'h5', label: 'Heading 5', fontSize: 12 },
    { headingType: 'HEADING6', tag: 'h6', label: 'Heading 6', fontSize: 11 }
  ];

  function handleSelect(style: any) {
    dispatch("select", style);
    showOptions = false;
  }

  function handleDeleteStyle(style: any, e: MouseEvent) {
    e.stopPropagation();
    dispatch("deleteStyle", style);
  }

  // Calculate all available styles, combining saved and default styles
  let allStyles = $derived(() => {
    // Mark saved styles
    const savedWithFlag = props.savedStyles.map(s => ({ ...s, saved: true }));
    
    // Filter out default styles that are already saved
    const filteredDefaults = defaultStyles.filter(d => 
      !props.savedStyles.find(s => s.headingType === d.headingType)
    );
    
    // Combine saved and default styles
    return [...savedWithFlag, ...filteredDefaults];
  });

  // Count of saved styles
  let savedCount = $derived(() => props.savedStyles.length);
  
  // Get button class dynamically
  function getButtonClass() {
    return cn(
      "h-full w-full px-3 font-mono text-xs flex items-center justify-between",
      "border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
      props.selectedStyle?.saved && "bg-gray-500/5 border-2 border-primary",
      props.disabled && "opacity-50 cursor-not-allowed"
    );
  }
  
  // Get style item class
  function getStyleItemClass(style: any) {
    return cn(
      "flex items-center justify-between px-2 py-1.5 rounded-sm group transition-colors",
      style.saved && "bg-gray-500/5 border-l-2 border-primary",
      !style.saved && "hover:bg-gray-50 dark:hover:bg-gray-700",
      props.selectedStyle?.headingType === style.headingType && "bg-gray-100 dark:bg-gray-700"
    );
  }
</script>

<div class="relative">
  <!-- Options Dropdown -->
  {#if showOptions}
    <div
      class="absolute bottom-full mb-1 w-full p-2 bg-white dark:bg-gray-800 
             rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-20"
      transition:slide={{ duration: 150, axis: "y" }}
    >
      <div class="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
        {#each allStyles as style}
          <div class={getStyleItemClass(style)}>
            <button
              class="flex-1 text-left text-[10px] font-mono"
              on:click={() => handleSelect(style)}
            >
              <div class="flex items-center gap-2">
                <span class="opacity-70">{style.tag}</span>
                <span 
                  class="text-[9px] text-muted-foreground"
                  style={style.fontSize ? `font-size: ${style.fontSize}px` : ''}
                >
                  {style.label}
                </span>
              </div>
            </button>
            {#if style.saved}
              <button 
                class="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 
                       dark:hover:bg-gray-600 rounded-full transition-opacity"
                on:click={(e) => handleDeleteStyle(style, e)}
              >
                <X class="h-3 w-3" />
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Main Button -->
  <div class="flex gap-2 h-8">
    <button
      class={getButtonClass()}
      disabled={props.disabled}
      on:click={() => showOptions = !showOptions}
    >
      <div class="flex items-center gap-2">
        {#if props.selectedStyle}
          <span class="opacity-70">{props.selectedStyle.tag}</span>
          <span 
            class="text-muted-foreground"
            style={props.selectedStyle.fontSize ? `font-size: ${props.selectedStyle.fontSize}px` : ''}
          >
            {props.selectedStyle.label}
          </span>
        {:else}
          <span class="opacity-70">
            {savedCount > 0 ? 'Saved styles...' : 'Select style...'}
          </span>
        {/if}
      </div>
      
      <!-- Counter Badge -->
      <div class="flex items-center gap-2">
        {#if savedCount > 0}
          <div class="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 
                    flex items-center justify-center text-[10px]">
            {savedCount}
          </div>
        {/if}
        <ChevronUp
          class={cn(
            "h-4 w-4 transition-transform duration-200",
            !showOptions && "rotate-180"
          )}
        />
      </div>
    </button>
  </div>
</div>