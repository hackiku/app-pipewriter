<!-- $lib/iframe/AddOn.svelte -->
<script lang="ts">
  import { fade, slide } from "svelte/transition";
	import { Button } from "$lib/components/ui/button"

  import TopBar from "./layout/TopBar.svelte";
  import BottomBar from "./layout/BottomBar.svelte";
  import AppAbout from "./layout/AppAbout.svelte";
  import Dropper from "./layout/Dropper.svelte";
  import Tabs from "./features/Tabs.svelte";


  // Using $state for stores
  let zenMode = $state(false);
  let activeTab = $state(false);
  let showAboutModal = $state(false);

  // Simple version of the AppsScript client - can be expanded later
  const mockAppsScriptClient = {
    destroy: () => {
      console.log('Cleanup appsScript client');
    }
  };

  // $effect.cleanup(() => {
  //   mockAppsScriptClient.destroy();
  // });
</script>

<main class="flex flex-col h-[100vh] overflow-hidden">
  <section class="flex-none px-2">
    <TopBar />
  </section>
  <hr />

  <!-- Main content area - simplified for now -->
  <div class="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
    <!-- Placeholder for Dropper component -->
    <div class="h-full flex items-center justify-center text-gray-400">
      <p>Content area (Dropper component will go here)</p>
    </div>
  </div>

  {#if !zenMode}
    <section
      class="fixed bottom-0 w-full flex-none px-2 z-10"
      in:fade={{ duration: 200 }}
      out:slide={{ duration: 200, axis: "y" }}
    >
      <div class="mb-2">
        <!-- Tabs placeholder -->
      </div>
      
      {#if showAboutModal}
        <AppAbout />
      {/if}
      
      <div class="border-t border-gray-200 dark:border-gray-700">
        <!-- Simple BottomBar implementation -->
        <div class="w-full pr-5 h-12 flex items-center justify-between">
          <!-- Docs button -->
          <button 
            class="h-8 px-3 rounded-md border border-gray-300 dark:border-gray-600 
                   bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800
                   text-sm font-medium transition-colors"
          >
            <div class="flex items-center">
              <span>Docs</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2 h-4 w-4">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </div>
          </button>

          <!-- Help Button -->
          <div class="-mt-[1px] flex items-center z-50">
            <Button
              class={`transition-all duration-200 relative z-10 
                    ${showAboutModal
                    ? `w-9 h-11 mb-1 rounded-b-full bg-white dark:bg-slate-900
                       border-b border-l border-r border-gray-300 dark:border-gray-600
                       after:content-[''] after:absolute after:top-[-1px] 
                       after:left-0 after:right-0 after:h-[1px] after:bg-inherit`
                    : "w-9 h-9 rounded-full -mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"}`}
              onclick={() => showAboutModal = !showAboutModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mx-auto">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </section>
  {/if}
</main>