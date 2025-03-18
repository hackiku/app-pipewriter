<!-- $lib/iframe/components/ComingSoon.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { ArrowRight } from "lucide-svelte";
  import { showAboutModal } from "../stores/aboutStore";
  import { cn } from "$lib/utils";

  interface ComingSoonProps {
    title?: string;
    description?: string;
    showBadge?: boolean;
    position?: "full" | "centered";
  }

  // Props with defaults
  export let title: ComingSoonProps["title"] = "Coming Soon";
  export let description: ComingSoonProps["description"] = undefined;
  export let showBadge: ComingSoonProps["showBadge"] = true;
  export let position: ComingSoonProps["position"] = "full";
  
  let isHovered = false;

  $: containerClass = cn(
    "absolute rounded-lg z-50 bg-gray-200 bg-opacity-50 dark:bg-gray-900/95 backdrop-blur-[0.06em]",
    "flex items-center justify-center cursor-pointer group",
    position === "full" ? "inset-0" : "inset-4 rounded-lg"
  );

  $: contentClass = cn(
    "text-center",
    description ? "space-y-2" : "flex items-center justify-center"
  );

  $: buttonClass = cn(
    "w-full gap-2 transition-all duration-200 group",
    "hover:bg-gray-300/50 dark:hover:bg-gray-800/50",
    "after:absolute after:bottom-0 after:left-0 after:right-0",
    "after:h-[2px] after:bg-current after:scale-x-0",
    "hover:after:scale-x-100 after:transition-transform",
    "after:origin-center"
  );
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
  class={containerClass}
  transition:fade={{ duration: 200 }}
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => isHovered = false}
  on:click={() => showAboutModal.set(true)}
>
  {#if !isHovered}
    <div class={contentClass}>
      {#if showBadge}
        <Badge 
          variant="outline" 
          class={cn(
            "relative",
            !description && "mb-0"
          )}
        >
          {title}
        </Badge>
      {:else}
        <h3 class="text-lg font-semibold text-foreground">
          {title}
        </h3>
      {/if}
      {#if description}
        <p class="text-sm text-muted-foreground max-w-[200px]">
          {description}
        </p>
      {/if}
    </div>
  {:else}
    <Button 
      variant="outline" 
      size="sm"
      class={buttonClass}
    >
      Get Notified
      <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </Button>
  {/if}
</div>