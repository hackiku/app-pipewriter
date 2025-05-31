<!-- src/routes/(addon)/+layout.svelte -->
<script lang="ts">
  import "../../app.css";
  import { ModeWatcher } from 'mode-watcher';
  import { goto } from '$app/navigation';

  const { data, children } = $props();
  
  // Handle redirects from server
  $effect(() => {
    if (data.redirectTo) {
      console.log(`[ADDON LAYOUT] Redirecting to: ${data.redirectTo}`);
      goto(data.redirectTo, { replaceState: true });
    }
  });
</script>

<ModeWatcher />

{@render children?.()}