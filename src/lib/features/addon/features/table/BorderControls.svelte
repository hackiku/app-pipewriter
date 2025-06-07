<!-- src/lib/features/addon/features/table/BorderControls.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { tick } from "svelte";
  import { Check, ChevronsUpDown } from "@lucide/svelte";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { fade } from "svelte/transition";

  // Props - ENHANCED with better color support
  const props = $props<{
    borderWidth: number;
    borderColor: string;
    isProcessing: boolean;
    onBorderChange: (width: number, color?: string) => void;
  }>();

  // Border width options
  const borderOptions = [
    { value: 0, label: "No Border" },
    { value: 1, label: "1pt" },
    { value: 2, label: "2pt" },
    { value: 3, label: "3pt" },
    { value: 4, label: "4pt" },
    { value: 5, label: "5pt" },
    { value: 6, label: "6pt" }
  ];

  // ENHANCED: Common border colors
  const borderColors = [
    { color: '#000000', label: 'Black' },
    { color: '#666666', label: 'Dark Gray' },
    { color: '#CCCCCC', label: 'Light Gray' },
    { color: '#0066CC', label: 'Blue' },
    { color: '#CC0000', label: 'Red' },
    { color: '#009900', label: 'Green' }
  ];

  // Combobox state
  let open = $state(false);
  let colorPickerOpen = $state(false);
  let triggerRef = $state<HTMLButtonElement | null>(null);

  // Get selected option
  const selectedOption = $derived(
    borderOptions.find((option) => option.value === props.borderWidth) || borderOptions[0]
  );

  // Close and refocus
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef?.focus();
    });
  }

  // Handle width selection
  function handleWidthSelect(width: number) {
    props.onBorderChange(width, props.borderColor);
    closeAndFocusTrigger();
  }

  // ENHANCED: Handle color selection
  function handleColorSelect(color: string) {
    props.onBorderChange(props.borderWidth, color);
    colorPickerOpen = false;
  }

  // Toggle color picker
  function toggleColorPicker() {
    colorPickerOpen = !colorPickerOpen;
  }

  // Get display color
  function getDisplayColor(): string {
    return props.borderColor || '#000000';
  }
</script>

<div class="relative">
  <!-- ENHANCED: Border color picker overlay -->
  {#if colorPickerOpen && props.borderWidth > 0}
    <div
      class="absolute bottom-full left-0 right-0 z-20 mb-2 bg-card border border-border rounded-lg shadow-lg p-3"
      transition:fade={{ duration: 150 }}
    >
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xs font-medium">Border Color</h4>
        <Button 
          variant="ghost" 
          size="icon"
          class="h-4 w-4"
          onclick={toggleColorPicker}
        >
          <ChevronsUpDown class="h-2 w-2" />
        </Button>
      </div>
      
      <!-- Color swatches -->
      <div class="grid grid-cols-6 gap-1.5">
        {#each borderColors as colorOption}
          <button
            class={cn(
              "w-6 h-6 rounded border-2 transition-all",
              props.borderColor === colorOption.color 
                ? "border-primary shadow-sm scale-110" 
                : "border-border hover:border-primary hover:scale-105"
            )}
            style="background-color: {colorOption.color};"
            onclick={() => handleColorSelect(colorOption.color)}
            title={colorOption.label}
          >
            <span class="sr-only">{colorOption.label}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- ENHANCED: Main border controls with compact layout -->
  <div class="flex items-center gap-2">
    
    <!-- Border width dropdown - COMPACT -->
    <div class="flex-1">
      <Popover.Root bind:open>
        <Popover.Trigger bind:ref={triggerRef}>
          {#snippet child({ props: triggerProps })}
            <Button
              variant="outline"
              class="w-full justify-between h-8 text-xs"
              {...triggerProps}
              role="combobox"
              aria-expanded={open}
              disabled={props.isProcessing}
            >
              {selectedOption.label}
              <ChevronsUpDown class="h-3 w-3 opacity-50" />
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-[var(--radix-popover-trigger-width)] p-0">
          <Command.Root>
            <Command.List>
              <Command.Empty>No border option found.</Command.Empty>
              <Command.Group>
                {#each borderOptions as option}
                  <Command.Item
                    value={option.value.toString()}
                    onSelect={() => handleWidthSelect(option.value)}
                  >
                    <Check
                      class={cn(
                        "mr-2 h-3 w-3",
                        props.borderWidth !== option.value && "text-transparent"
                      )}
                    />
                    {option.label}
                  </Command.Item>
                {/each}
              </Command.Group>
            </Command.List>
          </Command.Root>
        </Popover.Content>
      </Popover.Root>
    </div>

    <!-- ENHANCED: Border color swatch (only show when borders are enabled) -->
    {#if props.borderWidth > 0}
      <Button
        variant="outline"
        size="icon"
        class="h-8 w-8 p-1 border-border hover:border-primary"
        onclick={toggleColorPicker}
        disabled={props.isProcessing}
        title="Border color: {getDisplayColor()}"
      >
        <div 
          class="w-full h-full rounded border border-black/10"
          style="background-color: {getDisplayColor()};"
        ></div>
      </Button>
    {/if}
  </div>
</div>