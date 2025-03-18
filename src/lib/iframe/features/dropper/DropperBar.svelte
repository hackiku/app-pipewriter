<!-- $lib/iframe/features/dropper/DropperBar.svelte -->
<script lang="ts">
  import { Link } from 'lucide-svelte';
  
  // State variables
  let elementsThemeStore = $state('light');
  let zenMode = $state(false);
  let chainMode = $state(false);
  let dropperStatus = $state({
    isProcessing: false,
    hasElements: false,
    selectedElements: []
  });
  let gridStore = $state({
    columns: 3
  });
  
  // Theme settings
  const themes = [
    { id: 'light', color: '#FFFFFF', label: 'Light' },
    { id: 'dark', color: '#171717', label: 'Dark' }
  ];
  
  // Grid size options
  const gridSizes = [
    { value: 3, label: '3×' },
    { value: 2, label: '2×' },
    { value: 1, label: '1×' }
  ];
  
  // Current values
  let currentTheme = $derived(() => {
    return themes.find(t => t.id === elementsThemeStore) || themes[0];
  });
  
  let currentGridSize = $derived(() => {
    return gridSizes.find(s => s.value === gridStore.columns) || gridSizes[0];
  });
  
  let nextGridSize = $derived(() => {
    const currentIndex = gridSizes.findIndex(s => s.value === currentGridSize.value);
    return gridSizes[(currentIndex + 1) % gridSizes.length];
  });
  
  let chainModeTooltip = $derived(() => {
    return chainMode 
      ? "Exit chain mode" 
      : "Enter chain mode" + (dropperStatus.hasElements 
          ? ` (${dropperStatus.selectedElements?.length} selected)` 
          : "");
  });
  
  let nextTheme = $derived(() => {
    const currentIndex = themes.findIndex(t => t.id === currentTheme.id);
    return themes[(currentIndex + 1) % themes.length];
  });
  
  // Methods
  function toggleChainMode() {
    chainMode = !chainMode;
  }
  
  function cycleTheme() {
    const currentIndex = themes.findIndex(t => t.id === elementsThemeStore);
    elementsThemeStore = themes[(currentIndex + 1) % themes.length].id;
  }
  
  function cycleGridColumns() {
    const nextColumns = {
      3: 2,
      2: 1,
      1: 3
    };
    gridStore.columns = nextColumns[gridStore.columns];
  }
</script>

<div class="relative dropper-container" class:fixed={zenMode} class:w-full={zenMode}>
  <!-- Background Gradient -->
  <div 
    class="absolute bottom-0 left-0 right-0 h-16
           bg-gradient-to-t from-gray-100 from-20% 
           via-gray-100/80 via-70% to-transparent 
           dark:from-gray-950 dark:via-gray-950/65
           pointer-events-none"
    aria-hidden="true"
  ></div>
  
  <!-- Control Bar -->
  <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 z-40">
    <div class="bg-white dark:bg-gray-900 rounded-t-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <div class="flex px-2 py-1.5 pb-2.5 items-center">
        <!-- Chain Mode Button -->
        <button
          class="rounded-full h-7 w-7 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          onclick={toggleChainMode}
          disabled={dropperStatus.isProcessing}
          title={chainModeTooltip}
        >
          <Link class="w-full h-full" />
        </button>

        <!-- Theme Toggle Button -->
        <button
          class="mr-2.5 ml-2 h-6 w-6 rounded-full border-[0.15em] border-gray-300 dark:border-gray-500
                 transition-all duration-150
                 hover:border-primary/60 dark:hover:border-primary/80 hover:shadow-sm active:scale-95"
          style={`background-color: ${currentTheme.color}`}
          disabled={dropperStatus.isProcessing}
          onclick={cycleTheme}
          title={`Switch to ${nextTheme.label} theme`}
        >
          <span class="sr-only">Switch to {nextTheme.label} theme</span>
        </button>

        <!-- Grid Size Button -->
        <button
          class="h-6.5 w-6 aspect-square rounded-full text-xs font-medium border-[0.15em] border-gray-200 dark:border-gray-500
                 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-gray-700
                 hover:border-primary/60 dark:hover:border-primary/80 hover:shadow-sm active:scale-95
                 text-muted-foreground hover:text-foreground
                 transition-all duration-150"
          disabled={dropperStatus.isProcessing}
          title={`Switch to ${nextGridSize.label} grid`}
          onclick={cycleGridColumns}
        >
          {currentGridSize.label}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .dropper-container {
    position: relative;
    z-index: 10;
  }

  .dropper-container.fixed {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
</style>