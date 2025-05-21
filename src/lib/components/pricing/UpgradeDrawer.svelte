<!-- src/lib/features/pricing/UpgradeDrawer.svelte -->
<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import UpgradeCard from "./UpgradeCard.svelte";
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
  
  // For demo purpose, we'll use simple functions to update the premium status
  // In a production app, this would connect to Stripe or another payment processor
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, we'll just update via window.fetch:
      const response = await fetch('/api/user/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to downgrade");
      }
      
      // Close the drawer
      handleOpenChange(false);
      
      // Reload the page to get updated user data
      window.location.reload();
    } catch (error) {
      console.error("Failed to downgrade:", error);
      errorMessage = error instanceof Error ? error.message : "Failed to downgrade";
    } finally {
      isProcessing = false;
    }
  }
</script>

<Drawer.Root open={isOpen} onOpenChange={handleOpenChange}>
  <Drawer.Content>
    <div class="mx-auto w-full max-w-lg">
      <Drawer.Header>
        <Drawer.Title>Choose Your Plan</Drawer.Title>
        <Drawer.Description>
          {#if trialStatus.active}
            You have {trialStatus.daysLeft} days left in your trial. Upgrade to keep all premium features.
          {:else if trialStatus.isPremium}
            You're currently on the Premium plan.
          {:else}
            Choose the plan that works best for you.
          {/if}
        </Drawer.Description>
      </Drawer.Header>
      
      <div class="p-4 pb-0">
        <!-- Cards -->
        <UpgradeCard 
          onUpgrade={handleUpgrade}
          onDowngrade={handleDowngrade}
        />
        
        <!-- Error message if any -->
        {#if errorMessage}
          <div class="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {errorMessage}
          </div>
        {/if}
        
        <!-- Extra info -->
        <div class="mt-6 text-center text-sm text-muted-foreground">
          <p>Questions? Email <a href="mailto:support@pipewriter.io" class="text-primary hover:underline">support@pipewriter.io</a></p>
        </div>
      </div>
      
      <Drawer.Footer class="pt-2">
        <Drawer.Close asChild>
          <Button variant="outline" disabled={isProcessing}>Cancel</Button>
        </Drawer.Close>
      </Drawer.Footer>
    </div>
  </Drawer.Content>
</Drawer.Root>