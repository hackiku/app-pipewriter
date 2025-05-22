<!-- src/lib/components/ui/mode-toggle.svelte -->
<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import { Button } from "$lib/components/ui/button";
  import { Sun, Moon } from "@lucide/svelte";
  import { fade } from 'svelte/transition';

  // Local state for theme - you might want to get this from mode-watcher if it exposes current mode
  let isDarkMode = $state(false);

  function handleToggleMode() {
    isDarkMode = !isDarkMode;
    toggleMode();
  }
</script>

<div class="relative w-9 h-9">
  {#key isDarkMode}
    <div
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
      class="absolute inset-0"
    >
      <Button
        variant="outline"
        size="icon"
        class="rounded-md w-9 h-9"
        onclick={handleToggleMode}
      >
        {#if isDarkMode}
          <Moon class="h-4 w-4" />
        {:else}
          <Sun class="h-4 w-4" />
        {/if}
        <span class="sr-only">Toggle theme</span>
      </Button>
    </div>
  {/key}
</div>