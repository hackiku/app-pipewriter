<!-- $lib/iframe/layout/TopBar.svelte -->
<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import { getContext } from "svelte";
  import { Info, Sun, Moon, Minimize2 } from '@lucide/svelte';
  import { fade } from 'svelte/transition';
  import { Button } from "$lib/components/ui/button";

  // Get UI state from context
  const uiState = getContext('uiState');

  // Local state for theme
  let isDarkMode = $state(false);

  function handleToggleMode() {
    isDarkMode = !isDarkMode;
    toggleMode();
  }
</script>

<div class="flex items-center justify-between py-2">
  <!-- Zen Mode Button -->
  <Button 
    variant="ghost"
    size="icon"
    class="rounded-full h-7 w-7 p-1.5 {uiState.zenMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}" 
    onclick={uiState.toggleZenMode}
  >
    <Minimize2 class="h-4 w-4" />
  </Button>
  
  <div class="flex items-center justify-middle gap-2">
    <!-- Info Button -->
    <Button
      variant="ghost"
      size="icon"
      class="rounded-full h-7 w-7 p-1.5 {uiState.showInfo ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}"
      onclick={uiState.toggleShowInfo}
    >
      <Info class="h-4 w-4" />
    </Button>
    
    <!-- Theme Toggle Button -->
    <div class="relative w-7 h-7 mr-1">
      {#key isDarkMode}
        <div
          in:fade={{ duration: 200 }}
          out:fade={{ duration: 200 }}
          class="absolute inset-0"
        >
          <Button
            variant="ghost"
            size="icon"
            class="rounded-full h-7 w-7 p-1.5 text-muted-foreground"
            onclick={handleToggleMode}
          >
            {#if isDarkMode}
              <Moon class="h-4 w-4" />
            {:else}
              <Sun class="h-4 w-4" />
            {/if}
          </Button>
        </div>
      {/key}
    </div>
  </div>
</div>