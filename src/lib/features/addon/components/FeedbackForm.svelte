<!-- $lib/iframe/components/FeedbackForm.svelte -->

<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Mail } from "lucide-svelte";
  import type { SubscribeResponse } from '$lib/server/subscribe';

  const writerEmails = [
    "ernie@hemingway.gg",
    "franz@kafka.dev",
    "fyodor@dostoevsky.ru",
    "margaret@atwood.ca",
    "jane@austen.io",
    "james@joyce.ie",
    "italo@calvino.it",
    "albert@camus.dz",
    "hank@moody.ny",
    "isabel@allende.cl",
    "edgar@poe.xyz",
  ];

  export let onSuccess: (() => void) | undefined = undefined;
  
  let email = '';
  let isSubmitting = false;
  let errorMessage = '';
  let successMessage = '';
  let placeholder = writerEmails[Math.floor(Math.random() * writerEmails.length)];
  
  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!email || isSubmitting) return;
    
    isSubmitting = true;
    errorMessage = '';
    successMessage = '';
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          source: 'Docs App'
        })
      });
      
      const result: SubscribeResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Subscription failed');
      }
      
      successMessage = result.message || 'Successfully subscribed!';
      email = ''; // Clear on success
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
      
    } catch (error) {
      console.error('Subscription error:', error);
      errorMessage = error instanceof Error ? error.message : 'Subscription failed';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form on:submit={handleSubmit} class="space-y-2">
  <Input
    type="email"
    {placeholder}
    bind:value={email}
    class="w-full"
    required
  />
  
  {#if errorMessage}
    <p class="text-sm text-red-500">{errorMessage}</p>
  {/if}

  {#if successMessage}
    <p class="text-sm text-green-500">{successMessage}</p>
  {/if}
  
  <Button 
    type="submit" 
    disabled={!email || isSubmitting}
    class="w-full"
  >
    {#if isSubmitting}
      <span class="flex items-center">
        <span class="animate-spin mr-2">⟳</span>
        Subscribing...
      </span>
    {:else}
      <span class="flex items-center">
        <Mail class="w-4 h-4 mr-2" />
        Get Updates
      </span>
    {/if}
  </Button>
</form>
