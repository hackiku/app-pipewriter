<!-- src/lib/components/pricing/SimpleUpgradeModal.svelte -->
<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Crown } from '@lucide/svelte';
  import { Button } from "$lib/components/ui/button";
  import { useTrialFeatures } from '$lib/context/trial.svelte';
  
  // Props
  const props = $props<{
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>();
  
  // Local state
  let isOpen = $state(props.isOpen || false);
  let isProcessing = $state(false);
  let errorMessage = $state("");
  
  // Get trial features context
  const trialFeatures = useTrialFeatures();
  const trialStatus = trialFeatures.getTrialStatus();
  
  // Update isOpen when props change
  $effect(() => {
    if (props.isOpen !== undefined) {
      isOpen = props.isOpen;
    }
  });
  
  // Handle open change
  function handleOpenChange(open: boolean) {
    isOpen = open;
    if (props.onOpenChange) {
      props.onOpenChange(open);
    }
  }
  
  // For demo purpose, we'll use simple functions to update the pro status
  async function handleUpgrade() {
    isProcessing = true;
    errorMessage = "";
    
    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to upgrade");
      }
      
      // Close the modal
      handleOpenChange(false);
      
      // Reload the page to get updated user data
      window.location.reload();
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Failed to upgrade";
    } finally {
      isProcessing = false;
    }
  }
  
  async function handleDowngrade() {
    isProcessing = true;
    errorMessage = "";
    
    try {
      const response = await fetch('/api/user/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to downgrade");
      }
      
      // Close the modal
      handleOpenChange(false);
      
      // Reload the page to get updated user data
      window.location.reload();
    } finally {
      isProcessing = false;
    }
  }
</script>

<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
  <Dialog.Content class="sm:max-w-[400px]">
    <Dialog.Header>
      <Dialog.Title>{trialStatus.isPro ? 'Manage Subscription' : 'Upgrade to Pro'}</Dialog.Title>
      <Dialog.Description>
        {#if trialStatus.active}
          You have {trialStatus.daysLeft} days left in your trial.
        {:else if trialStatus.isPro}
          You're currently on the Pro plan.
        {:else}
          Get access to all premium features.
        {/if}
      </Dialog.Description>
    </Dialog.Header>
    
    <div class="py-4">
      {#if trialStatus.isPremium}
        <!-- Premium user view -->
        <div class="flex flex-col items-center justify-center space-y-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown class="h-6 w-6 text-primary" />
          </div>
          <p class="text-center text-sm">
            You're currently on the <span class="font-medium">Pro</span> plan.
            Enjoy all premium features!
          </p>
        </div>
        
        <div class="border-t pt-4">
          <Button
            variant="destructive"
            class="w-full"
            onclick={handleDowngrade}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Downgrade to Free'}
          </Button>
        </div>
      {:else}
        <!-- Free/Trial user view -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b pb-2">
            <span class="font-medium">Pro Tester</span>
            <span class="font-bold">$9 /mo</span>
          </div>
          
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span>All premium elements</span>
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span>Full styles & themes</span>
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span>Priority support</span>
            </li>
          </ul>
          
          {#if errorMessage}
            <div class="bg-destructive/10 text-destructive p-2 rounded text-sm">
              {errorMessage}
            </div>
          {/if}
        </div>
        
        <div class="mt-6">
          <Button
            class="w-full"
            onclick={handleUpgrade}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Upgrade Now'}
          </Button>
        </div>
      {/if}
    </div>
    
    <Dialog.Footer class="flex flex-col max-w-4/5 gap-2 __sm:flex-row">
      <Dialog.Close asChild>
        <Button variant="outline" class="w-44 __sm:w-auto">Cancel</Button>
      </Dialog.Close>
      <p class="text-xs text-center sm:text-right text-muted-foreground">
        Questions? Email <a href="mailto:support@pipewriter.io" class="text-primary hover:underline">support@pipewriter.io</a>
      </p>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>