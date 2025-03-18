<!-- $lib/iframe/layout/TopBar.svelte -->
<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import { showInfo, zenMode } from '$lib/iframe/stores';
  import { Info, Sun, Moon, Minimize2, MaximizeIcon } from 'lucide-svelte';
  import IconButton from '../components/IconButton.svelte';
  import { fade } from 'svelte/transition';

  function toggleShowInfo() {
    showInfo.update(n => !n);
  }

  function toggleZenMode() {
    zenMode.update(n => !n);
  }

  let isDarkMode = false;

  function handleToggleMode() {
    isDarkMode = !isDarkMode;
    toggleMode();
  }

  // Tooltip contents
  $: zenModeTooltip = $zenMode ? 'Exit Zen Mode' : 'Enter Zen Mode';
  $: infoTooltip = $showInfo ? 'Hide Labels' : 'Show Labels';
</script>

<div class="flex items-center justify-between py-2">
  <IconButton
    icon={Minimize2}
    selected={$zenMode}
    size="sm"
    tooltipContent={zenModeTooltip}
    className="hover:rotate-90 transition-transform duration-200"
    on:click={toggleZenMode}
  />
  
  <div class="flex items-center justify-middle gap-2">
    
		<!-- show info -->
		<IconButton
      icon={Info}
      selected={$showInfo}
      size="sm"
      tooltipContent={infoTooltip}
      className="hover:rotate-12 transition-transform duration-200"
      on:click={toggleShowInfo}
    />
    
    <div class="relative w-7 h-7 mr-1">
      {#key isDarkMode}
        <div
          in:fade={{ duration: 200 }}
          out:fade={{ duration: 200 }}
          class="absolute inset-0"
        >
          <IconButton
            icon={isDarkMode ? Moon : Sun}
            size="sm"
            tooltipContent="Toggle theme"
            className={isDarkMode 
              ? "hover:rotate-12 transition-transform duration-200" 
              : "hover:rotate-90 transition-transform duration-200"
            }
            on:click={handleToggleMode}
          />
        </div>
      {/key}
    </div>
  </div>
</div>

<style>
  /* Optional: Add a subtle transition for the container itself */
  div {
    transition: background-color 0.2s ease;
  }
</style>