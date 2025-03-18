<!-- $lib/iframe/components/UpdateHeading.svelte -->
<script lang="ts">
  import { Heading } from 'lucide-svelte';
  import OutlineButton from './OutlineButton.svelte';
  
  function callGAS(action: string, params: Record<string, any>) {
    const message = { action, params };
    window.parent.postMessage(JSON.stringify(message), '*');
  }
</script>

<OutlineButton
  icon={Heading}
  label="Update Heading"
  onClick={() => callGAS("updateHeading", {})}
/>