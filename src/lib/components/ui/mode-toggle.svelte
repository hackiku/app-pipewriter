<!-- src/lib/components/ui/mode-toggle.svelte -->
<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import { Button } from "$lib/components/ui/button";
  import { Sun, Moon } from "@lucide/svelte";
  import { fade } from 'svelte/transition';

  // Local state for theme
  let isDarkMode = $state(false);

  function handleToggleMode() {
    isDarkMode = !isDarkMode;
    toggleMode();
  }
</script>

<div class="relative w-7 h-7">
  {#key isDarkMode}
    <div
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
      class="absolute inset-0"
    >
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full h-7 w-7 p-1.5 text-muted-foreground hover:text-foreground"
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