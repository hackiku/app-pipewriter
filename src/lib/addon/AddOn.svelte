<!-- $lib/iframe/Frame.svelte -->
<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import * as Resizable from "$lib/components/ui/resizable";
  import { onMount, onDestroy, setContext } from "svelte"; 
  import { AppsScriptClient } from "./utils/appsScript";

  import TopBar from "./layout/TopBar.svelte";
  // import Dropper from "./features/Dropper.svelte";
  // import Tabs from "./layout/Tabs.svelte";
  import Dropper from "./layout/Dropper.svelte";
  import Tabs from "./features/Tabs.svelte";
  import BottomBar from "./layout/BottomBar.svelte";
  import AppAbout from "./layout/AppAbout.svelte";
  
  import { zenMode, activeTab } from "./stores";
  import { showAboutModal } from "./stores/aboutStore";

  const appsScript = AppsScriptClient.getInstance(5000);
  setContext('appsScript', appsScript);

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
      class="h-full {$activeTab ? 'z-0' : 'z-10'}"
    >
      <Resizable.Pane 
        defaultSize={55}
        minSize={30} 
        maxSize={80}
      >
        <Dropper />
      </Resizable.Pane>

      {#if !$zenMode}
        <Resizable.Handle 
          withHandle 
          class="{$activeTab || $showAboutModal ? 'z-0' : ''}"
        />
        <Resizable.Pane defaultSize={30} minSize={0} />
      {/if}
    </Resizable.PaneGroup>
  </div>

  {#if !$zenMode}
    <section
      class="fixed bottom-0 w-full flex-none px-2"
      in:fade={{ duration: 200 }}
      out:slide={{ duration: 200, axis: "y" }}
    >
      <div class="mb-2">
        <Tabs />
      </div>
      {#if $showAboutModal}
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