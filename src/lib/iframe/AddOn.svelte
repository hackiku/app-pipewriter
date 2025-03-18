<!-- $lib/iframe/AddOn.svelte -->
<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import * as Resizable from "$lib/components/ui/resizable";
  import { browser } from '$app/environment';
  
  import TopBar from "./layout/TopBar.svelte";
  import BottomBar from "./layout/BottomBar.svelte";
  import AppAbout from "./layout/AppAbout.svelte";
  import Dropper from "./features/Dropper.svelte";
  import Tabs from "./features/Tabs.svelte";
  import { AppsScriptClient } from "./utils/appsScript";

  // Component state with Runes
  let zenMode = $state(false);
  let activeTab = $state(false);
  let showAboutModal = $state(false);

  // AppsScript client
  let appsScript = $state<any>(null);
  
  // Initialize AppsScript client
  $effect(() => {
    if (browser) {
      appsScript = AppsScriptClient.getInstance(5000);
    }
  });
  
  // Create context for child components
  let context = $derived(() => ({
    appsScript
  }));

  // Cleanup on destroy
  $effect(() => {
    return () => {
      if (browser && appsScript) {
        appsScript.destroy();
      }
    };
  });
  
  // Toggle modal visibility
  function toggleAboutModal() {
    showAboutModal = !showAboutModal;
  }
  
  // Toggle zen mode
  function toggleZenMode() {
    zenMode = !zenMode;
  }
</script>

<main class="flex flex-col h-[100vh] overflow-hidden w-[300px]">
  <section class="flex-none px-2">
    <TopBar 
      {zenMode}
      onToggleZenMode={toggleZenMode}
    />
  </section>
  <hr />

  <div class="flex-1 overflow-hidden">
    <Resizable.PaneGroup 
      direction="vertical" 
      class="h-full {activeTab ? 'z-0' : 'z-10'}"
    >
      <Resizable.Pane 
        defaultSize={55}
        minSize={30} 
        maxSize={80}
      >
        <!-- Only render Dropper if appsScript is available -->
        {#if appsScript}
          <Dropper {context} />
        {:else}
          <div class="h-full flex items-center justify-center text-gray-400">
            <p>Loading Dropper component...</p>
          </div>
        {/if}
      </Resizable.Pane>

      {#if !zenMode}
        <Resizable.Handle 
          withHandle 
          class={activeTab || showAboutModal ? 'z-0' : ''}
        />
        <Resizable.Pane defaultSize={30} minSize={0}>
          <!-- Placeholder for future pane content -->
        </Resizable.Pane>
      {/if}
    </Resizable.PaneGroup>
  </div>

  {#if !zenMode}
    <section
      class="fixed bottom-0 w-[300px] flex-none px-2 z-10"
      in:fade={{ duration: 200 }}
      out:slide={{ duration: 200, axis: "y" }}
    >
      <div class="mb-2">
        <Tabs {context} />
      </div>
      
      <div class="border-t border-gray-200 dark:border-gray-700">
        <BottomBar 
          onToggleAboutModal={toggleAboutModal}
        />
      </div>
      
      {#if showAboutModal}
        <AppAbout onClose={() => showAboutModal = false} />
      {/if}
    </section>
  {/if}
</main>

<style>
  :global(.resizable-handle) {
    margin-bottom: 4rem;
  }
</style>