<!-- $lib/iframe/features/colors/ColorPicker.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  
  // Props using SvelteKit 5 syntax
  const props = $props<{
    initialColor: string;
    onColorUpdate: (color: string) => void;
  }>();
  
  // Handle initializing with the prop value
  let colorValue = $state(props.initialColor || "#FFFFFF");
  
  // State
  let pickerElement = $state<HTMLDivElement | null>(null);
  let picker = $state<any>(null);
  
  function stripAlpha(color: string): string {
    return color.length === 9 ? color.slice(0, 7).toUpperCase() : color.toUpperCase();
  }
  
  // Effect to watch for initialColor changes
  $effect(() => {
    if (props.initialColor && props.initialColor !== colorValue) {
      colorValue = props.initialColor;
      if (picker) {
        picker.setColor(colorValue, true);
      }
    }
  });
  
  // Effect to initialize the picker
  $effect(() => {
    if (browser && pickerElement) {
      const initPicker = async () => {
        const { default: Picker } = await import('vanilla-picker');
        
        picker = new Picker({
          parent: pickerElement,
          popup: false,
          alpha: false,
          color: colorValue,
          onChange: (color: { hex: string }) => {
            const cleanColor = stripAlpha(color.hex);
            colorValue = cleanColor;
            props.onColorUpdate(cleanColor);
          }
        });
      };
      
      initPicker();
      
      // Cleanup function when component is destroyed
      return () => {
        if (picker) {
          picker.destroy();
        }
      };
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