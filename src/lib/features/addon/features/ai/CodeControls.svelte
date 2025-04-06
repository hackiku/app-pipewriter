<!-- $lib/iframe/features/ai/CodeControls.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as LucideIcons from "lucide-svelte";
  import { cn } from "$lib/utils";

  // Props
  const props = $props<{
    type: 'drop' | 'strip';
    disabled?: boolean;
    onAction: (action: string, params?: any) => void;
  }>();

  // Get icon names based on type
  let mainIconName = $derived(props.type === 'drop' ? 'Plus' : 'Trash2');
  let secondaryIconName = $derived('Code');
  let label = $derived(props.type === 'drop' ? "Drop Code" : "Strip Code");
  
  // Get the actual icon components
  const MainIcon = $derived(() => LucideIcons[mainIconName]);
  const SecondaryIcon = $derived(() => LucideIcons[secondaryIconName]);
  
  // Generate action buttons based on type
  let actionButtons = $derived(() => {
    if (props.type === 'drop') {
      return [
        {
          iconName: 'ArrowUp',
          label: "Start",
          onClick: () => props.onAction('dropCode', { position: 'start' })
        },
        {
          iconName: 'Clipboard',
          label: "Copy",
          onClick: () => props.onAction('dropCode', { copyToClipboard: true })
        },
        {
          iconName: 'ArrowDown',
          label: "End",
          onClick: () => props.onAction('dropCode', { position: 'end' })
        }
      ];
    } else {
      return [
        {
          iconName: 'Hash',
          label: "Tags",
          onClick: () => props.onAction('stripCode', { all: false })
        },
        {
          iconName: 'X',
          label: "All",
          onClick: () => props.onAction('stripCode', { all: true })
        }
      ];
    }
  });
</script>

<div class="flex flex-col w-full h-full">
  <!-- Header with icons -->
  <div class="flex items-center gap-2 mb-1">
    {#if MainIcon}
      <MainIcon class="h-4 w-4" />
    {/if}
    {#if SecondaryIcon}
      <SecondaryIcon class="h-4 w-4" />
    {/if}
  </div>
  
  <!-- Label -->
  <div class="text-xs font-medium mb-2">{label}</div>
  
  <!-- Action buttons in vertical layout -->
  <div class="flex flex-col gap-2 flex-1">
    {#each actionButtons as button}
      <Button
        variant="outline"
        class="w-full justify-start px-3 py-2 text-xs"
        disabled={props.disabled}
        onclick={button.onClick}
      >
        {#if button.iconName}
          {@const ButtonIcon = LucideIcons[button.iconName]}
          <ButtonIcon class="h-3 w-3 mr-2" />
        {/if}
        <span>{button.label}</span>
      </Button>
    {/each}
  </div>
</div>