<!-- src/lib/features/addon/layout/AppAbout.svelte - REDESIGNED -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { X, ExternalLink, Heart } from '@lucide/svelte';
  import { Button } from "$lib/components/ui/button";
  import EmailSubscribe from './EmailSubscribe.svelte';

  // Props
  const props = $props<{
    showAboutModal: boolean;
    onToggleAboutModal: () => void;
  }>();

  function closeModal() {
    props.onToggleAboutModal();
  }

  function openPipewriter() {
    window.open('https://pipewriter.io', '_blank');
  }
</script>

<!-- Modal Overlay -->
{#if props.showAboutModal}
  <div
    class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
    onclick={closeModal}
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal Content - Matching drawer card design -->
    <div
      class="bg-background border border-border rounded-lg shadow-lg w-full max-w-md mx-4"
      onclick={(e) => e.stopPropagation()}
      transition:fade={{ duration: 200, delay: 100 }}
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h2 class="text-lg font-semibold">About Pipewriter</h2>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-full"
          onclick={closeModal}
        >
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Content -->
      <div class="p-4 space-y-4">
        <!-- Description -->
        <div class="text-center space-y-3">
          <div class="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Heart class="h-6 w-6 text-primary" />
          </div>
          
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">
              Design-focused wireframing and prototyping tools for Google Docs. 
              Built for copywriters, content strategists, and UX professionals.
            </p>
          </div>
        </div>

        <!-- Email Subscribe -->
        <div class="space-y-3">
          <div class="text-center">
            <p class="text-sm font-medium">Stay updated</p>
            <p class="text-xs text-muted-foreground">Get notified about new features and templates</p>
          </div>
          
          <EmailSubscribe source="addon-about" />
        </div>

        <!-- Website Link -->
        <div class="pt-3 border-t border-border">
          <Button
            variant="outline"
            class="w-full h-9 text-sm"
            onclick={openPipewriter}
          >
            <span>Visit pipewriter.io</span>
            <ExternalLink class="h-3 w-3 ml-2" />
          </Button>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 pt-0 text-center border-t border-border">
        <p class="text-xs text-muted-foreground">
          v1.0 • Made with ❤️ for writers
        </p>
      </div>
    </div>
  </div>
{/if}