<!-- src/lib/components/pricing/UpgradeCard.svelte - SLIDING UPGRADE CONTENT -->
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
  let successMessage = $state(""); // NEW: Track success state
  
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
      
      // SUCCESS: Show success message first
      successMessage = "Successfully upgraded to Pro! Refreshing...";
      errorMessage = ""; // Clear any previous errors
      
      // Wait to show success, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
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
      
      // SUCCESS: Show success message first  
      successMessage = "Successfully downgraded. Refreshing...";
      errorMessage = ""; // Clear any previous errors
      
      // Wait to show success, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Failed to downgrade";
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

<div class="p-6">
  <!-- Header with Back Button -->
  <div class="flex items-center gap-3 mb-6">
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-full"
      onclick={props.onBack}
      disabled={isProcessing}
    >
      <ArrowLeft class="h-4 w-4" />
    </Button>
    
    <div class="flex items-center gap-2">
      {#if props.isPro}
        <Crown class="h-5 w-5 text-primary" />
        <h2 class="text-lg font-semibold">Manage Subscription</h2>
      {:else}
        <Sparkles class="h-5 w-5 text-primary" />
        <h2 class="text-lg font-semibold">Upgrade to Pro</h2>
      {/if}
    </div>
  </div>

  {#if props.isPro}
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
    <div class="space-y-6">
      
      <!-- Trial Status -->
      {#if props.trialActive}
        <div class="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p class="text-sm font-medium text-amber-800 dark:text-amber-200">
            Trial expires in {props.trialDaysLeft} {props.trialDaysLeft === 1 ? 'day' : 'days'}
          </p>
        </div>
      {/if}
      
      <!-- Pricing -->
      <div class="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
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
            <li class="flex items-start gap-3 text-sm">
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
          class="w-full h-11 text-base font-medium"
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
          Cancel anytime • No long-term commitment
        </p>
      </div>
    </div>
  {/if}

  <!-- Footer -->
  <div class="mt-6 pt-4 border-t border-border text-center">
    <p class="text-xs text-muted-foreground">
      Questions? Email <a href="mailto:support@pipewriter.io" class="text-primary hover:underline">support@pipewriter.io</a>
    </p>
  </div>
</div>