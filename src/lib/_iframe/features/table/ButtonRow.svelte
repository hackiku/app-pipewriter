<!-- src/lib/iframe/features/table/ButtonRow.svelte -->

<script lang="ts">
  import { Pipette, Save } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  
  // Props using Svelte 5 runes
  const props = $props<{
    onGet: () => void;
    onApply: () => void;
  }>();
</script>

<div class="flex justify-between items-center w-full">
  <Button 
    variant="secondary" 
    onclick={props.onGet}
    class="flex items-center gap-2"
  >
    <Pipette class="h-4 w-4" />
    <span>Get</span>
  </Button>
  
  <Button 
    variant="default" 
    onclick={props.onApply}
    class="flex items-center gap-2"
  >
    <Save class="h-4 w-4" />
    <span>Apply</span>
  </Button>
</div>