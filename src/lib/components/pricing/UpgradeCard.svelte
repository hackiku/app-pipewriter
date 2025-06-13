<!-- src/lib/components/pricing/UpgradeCard.svelte - FIXED EVENT HANDLING -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Crown, Sparkles, Check, X, ArrowLeft, Loader2 } from '@lucide/svelte';
  
  // Props
  const props = $props<{
    isPro: boolean;
    trialActive: boolean;
    trialDaysLeft: number;
    onBack: () => void;
  }>();
  
  // Local state
  let isProcessing = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");
  
  // IMPROVED: Demo upgrade/downgrade functions with better error handling
  async function handleUpgrade() {
    if (isProcessing) return; // Prevent double-clicks
    
    isProcessing = true;
    errorMessage = "";
    successMessage = "";
    
    try {
      console.log('Starting upgrade process...');
      
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upgrade");
      }
      
      // SUCCESS: Show success message first
      successMessage = "Successfully upgraded to Pro! Refreshing...";
      errorMessage = "";
      
      console.log('Upgrade successful, reloading page...');
      
      // Wait to show success, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Upgrade failed:', error);
      errorMessage = error instanceof Error ? error.message : "Failed to upgrade";
      successMessage = "";
    } finally {
      isProcessing = false;
    }
  }
  
  async function handleDowngrade() {
    if (isProcessing) return; // Prevent double-clicks
    
    isProcessing = true;
    errorMessage = "";
    successMessage = "";
    
    try {
      console.log('Starting downgrade process...');
      
      const response = await fetch('/api/user/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to downgrade");
      }
      
      // SUCCESS: Show success message first  
      successMessage = "Successfully downgraded. Refreshing...";
      errorMessage = "";
      
      console.log('Downgrade successful, reloading page...');
      
      // Wait to show success, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Downgrade failed:', error);
      errorMessage = error instanceof Error ? error.message : "Failed to downgrade";
      successMessage = "";
    } finally {
      isProcessing = false;
    }
  }

  // IMPROVED: Handle back button with event handling
  function handleBackClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (isProcessing) return; // Don't allow back during processing
    
    console.log('Back button clicked in UpgradeCard');
    props.onBack();
  }

  // Pro features list
  const proFeatures = [
    "All premium design elements",
    "Advanced colors & styles", 
    "Personalized AI prompts",
    "Priority support & updates"
  ];
</script>

<div class="p-4">
  <!-- Header with Back Button - IMPROVED event handling -->
  <div class="flex items-center gap-3 mb-6">
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-full"
      onclick={handleBackClick}
      disabled={isProcessing}
    >
      <ArrowLeft class="h-4 w-4" />
    </Button>
    
    <div class="flex items-center gap-2">
      {#if props.isPro}
        <!-- <Crown class="h-5 w-5 text-primary" /> -->
        <h2 class="text-md font-semibold">Manage Subscription</h2>
      {:else}
        <!-- <Sparkles class="h-5 w-5 text-primary" /> -->
        <h2 class="text-lg font-semibold">Upgrade to Pro</h2>
      {/if}
    </div>
  </div>

  {#if props.isPro}
    <!-- Pro User View -->
    <div class="text-center space-y-4">
      <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
        <Crown class="h-8 w-8 text-primary" />
      </div>
      
      <div class="space-y-2">
        <p class="text-lg font-medium">You're on Pro! 🎉</p>
        <p class="text-sm text-muted-foreground">
          Enjoying all premium features with unlimited access.
        </p>
      </div>

      <div class="pt-4 border-t border-border">
        <Button
          variant="destructive"
          class="w-full h-11"
          onclick={handleDowngrade}
          disabled={isProcessing}
        >
          {#if isProcessing}
            <Loader2 class="h-4 w-4 animate-spin mr-2" />
            Processing...
          {:else}
            Downgrade to Free
          {/if}
        </Button>
        <p class="text-xs text-muted-foreground mt-2 text-center">
          You can always upgrade again later
        </p>
      </div>
    </div>

  {:else}
    <!-- Free/Trial User View -->
    <div class="space-y-3">
      
      <!-- Trial Status -->
      {#if props.trialActive}
        <div class="text-center p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p class="text-xs font-medium text-amber-800 dark:text-amber-200">
            Trial expires in {props.trialDaysLeft} {props.trialDaysLeft === 1 ? 'day' : 'days'}
          </p>
        </div>
      {/if}
      
      <!-- Pricing -->
      <div class="text-center p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
        <div class="space-y-1">
          <p class="text-2xl font-bold">$10<span class="text-lg font-normal text-muted-foreground">/month</span></p>
          <p class="text-sm text-muted-foreground">Pro Tester Plan</p>
        </div>
      </div>

      <!-- Features List -->
      <div class="space-y-3">
        <p class="font-medium text-sm">What you get:</p>
        <ul class="space-y-2">
          {#each proFeatures as feature}
            <li class="flex items-start gap-3 text-xs">
              <Check class="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Success Message -->
      {#if successMessage}
        <div class="p-3 bg-primary/10 text-primary rounded-lg text-sm flex items-center gap-2">
          <Check class="h-4 w-4" />
          {successMessage}
        </div>
      {/if}

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
          class="w-full h-10 text-sm font-medium"
          onclick={handleUpgrade}
          disabled={isProcessing}
        >
          {#if isProcessing}
            <Loader2 class="h-4 w-4 animate-spin mr-2" />
            Processing...
          {:else}
            <Sparkles class="h-4 w-4 mr-2" />
            Upgrade to Pro Now
          {/if}
        </Button>
        
        <p class="text-xs text-center text-muted-foreground">
          Cancel anytime • No commitment
        </p>
      </div>
    </div>
  {/if}

  <!-- Footer -->
  <div class="mt-3 pt-3 border-t border-border text-center">
    <p class="text-xs text-muted-foreground">
      Questions? Email <a href="mailto:ivan@pipewriter.io" class="text-primary hover:underline">ivan@pipewriter.io</a>
    </p>
  </div>
</div>