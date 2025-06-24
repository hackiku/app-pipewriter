<!-- src/lib/components/auth/AuthErrorBoundary.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { AlertCircle, RefreshCw } from "@lucide/svelte";
  
  const { 
    error, 
    onRetry, 
    children 
  } = $props<{
    error?: Error | null;
    onRetry?: () => void;
    children: any;
  }>();

  function handleRetry() {
    if (onRetry) {
      onRetry();
    } else {
      // Default: reload page
      window.location.reload();
    }
  }

  function handleGoHome() {
    window.location.href = '/gdocs-login';
  }
</script>

{#if error}
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center space-y-6">
      <!-- Error Icon -->
      <div class="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle class="h-8 w-8 text-destructive" />
      </div>

      <!-- Error Message -->
      <div class="space-y-2">
        <h1 class="text-xl font-semibold">Authentication Error</h1>
        <p class="text-muted-foreground text-sm">
          {error.message || 'Something went wrong with authentication'}
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <Button 
          class="w-full" 
          onclick={handleRetry}
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          Try Again
        </Button>
        
        <Button 
          variant="outline" 
          class="w-full" 
          onclick={handleGoHome}
        >
          Back to Login
        </Button>
      </div>

      <!-- Debug Info (dev only) -->
      {#if process.env.NODE_ENV === 'development'}
        <details class="text-left mt-6">
          <summary class="text-xs text-muted-foreground cursor-pointer">
            Debug Info
          </summary>
          <pre class="text-xs mt-2 p-2 bg-muted rounded text-left overflow-auto">
{error.stack}
          </pre>
        </details>
      {/if}
    </div>
  </div>
{:else}
  {@render children()}
{/if}