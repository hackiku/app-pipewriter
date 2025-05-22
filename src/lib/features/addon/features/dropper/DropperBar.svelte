<!-- $lib/iframe/features/dropper/DropperBar.svelte -->
<script lang="ts">
  import { Link2 } from '@lucide/svelte';
	import ChainActions from './ChainActions.svelte'
  import type { ElementTheme } from '$lib/data/addon/types';
  
  // Props
  const props = $props<{
    isProcessing: boolean;
    theme: string;
    selectedElements: string[];
    chainMode: boolean;
    onToggleTheme: () => void;
    onGridChange: (cols: number) => void;
    onToggleChainMode: () => void;
  }>();
  
  // Grid size options (constant, won't change)
  const gridSizes = [
    { value: 3, label: '3×' },
    { value: 2, label: '2×' },
    { value: 1, label: '1×' }
  ];
  
  // Current grid size (read-only in this component, set only on cycleGridColumns)
  let gridColumns = $state(3);
  
  // Themes configuration (these won't change)
  const themes = [
    { id: 'light', color: '#FFFFFF', label: 'Light' },
    { id: 'dark', color: '#171717', label: 'Dark' }
  ];
  
  // Current theme
  let currentTheme = $derived(() => {
    return themes.find(t => t.id === props.theme) || themes[0];
  });
  
  // Next theme (for UI display)
  let nextTheme = $derived(() => {
    const currentIndex = themes.findIndex(t => t.id === currentTheme.id);
    return themes[(currentIndex + 1) % themes.length];
  });
  
  // Current grid size
  let currentGridSize = $derived(() => {
    return gridSizes.find(s => s.value === gridColumns) || gridSizes[0];
  });
  
  // Next grid size (for UI display)
  let nextGridSize = $derived(() => {
    const currentIndex = gridSizes.findIndex(s => s.value === currentGridSize.value);
    return gridSizes[(currentIndex + 1) % gridSizes.length];
  });
  
  // Methods
  function cycleGridColumns() {
    const nextColumns = {
      3: 2,
      2: 1,
      1: 3
    } as Record<number, number>;
    
    gridColumns = nextColumns[gridColumns];
    props.onGridChange(gridColumns);
    
    console.log(`Grid columns updated to: ${gridColumns}`);
  }
</script>

<div class="relative dropper-container">
	
	<!-- Background Gradient -->
  <div 
    class="absolute bottom-0 left-0 right-0 h-16
           bg-gradient-to-t from-neutral-100 from-20% 
           via-neutral-100/80 via-70% to-transparent 
           dark:from-neutral-950 dark:via-neutral-950/65
           pointer-events-none"
    aria-hidden="true"
  ></div>
  
  <!-- Control Bar -->
  <div class="absolute bottom-0 z-[100] left-5">
		<div class="relative flex items-center gap-2 w-full">
        <!-- Chain Mode Toggle Button -->
        <button
          class="h-10 w-8 rounded-t-full border -mb-1 transition-all duration-150 active:scale-95
                 {props.chainMode 
                   ? 'bg-primary border-border border-b-red-500 text-primary-foreground shadow-sm' 
                   : 'bg-accent/40 border-border  hover:border-primary/60 dark:hover:border-primary/80 hover:shadow-sm'
                 }"
          disabled={props.isProcessing}
          onclick={props.onToggleChainMode}
          title={props.chainMode ? 'Exit chain mode' : 'Enter chain mode - queue elements before inserting'}
        >
          <Link2 size={12} class="mx-auto {props.chainMode ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}" />
          <span class="sr-only">{props.chainMode ? 'Exit chain mode' : 'Enter chain mode'}</span>
        </button>

        <!-- Theme Toggle Button -->
        <button
          class="h-6 w-6 rounded-full border-[0.15em] border-gray-300 dark:border-neutral-500/50
                 transition-all duration-150
                 hover:border-primary/60 dark:hover:border-primary/80 hover:shadow-sm active:scale-95"
          style={`background-color: ${currentTheme.color}`}
          disabled={props.isProcessing}
          onclick={props.onToggleTheme}
          title={`Switch to ${nextTheme.label} theme`}
        >
          <span class="sr-only">Switch to {nextTheme.label} theme</span>
        </button>

        <!-- Grid Size Button -->
        <button
          class="h-6.5 w-6 aspect-square rounded-full text-xs font-medium border-[0.15em] border-neutral-200 dark:border-neutral-500/50
                 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-gray-700
                 hover:border-primary/60 dark:hover:border-primary/80 hover:shadow-sm active:scale-95
                 text-muted-foreground hover:text-foreground
                 transition-all duration-150"
          disabled={props.isProcessing}
          title={`Switch to ${nextGridSize.label} grid`}
          onclick={cycleGridColumns}
        >
          {currentGridSize.label}
        </button>

				<div class="absolute right-2">asdasdasda</div>
      </div>
  </div>
</div>

<style>
  .dropper-container {
    position: relative;
    /* z-index: 10; */
  }
</style>