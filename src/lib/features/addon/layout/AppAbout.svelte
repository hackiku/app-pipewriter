<!-- src/lib/features/addon/layout/AppAbout.svelte - FINAL WITH SHADCN DIALOG -->
<script lang="ts">
  import { ExternalLink, Heart } from '@lucide/svelte';
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import EmailSubscribe from './EmailSubscribe.svelte';

  // Props
  const props = $props<{
    showAboutModal: boolean;
    onToggleAboutModal: () => void;
  }>();

  function openPipewriter() {
    window.open('https://pipewriter.io', '_blank');
  }
</script>

<Dialog.Root open={props.showAboutModal} onOpenChange={props.onToggleAboutModal}>
  <Dialog.Content class="max-w-[90%] rounded-xl mr-16">
    <Dialog.Header>
      <Dialog.Title class="text-center">About Pipewriter</Dialog.Title>
      <Dialog.Description class="sr-only">
        Information about Pipewriter app
      </Dialog.Description>
    </Dialog.Header>

    <!-- Content -->
    <div class="space-y-4 py-4">
      <!-- Description -->
      <div class="text-center space-y-3">
        <div class="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Heart class="h-6 w-6 text-primary" />
        </div>
        
        <p class="text-sm text-muted-foreground">
          Wireframes for writers in Google Docs and more.
        </p>
      </div>

			<!-- <hr /> -->

      <!-- Email Subscribe -->
      <div class="space-y-3">
        <div class="text-center">
          <p class="text-md mb-2 font-medium">Stay updated</p>
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
    <div class="text-center pt-2 border-t border-border">
      <p class="text-xs text-muted-foreground">
        v1.0 • Made with ❤️ for writers
      </p>
    </div>
  </Dialog.Content>
</Dialog.Root>