<!-- src/lib/components/pricing/StripeCheckout.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { getUser } from '$lib/services/firebase/auth.svelte';
  
  // Props
  const props = $props<{
    priceId: string; // Stripe price ID
    buttonText?: string;
    disabled?: boolean;
  }>();
  
  // Default button text
  const buttonText = props.buttonText || 'Subscribe';
  
  // State
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  
  // Handle checkout
  async function handleCheckout() {
    const user = getUser();
    if (!user) {
      error = 'Please sign in first';
      return;
    }
    
    isLoading = true;
    error = null;
    
    try {
      // Call your backend to create a Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: props.priceId,
          userId: user.uid,
          userEmail: user.email,
        }),
      });
      
      const { url } = await response.json();
      
      // Redirect to Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      error = 'Failed to start checkout. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div>
  {#if error}
    <p class="text-destructive text-sm mb-2">{error}</p>
  {/if}
  
  <Button 
    variant="default" 
    onclick={handleCheckout} 
    disabled={isLoading || props.disabled}
    class="w-full"
  >
    {#if isLoading}
      <span class="animate-spin mr-2">⟳</span>
    {/if}
    {buttonText}
  </Button>
</div>