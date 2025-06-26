<!-- src/lib/features/addon/layout/EmailSubscribe.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Check, Loader2, Mail } from '@lucide/svelte';
  import { onMount } from 'svelte';
  
  // Props
  const { source = 'addon-about' } = $props<{
    source?: string;
  }>();
  
  // Famous writer emails for placeholder rotation
  const writerEmails = [
    "hank@moody.ny",
		"jk@rollin.co.uk",
    "ernie@hemingway.gg",
		"david@ogilvy.piano",
		"greta@gerwig.bb",
    "grrm@martin.blog",
		"dan@harmon.pickle",
		"chiara@ferrænti.it",
		"dino@campana.it",
  ];
  
  // Form state
  let email = $state("");
  let isSubmitting = $state(false);
  let isSubmitted = $state(false);
  let errorMessage = $state("");
  
  // Typing animation state
  let currentEmailIndex = $state(0);
  let displayText = $state('');
  let showCursor = $state(true);
  
  // Typing animation settings
  const typingSpeed = 100;
  const deleteSpeed = 50;
  const pauseDuration = 1500;
  
  // Create placeholder with typing animation and cursor using $derived
  const placeholder = $derived(displayText + (showCursor ? '|' : ' '));
  
  onMount(() => {
    let timeoutId: number;
    
    async function typeEmail() {
      const targetEmail = writerEmails[currentEmailIndex];
      
      // Typing phase
      for (let i = 0; i <= targetEmail.length; i++) {
        displayText = targetEmail.slice(0, i);
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, typingSpeed);
        });
      }
      
      // Pause at end
      await new Promise(resolve => {
        timeoutId = setTimeout(resolve, pauseDuration);
      });
      
      // Deleting phase
      for (let i = targetEmail.length; i >= 0; i--) {
        displayText = targetEmail.slice(0, i);
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, deleteSpeed);
        });
      }
      
      // Move to next email
      currentEmailIndex = (currentEmailIndex + 1) % writerEmails.length;
      
      // Small pause before typing next
      await new Promise(resolve => {
        timeoutId = setTimeout(resolve, 200);
      });
      
      // Continue the cycle
      typeEmail();
    }
    
    // Cursor blink animation
    const cursorInterval = setInterval(() => {
      showCursor = !showCursor;
    }, 530);
    
    // Start typing
    typeEmail();
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(cursorInterval);
    };
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
          source 
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
        placeholder={placeholder}
        class="w-full h-10 pl-10 pr-4 text-sm bg-background border border-input rounded-md 
               focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
               disabled:opacity-50 disabled:cursor-not-allowed transition-all
               placeholder:text-muted-foreground/50"
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