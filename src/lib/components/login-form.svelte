<!-- src/lib/components/login-form.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  
  // Props
  const props = $props<{
    onGoogleSignIn: () => Promise<void>;
    isProcessing?: boolean;
  }>();
</script>

<Card.Root class="mx-auto max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Access Pipewriter</Card.Title>
    <Card.Description>Sign in to continue to Pipewriter for Google Docs</Card.Description>
  </Card.Header>
  <Card.Content>
    <div class="grid gap-4">
      <!-- For now, let's just use the Google sign-in -->
      <Button 
        variant="outline" 
        class="w-full flex items-center justify-center gap-2"
        onclick={props.onGoogleSignIn}
        disabled={props.isProcessing}
      >
        {#if props.isProcessing}
          <div class="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
          <span>Signing in...</span>
        {:else}
          <!-- Google icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
            <path d="M12.545 12.151L12.545 12.151L12.545 12.151C12.545 9.97444 14.3828 8.23294 16.6769 8.23294C17.7261 8.23294 18.6772 8.57142 19.3832 9.12932L22.2031 6.32996C20.207 4.56891 17.5931 3.5 16.6769 3.5C12.2477 3.5 8.59091 7.06623 8.59091 11.3751C8.59091 15.6839 12.2477 19.2502 16.6769 19.2502C20.7869 19.2502 23.0227 16.0666 23.0227 12.0198C23.0227 11.457 23.0227 10.8943 22.8125 10.3316H16.6769V12.151H12.545Z" fill="currentColor"/>
          </svg>
          <span>Continue with Google</span>
        {/if}
      </Button>
    </div>
  </Card.Content>
</Card.Root>