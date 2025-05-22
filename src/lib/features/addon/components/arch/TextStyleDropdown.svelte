<!-- src/lib/iframe/components/TextStyleDropdown.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import { ChevronUp, X } from "lucide-svelte";
  import { cn } from "$lib/utils";

  export let selectedStyle: any = null;
  export let savedStyles: any[] = [];
  export let disabled = false;

  let showOptions = false;
  const dispatch = createEventDispatcher();

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

  $: allStyles = [
    ...savedStyles.map(s => ({ ...s, saved: true })),
    ...defaultStyles.filter(d => !savedStyles.find(s => s.headingType === d.headingType))
  ];

  $: savedCount = savedStyles.length;
</script>

<div class="relative">
  <!-- Options Dropdown -->
  {#if showOptions}
    <div
      class="absolute bottom-full mb-1 w-full p-2 bg-white dark:bg-gray-800 
             rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-20"
      transition:slide={{ duration: 150, axis: "y" }}
    >
      <div class="flex flex-col gap-0.5">
        {#each allStyles as style}
          <div class={cn(
            "flex items-center justify-between px-2 py-1.5 rounded-sm group transition-colors",
            style.saved && "bg-gray-500/5 border-2 border-primary",
            !style.saved && "hover:bg-gray-50 dark:hover:bg-gray-700",
            selectedStyle?.headingType === style.headingType && "bg-gray-100 dark:bg-gray-700"
          )}>
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
      class={cn(
        "h-full w-full px-3 font-mono text-xs flex items-center justify-between",
        "border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        selectedStyle?.saved && "bg-gray-500/5 border-2 border-primary",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      {disabled}
      on:click={() => showOptions = !showOptions}
    >
      <div class="flex items-center gap-2">
        {#if selectedStyle}
          <span class="opacity-70">{selectedStyle.tag}</span>
          <span 
            class="text-muted-foreground"
            style={selectedStyle.fontSize ? `font-size: ${selectedStyle.fontSize}px` : ''}
          >
            {selectedStyle.label}
          </span>
        {:else}
          <span class="opacity-70">
            {savedCount > 0 ? 'Saved styles...' : 'No saved styles'}
          </span>
        {/if}
      </div>
      
      <!-- Counter Badge -->
      {#if savedCount >= 0}
        <div class="flex items-center gap-2">
          <div class="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 
                    flex items-center justify-center text-[10px]">
            {savedCount}
          </div>
          <ChevronUp
            class={cn(
              "h-4 w-4 transition-transform duration-200",
              showOptions && "rotate-180"
            )}
          />
        </div>
      {:else}
        <ChevronUp
          class={cn(
            "h-4 w-4 transition-transform duration-200",
            showOptions && "rotate-180"
          )}
        />
      {/if}
    </button>
  </div>
</div>