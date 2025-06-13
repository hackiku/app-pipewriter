<!-- src/lib/features/addon/layout/EmailSubscribe.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Check, Loader2, Mail } from '@lucide/svelte';
  import { onMount } from 'svelte';
  
  // Props
  const props = $props<{
    source?: string;
  }>();
  
  // Famous writer emails for placeholder rotation
  const writerEmails = [
    "ernie@hemingway.gg",
    "franz@kafka.dev", 
    "fyodor@dostoevsky.ru",
    "margaret@atwood.ca",
    "jane@austen.io",
    "james@joyce.ie",
    "italo@calvino.it",
    "albert@camus.dz",
    "isabel@allende.cl",
    "edgar@poe.xyz",
    "ursula@leguin.net",
    "toni@morrison.lit"
  ];
  
  // Local state
  let email = $state("");
  let isSubmitting = $state(false);
  let isSubmitted = $state(false);
  let errorMessage = $state("");
  let currentPlaceholder = $state(writerEmails[0]);
  
  // Rotate placeholder every 3 seconds (slower than before)
  onMount(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % writerEmails.length;
      currentPlaceholder = writerEmails[index];
    }, 3000); // 3 seconds to linger more
    
    return () => clearInterval(interval);
  });
  
  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!email.trim() || isSubmitting) return;
    
    isSubmitting = true;
    errorMessage = "";
    
    try {
      const response = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          source: props.source || 'addon-about' 
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        isSubmitted = true;
        email = "";
      } else {
        errorMessage = result.message || "Something went wrong";
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      errorMessage = "Failed to subscribe. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }
  
  function resetForm() {
    isSubmitted = false;
    email = "";
    errorMessage = "";
  }
</script>

{#if !isSubmitted}
  <form onsubmit={handleSubmit} class="space-y-3">
    <div class="relative">
      <input
        type="email"
        bind:value={email}
        placeholder={currentPlaceholder}
        class="w-full h-10 pl-10 pr-4 text-sm bg-background border border-input rounded-md 
               focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
               disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        disabled={isSubmitting}
        required
      />
      <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
    
    <Button
      type="submit"
      class="w-full h-9 text-sm"
      disabled={!email.trim() || isSubmitting}
    >
      {#if isSubmitting}
        <Loader2 class="h-4 w-4 animate-spin mr-2" />
        Subscribing...
      {:else}
        Subscribe for Updates
      {/if}
    </Button>
    
    {#if errorMessage}
      <p class="text-xs text-destructive">{errorMessage}</p>
    {/if}
  </form>

{:else}
  <div class="text-center p-3 bg-primary/10 text-primary rounded-lg">
    <div class="flex items-center justify-center gap-2 mb-2">
      <Check class="h-4 w-4" />
      <span class="text-sm font-medium">Subscribed!</span>
    </div>
    <p class="text-xs">You'll get updates on new features and templates.</p>
    <button 
      onclick={resetForm}
      class="text-xs text-primary/70 hover:text-primary mt-2 underline"
    >
      Subscribe another email
    </button>
  </div>
{/if}