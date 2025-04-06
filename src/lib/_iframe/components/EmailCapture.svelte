<!-- $lib/iframe/components/EmailCapture.svelte -->
<script lang="ts">
  // import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";
  import { CheckCircle2, Mail, X } from 'lucide-svelte';

  let email = '';
  let isSubmitting = false;
  let isSubmitted = false;
  let errorMessage = '';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    isSubmitting = true;
    errorMessage = '';

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        isSubmitted = true;
      } else {
        const data = await response.json();
        errorMessage = data.error || 'An error occurred. Please try again.';
      }
    } catch (error) {
      console.error('Subscription error:', error);
      errorMessage = 'An error occurred. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    isSubmitted = false;
    email = '';
    errorMessage = '';
  }
</script>

{#if !isSubmitted}
  <!--
	<Card class="w-full">
    <CardHeader>
      <CardTitle class="text-center">Stay in the Loop</CardTitle>
      <CardDescription>New features, updates, tips, tricks.</CardDescription>
    </CardHeader>
	  <CardContent>
		</CardContent>
  </Card>
	-->
      <form on:submit={handleSubmit} class="flex flex-col">
        <div class="flex flex-col gap-2">
          <Input
            type="email"
            placeholder="email@example.com"
            bind:value={email}
            class="flex-1"
            required
          />
          <Button type="submit" disabled={!email.trim() || isSubmitting}>
            {#if isSubmitting}
              <span class="animate-spin mr-2">⟳</span>
              Subscribing...
            {:else}
              <Mail class="w-4 h-4 mr-2" />
              Subscribe
            {/if}
          </Button>
        </div>
        {#if errorMessage}
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        {/if}
      </form>

{:else}
  <!-- <Card class="w-full" transition:fly={{ duration: 200 }}> -->
  <Card class="w-full">
    <CardHeader>
      <div class="flex items-center space-x-2">
        <CheckCircle2 class="w-6 h-6 text-green-500" />
        <CardTitle>Thanks for subscribing!</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p class="text-muted-foreground">Check your inbox for a confirmation email.</p>
    </CardContent>
    <CardFooter class="justify-end">
      <Button variant="ghost" size="sm" on:click={resetForm}>
        <X class="w-4 h-4 mr-2" />
        Close
      </Button>
    </CardFooter>
  </Card>
{/if}