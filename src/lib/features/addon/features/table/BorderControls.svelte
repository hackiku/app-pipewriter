<!-- src/lib/features/addon/features/table/BorderControls.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { tick } from "svelte";
  import { Check, ChevronsUpDown } from "@lucide/svelte";
	// import CheckIcon from "@lucide/svelte/icons/check";
  // import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Button } from "$lib/components/ui/button/index.js";

  // Props
  const props = $props<{
    borderWidth: number;
    borderColor: string;
    isProcessing: boolean;
    onBorderChange: (width: number, color?: string) => void;
  }>();

  // Border options
  const borderOptions = [
    { value: 0, label: "No Border" },
    { value: 1, label: "Border 1pt" },
    { value: 2, label: "Border 2pt" },
    { value: 3, label: "Border 3pt" },
    { value: 4, label: "Border 4pt" },
    { value: 5, label: "Border 5pt" },
    { value: 6, label: "Border 6pt" }
  ];

  // Combobox state
  let open = $state(false);
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

  // Handle selection
  function handleSelect(width: number) {
    props.onBorderChange(width, props.borderColor);
    closeAndFocusTrigger();
  }
</script>

<!-- Full width row layout -->
<!-- <div class="flex items-center gap-3"> -->


  <!-- Right: Combobox -->
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
                  onSelect={() => handleSelect(option.value)}
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
<!-- </div> -->