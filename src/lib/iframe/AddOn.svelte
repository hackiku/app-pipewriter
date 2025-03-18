<!-- $lib/iframe/AddOn.svelte -->
<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import * as Resizable from "$lib/components/ui/resizable";
  import { onDestroy } from "svelte";
  
  import TopBar from "./layout/TopBar.svelte";
  import BottomBar from "./layout/BottomBar.svelte";
  import AppAbout from "./layout/AppAbout.svelte";
  import Dropper from "./layout/Dropper.svelte";
  import Tabs from "./features/Tabs.svelte";
  import { AppsScriptClient } from "./utils/appsScript";

  // Using $state for stores
  let zenMode = $state(false);
  let activeTab = $state(false);
  let showAboutModal = $state(false);

  // Create instance of AppsScript client
  const appsScript = AppsScriptClient.getInstance(5000);
  
  // Create a context similar to setContext
  const context = {
    appsScript
  };

  // Handle cleanup on component destruction
  onDestroy(() => {
    appsScript.destroy();
  });
</script>

<main class="flex flex-col h-[100vh] overflow-hidden">
  <section class="flex-none px-2">
    <TopBar />
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
				Dropper
        <!-- <Dropper {context} /> -->
      </Resizable.Pane>

      {#if !zenMode}
        <Resizable.Handle 
          withHandle 
          class="{activeTab || showAboutModal ? 'z-0' : ''}"
        />
        <Resizable.Pane defaultSize={30} minSize={0} />
      {/if}
    </Resizable.PaneGroup>
  </div>

  {#if !zenMode}
    <section
      class="fixed bottom-0 w-full flex-none px-2 z-10"
      in:fade={{ duration: 200 }}
      out:slide={{ duration: 200, axis: "y" }}
    >
      <div class="mb-2">
        <!-- <Tabs {context} /> -->
      </div>
      
      {#if showAboutModal}
        <AppAbout />
      {/if}
      
      <div class="border-t border-gray-200 dark:border-gray-700">
        <BottomBar />
      </div>
    </section>
  {/if}
</main>

<style>
  :global(.resizable-handle) {
    margin-bottom: 4rem;
  }
</style>