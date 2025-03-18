<!-- $lib/iframe/components/OutlineButton.svelte -->

<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import type { LucideIcon } from 'lucide-svelte';
  import { Info } from 'lucide-svelte';
  import { cn } from "$lib/utils";

  interface OutlineButtonProps {
    icon?: typeof LucideIcon;
    label: string;
    onClick?: () => void;
    class?: string;
    disabled?: boolean;
  }

  export let icon: OutlineButtonProps['icon'] = Info;
  export let label: OutlineButtonProps['label'];
  export let onClick: OutlineButtonProps['onClick'] = () => {};
  export let disabled: OutlineButtonProps['disabled'] = false;
  let className: string = '';
  export { className as class };
</script>

<Button
  variant="outline"
  {disabled}
  class={cn("w-full text-xs", className)}
  on:click={onClick}
>
  <svelte:component this={icon} class="h-4 w-4 mr-2" />
  {label}
</Button>