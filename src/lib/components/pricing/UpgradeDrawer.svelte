<!-- src/lib/components/pricing/UpgradeDrawer.svelte -->

<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer";
  import { Button } from "$lib/components/ui/button";
  import { Crown, Sparkles, Check, X } from '@lucide/svelte';
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
  
  // Demo upgrade/downgrade functions
  async function handleUpgrade() {
    isProcessing = true;
    errorMessage = "";
    
    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error("Failed to upgrade");
      }
      
      handleOpenChange(false);
      window.location.reload(); // Reload to get updated user data
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
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error("Failed to downgrade");
      }
      
      handleOpenChange(false);
      window.location.reload();
    } finally {
      isProcessing = false;
    }
  }

  // Pro features list
  const proFeatures = [
    "All premium design elements",
    "Advanced color & style customization", 
    "AI-powered content generation",
    "Export to multiple formats",
    "Priority support & updates"
  ];
</script>

<Drawer.Root open={isOpen} onOpenChange={handleOpenChange}>
  <Drawer.Content class="max-h-[90vh] mx-3 pb-16">
    <div class="mx-auto w-full max-w-md">
      
      <Drawer.Header class="text-center pb-4">
        <Drawer.Title class="flex items-center justify-center gap-2 text-xl">
          {#if trialStatus.isPro}
            <Crown class="h-6 w-6 text-primary" />
            Manage Subscription
          {:else}
            <Sparkles class="h-6 w-6 text-primary" />
            Upgrade to Pro
          {/if}
        </Drawer.Title>
        
        <Drawer.Description class="text-sm text-muted-foreground mt-2">
          {#if trialStatus.active}
            You have <span class="font-medium text-amber-600">{trialStatus.daysLeft} days</span> left in your trial.
          {:else if trialStatus.isPro}
            You're currently on the <span class="font-medium text-primary">Pro plan</span>.
          {:else}
            Get access to all premium features and supercharge your workflow.
          {/if}
        </Drawer.Description>
      </Drawer.Header>

      <div class="px-4 pb-6">
        {#if trialStatus.isPro}
          <!-- Pro User View -->
          <div class="text-center space-y-6">
            <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Crown class="h-8 w-8 text-primary" />
            </div>
            
            <div class="space-y-2">
              <p class="text-lg font-medium">You're on Pro! 🎉</p>
              <p class="text-sm text-muted-foreground">
                Enjoying all premium features with unlimited access.
              </p>
            </div>

            <div class="pt-4 border-t">
              <Button
                variant="destructive"
                class="w-full"
                onclick={handleDowngrade}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Downgrade to Free'}
              </Button>
              <p class="text-xs text-muted-foreground mt-2">
                You can always upgrade again later
              </p>
            </div>
          </div>

        {:else}
          <!-- Free/Trial User View -->
          <div class="space-y-6">
            
            <!-- Pricing -->
            <div class="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
              <div class="space-y-1">
                <p class="text-2xl font-bold">$9<span class="text-lg font-normal text-muted-foreground">/month</span></p>
                <p class="text-sm text-muted-foreground">Pro Tester Plan</p>
              </div>
            </div>

            <!-- Features List -->
            <div class="space-y-3">
              <!-- <p class="font-medium text-sm">What you get:</p> -->
              <ul class="space-y-2">
                {#each proFeatures as feature}
                  <li class="flex items-start gap-3 text-sm">
                    <Check class="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <!-- Error Message -->
            {#if errorMessage}
              <div class="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
                <X class="h-4 w-4" />
                {errorMessage}
              </div>
            {/if}

            <!-- Upgrade Button -->
            <div class="space-y-3 pt-2">
              <Button
                class="w-full h-12 text-base font-medium"
                onclick={handleUpgrade}
                disabled={isProcessing}
              >
                {#if isProcessing}
                  <div class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                {:else}
                  <Sparkles class="h-4 w-4 mr-2" />
                  Upgrade to Pro Now
                {/if}
              </Button>
              
              <p class="text-xs text-center text-muted-foreground">
                Cancel anytime • No long-term commitment
              </p>
            </div>
          </div>
        {/if}
      </div>

      <Drawer.Footer class="border-t pt-4">
        <div class="flex flex-col space-y-2">
          <Drawer.Close asChild>
            <Button variant="outline" class="w-full">
              Close
            </Button>
          </Drawer.Close>
          <p class="text-xs text-center text-muted-foreground">
            Questions? Email <a href="mailto:support@pipewriter.io" class="text-primary hover:underline">support@pipewriter.io</a>
          </p>
        </div>
      </Drawer.Footer>
      
    </div>
  </Drawer.Content>
</Drawer.Root>