<!-- $lib/iframe/layout/BottomBar.svelte -->
<script lang="ts">
  import { ExternalLink, HelpCircle, FileText, ChevronUp } from 'lucide-svelte';
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import { showAboutModal } from '../stores/aboutStore';
  import { showInfo } from '../stores';
  import { docLinks, DRIVE_FOLDER_URL } from '$lib/data/addon/templateDocs';

  const BG_STYLE = 'bg-white dark:bg-slate-900';
  
  function openUrl(url: string) {
    window.open(url, '_blank');
  }

  function toggleAboutModal() {
    showAboutModal.update(n => !n);
  }

  $: buttonClass = cn(
    "transition-all duration-200 relative z-10",
    $showAboutModal
      ? `w-9 h-11 mb-1 rounded-b-full ${BG_STYLE} 
         border-b border-l border-r border-gray-300 dark:border-gray-600
         after:content-[''] after:absolute after:top-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-inherit`
      : "w-9 h-9 rounded-full -mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
  );
</script>

<div class="w-full pr-5 h-12 flex items-center justify-between">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
      <Button 
        variant="outline" 
        builders={[builder]}
        class="h-8 px-3"
      >
        <span>Docs</span>
        <ChevronUp class="ml-2 h-4 w-4" />
      </Button>
    </DropdownMenu.Trigger>

    <DropdownMenu.Content side="top" align="start" class="w-64">
      <DropdownMenu.Label>Templates</DropdownMenu.Label>
      <DropdownMenu.Separator />

      <DropdownMenu.Group>
        {#each docLinks as link}
          <DropdownMenu.Item on:click={() => openUrl(link.url)}>
            <div class="flex items-start gap-2">
              <FileText class="h-4 w-4 mt-0.5" />
              <div class="flex flex-col">
                <span>{link.title}</span>
                {#if $showInfo}
                  <span class="text-xs text-muted-foreground">{link.desc}</span>
                {/if}
              </div>
            </div>
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Group>

      <DropdownMenu.Separator />
      
      <DropdownMenu.Item on:click={() => openUrl(DRIVE_FOLDER_URL)}>
        <div class="flex items-center gap-2">
          <ExternalLink class="h-4 w-4" />
          <span>Drive Folder</span>
        </div>
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>


  <!-- Help Button -->
  <div class="-mt-[1px] flex items-center z-50">
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          class={buttonClass}
          on:click={toggleAboutModal}
        >
          <HelpCircle class="h-4 w-4" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Help & About</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </div>
</div>