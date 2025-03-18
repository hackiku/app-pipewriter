<!-- $lib/iframe/features/colors/ColorTab.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Check, Loader2 } from "lucide-svelte";
  import ColorPicker from "./ColorPicker.svelte";
  import ColorButton from "./ColorButton.svelte";
  
  // Props
  const { context } = $props();
  
  // State
  let currentColor = $state("#FFFFFF");
  let showColorPicker = $state(false);
  let isProcessing = $state(false);
  
  
  // Preset colors
  const presetColors = [
    // Row 1
    { color: "#FFFFFF", title: "White" },
    { color: "#F3F4F6", title: "Gray 100" },
    { color: "#E5E7EB", title: "Gray 200" },
    { color: "#D1D5DB", title: "Gray 300" },
    { color: "#9CA3AF", title: "Gray 400" },
    // Row 2
    { color: "#4B5563", title: "Gray 600" },
    { color: "#374151", title: "Gray 700" },
    { color: "#1F2937", title: "Gray 800" },
    { color: "#111827", title: "Gray 900" },
    { color: "", title: "Custom Color", isGradient: true },
  ];

  function stripAlpha(color: string): string {
    if (color.toUpperCase() === "#FFFFFF" || color.toUpperCase() === "FFFFFF") {
      return "#FFFFFF";
    }
    return color.replace(/FF$/, "").slice(0, 7).toUpperCase();
  }

  async function handleColorChange(color: string) {
    if (isProcessing) return;

    isProcessing = true;

    try {
      const cleanColor = stripAlpha(color);
      const appsScript = context?.appsScript;
      
      if (!appsScript) {
        throw new Error("AppsScript client not available");
      }
      
      const response = await appsScript.sendMessage("changeBg", {
        color: cleanColor,
      });

      if (response.success) {
        currentColor = cleanColor;
      } else {
        throw new Error(response.error || "Failed to change color");
      }
    } catch (error) {
      console.error("Failed to change background:", error);
    } finally {
      isProcessing = false;
    }
  }

  function handleColorUpdate(event: CustomEvent<{ color: string }>) {
    currentColor = stripAlpha(event.detail.color);
  }

  function handleSubmit() {
    handleColorChange(currentColor);
  }
</script>

<div class="flex flex-col items-stretch w-full gap-2">
  {#if showColorPicker}
    <div
      class="relative rounded-xl z-10 w-full p-2 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm"
      transition:slide={{ duration: 150, axis: "y" }}
    >
      <ColorPicker initialColor={currentColor} oncolorUpdate={handleColorUpdate} />
    </div>
  {/if}

  <!-- Color input and actions -->
  <div class="flex gap-2 h-10">
    <button
      class="flex flex-1 items-center rounded-lg overflow-clip border border-input bg-white dark:bg-gray-800 text-sm shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
      onclick={() => showColorPicker = !showColorPicker}
    >
      <div 
        class="h-full aspect-square"
        style="background-color: {currentColor};"
      ></div>
      <span class="flex items-center uppercase pl-2">{currentColor}</span>
    </button>

    <Button 
      variant="default" 
      class="px-3 h-full w-1/4"
      disabled={isProcessing}
      onclick={handleSubmit}
    >
      {#if isProcessing}
        <Loader2 class="h-4 w-4 animate-spin" />
      {:else}
        <Check class="h-4 mr-1"/> Ok 
      {/if}
    </Button>
  </div>
  
  <!-- Preset colors grid -->
  <div class="px-9">
    <!-- Row 1 -->
    <div class="grid grid-cols-5 gap-2 mb-2">
      {#each presetColors.slice(0, 5) as { color, title, isGradient }}
        <ColorButton
          {color}
          {title}
          isGradient={isGradient || false}
          isSelected={currentColor === color}
          {isProcessing}
          onclick={(e) => handleColorChange(e.detail.color)}
        />
      {/each}
    </div>
    <!-- Row 2 -->
    <div class="grid grid-cols-5 gap-2">
      {#each presetColors.slice(5) as { color, title, isGradient }}
        <ColorButton
          {color}
          {title}
          isGradient={isGradient || false}
          isSelected={isGradient ? showColorPicker : currentColor === color}
          {isProcessing}
          onclick={(e) => {
            if (isGradient) {
              showColorPicker = !showColorPicker;
            } else {
              handleColorChange(e.detail.color);
            }
          }}
        />
      {/each}
    </div>
  </div>
</div>