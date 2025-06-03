<!-- src/lib/components/auth/AuthModal.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { signIn } from '$lib/services/auth';
  import LoginForm from '$lib/components/auth/LoginForm.svelte';
  
  let isProcessing = $state(false);
  
  async function handleGoogleSignIn() {
    isProcessing = true;
    try {
      await signIn();
      // Auth change listener will handle the reload and redirection
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      isProcessing = false;
    }
  }
  
  function closeModal() {
    goto('/', { replaceState: true });
  }
</script>

<div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
     in:fade={{ duration: 200 }}
     out:fade={{ duration: 200 }}>
  <div class="max-w-md w-full">
    <div class="relative">
      <button 
        class="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        onclick={closeModal}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <LoginForm onGoogleSignIn={handleGoogleSignIn} isProcessing={isProcessing} />
    </div>
  </div>
</div>