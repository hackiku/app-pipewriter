<!-- $lib/iframe/features/dropper/ChainDropper.svelte -->
<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Link, ArrowRight } from "lucide-svelte";
  
  // State
  let chainMode = $state(false);
  let showAboutModal = $state(false);
  let showTooltip = $state(false);
  
  function toggleAboutModal() {
    showAboutModal = true;
  }
  
  function toggleChainMode() {
    chainMode = false;
  }
</script>

{#if chainMode}
  <div
    class="absolute inset-0 z-10 bg-white dark:bg-gray-900"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="flex flex-col items-center justify-center h-full gap-4 p-4"
      transition:slide={{ duration: 300, axis: "y" }}
    >
      <Badge variant="outline" class="mb-1 dark:text-gray-300 dark:border-gray-600">Coming Soon</Badge>

      <div class="text-center space-y-3 max-w-xs">
        <h3 class="text-lg font-semibold text-foreground dark:text-gray-100">
          Chain Drop Feature
        </h3>
        <p class="text-sm text-muted-foreground dark:text-gray-400">
          Soon you'll be able to chain multiple elements together and drop them
          as a sequence. Perfect for building complete page sections in one go.
        </p>
      </div>

      <div class="flex flex-col align-center space-y-3">
        <Button
          variant="outline"
          size="sm"
          class="gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          onclick={toggleAboutModal}
        >
          Stay Updated
          <ArrowRight class="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          class="gap-2 dark:text-gray-400 dark:hover:bg-gray-700"
          onclick={toggleChainMode}
        >
          <Link class="w-4 h-4" />
          Exit Chain Mode
        </Button>
      </div>
    </div>
  </div>
{/if}