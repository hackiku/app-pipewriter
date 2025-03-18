<!-- $lib/iframe/features/colors/ColorPicker.svelte -->

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { currentColor } from '../../stores';
	// TODO create store
  // import { currentColor } from '../../stores/colorStore';
  
  const dispatch = createEventDispatcher();
  let pickerElement: HTMLDivElement;
  let picker: any;
  let colorInput: string;

	function stripAlpha(color: string): string {
		return color.length === 9 ? color.slice(0, 7).toUpperCase() : color.toUpperCase();
	}
  onMount(async () => {
    if (browser) {
      const { default: Picker } = await import('vanilla-picker');
      
      const initialColor = $currentColor !== '#000000' ? $currentColor : colorInput;
      
      picker = new Picker({
        parent: pickerElement,
        popup: false,
        alpha: false,
        color: initialColor,
        onChange: (color: { hex: string }) => {
          const cleanColor = stripAlpha(color.hex);
          colorInput = cleanColor;
          currentColor.set(cleanColor);
          dispatch('colorUpdate', { color: cleanColor });
        }
      });

      colorInput = stripAlpha(initialColor);
      currentColor.set(colorInput);
    }
  });

  onDestroy(() => {
    if (browser && picker) {
      picker.destroy();
    }
  });
</script>

<div class="w-full h-full flex flex-col">
  <div bind:this={pickerElement} class="w-full flex justify-center" />
</div>

<style lang="postcss">
  :global(.picker_wrapper) {
    background: none !important;
    box-shadow: none !important;
    width: 100% !important;
  }

  :global(.picker_wrapper .picker_arrow) {
    display: none;
  }

  :global(.picker_wrapper .picker_selector) {
    border: 2px solid white !important;
    box-shadow: 0 0 2px rgba(0,0,0,0.5) !important;
  }

  :global(.dark .picker_wrapper) {
    filter: brightness(0.8);
  }

  :global(.picker_editor input) {
    display: none !important;
  }

  :global(.picker_done button) {
    display: none !important;
  }

  :global(.picker_wrapper .picker_alpha) {
    display: none !important;
  }
</style>