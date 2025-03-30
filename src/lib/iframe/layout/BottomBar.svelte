<!-- $lib/iframe/layout/BottomBar.svelte -->
<script lang="ts">
  import { ExternalLink, HelpCircle, FileText, ChevronUp } from 'lucide-svelte';
  import AppAbout from './AppAbout.svelte';
  // import UserAvatar from './user/UserAvatar.svelte'
  // Import template data
  import { docLinks, DRIVE_FOLDER_URL } from '$lib/data/addon/templateDocs';
  
  // Props
  const props = $props<{
    onToggleAboutModal: () => void
  }>();
  
  // State variables 
  let showAboutModal = $state(false);
  let showInfo = $state(false);
  let dropdownOpen = $state(false);
  
  const BG_STYLE = 'bg-white dark:bg-slate-900';
  
  function openUrl(url: string) {
    window.open(url, '_blank');
  }

  function toggleAboutModal() {
    showAboutModal = !showAboutModal;
    if (typeof props.onToggleAboutModal === 'function') {
      props.onToggleAboutModal();
    }
  }
  
  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  // Computed button class with conditional styling
  let buttonClass = $derived(`transition-all duration-200 relative z-10 ${
    showAboutModal
      ? `w-9 h-11 mb-1 rounded-b-full ${BG_STYLE} 
         border-b border-l border-r border-gray-300 dark:border-gray-600
         after:content-[''] after:absolute after:top-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-inherit`
      : "w-9 h-9 rounded-full -mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
  }`);
</script>

<div class="w-full pr-5 h-12 flex items-center justify-between">
  <!-- Docs Dropdown -->
  <div class="relative">
    <button 
      class="h-8 px-3 rounded-md border border-gray-300 dark:border-gray-600 
             bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800
             text-sm font-medium transition-colors flex items-center"
      onclick={toggleDropdown}
    >
      <span>Docs</span>
      <ChevronUp class="ml-2 h-4 w-4" style={dropdownOpen ? '' : 'transform: rotate(180deg)'} />
    </button>

    {#if dropdownOpen}
      <div 
        class="absolute bottom-full mb-1 w-64 rounded-md border border-gray-200 
               dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-50"
      >
        <div class="py-1 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          Templates
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700"></div>
        
        <div class="py-1">
          {#each docLinks as link}
            <button 
              class="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-sm"
              onclick={() => openUrl(link.url)}
            >
              <div class="flex items-start gap-2">
                <!-- <FileText class="h-4 w-4 mt-0.5" /> -->
                <img class="h-4 w-4 mt-1" src="/icons/gdocs-square.svg" alt="Google Docs square icon"/>
                <div class="flex flex-col">
                  <span>{link.title}</span>
                  {#if showInfo}
                    <span class="text-xs text-gray-500 dark:text-gray-400">{link.desc}</span>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700"></div>
        
        <button 
          class="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-sm"
          onclick={() => openUrl(DRIVE_FOLDER_URL)}
        >
          <div class="flex items-center gap-2">
						<img class="h-4 w-4 smt-0.5" src="/icons/google-drive.svg" alt="Google Docs square icon"/>
						<span>Drive Folder</span>
            <ExternalLink class="h-4 w-4" />
          </div>
        </button>
      </div>
    {/if}
  </div>

  <!-- Help Button -->
  <div class="-mt-[1px] flex items-center">
    <button
      class={buttonClass}
      onclick={toggleAboutModal}
      title="Help & About"
    >
      <HelpCircle class="h-4 w-4 mx-auto" />
    </button>
  </div>
  <!-- <UserAvatar /> -->
  <!-- About Modal -->
  <AppAbout 
    showAboutModal={showAboutModal}
    onToggleAboutModal={toggleAboutModal}
  />
</div>

<style>
  /* Optional: Add dropdown animation */
  div[class*="absolute"] {
    animation: slideIn 0.15s ease-out;
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }


</style>


