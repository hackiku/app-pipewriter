<!-- $lib/iframe/layout/Tester.svelte -->
<script lang="ts">
  import RoundButton from '../components/RoundButton.svelte';
  import { Text, Palette, Code } from 'lucide-svelte';
  import { writable } from 'svelte/store';

  const isSelected = writable(false);
  function toggleSelected() {
    isSelected.update(v => !v);
  }
</script>

<div class="flex flex-col gap-6">
  <!-- Row 1: Icons in fixed containers -->
  <div class="flex items-center gap-4 border-b pb-4 border-gray-200 dark:border-gray-700">
    <div class="h-7 w-7">
      <RoundButton
        icon={Text}
        selected={$isSelected}
        tooltipContent="Text styles"
        on:click={toggleSelected}
      />
    </div>
    
    <div class="h-7 w-7">
      <RoundButton
        icon={Palette}
        selected={$isSelected}
        tooltipContent="Color picker"
        on:click={toggleSelected}
      />
    </div>
    
    <div class="h-7 w-7">
      <RoundButton
        icon={Code}
        selected={$isSelected}
        tooltipContent="Code tools"
        on:click={toggleSelected}
      />
    </div>
  </div>

  <!-- Row 2: Color buttons -->
  <div class="flex items-center gap-2">
    <div class="h-7 w-7">
      <RoundButton
        color="#4F46E5"
        selected={$isSelected}
        tooltipContent="Indigo"
        on:click={toggleSelected}
      />
    </div>
    
    <div class="h-7 w-7">
      <RoundButton
        color="#EC4899"
        selected={$isSelected}
        tooltipContent="Pink"
        on:click={toggleSelected}
      />
    </div>
    
    <div class="h-7 w-7">
      <RoundButton
        gradient
        selected={$isSelected}
        tooltipContent="Custom color"
        on:click={toggleSelected}
      />
    </div>
  </div>
</div>