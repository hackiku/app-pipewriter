<!-- $lib/iframe/layout/TopBar.svelte -->
<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import { Info, Sun, Moon, Minimize2 } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  // Replace stores with state variables
  let showInfo = $state(false);
  let zenMode = $state(false);
  let isDarkMode = $state(false);

  function toggleShowInfo() {
    showInfo = !showInfo;
  }

  function toggleZenMode() {
    zenMode = !zenMode;
  }

  function handleToggleMode() {
    isDarkMode = !isDarkMode;
    toggleMode();
  }

  // Create simple button component to replace IconButton
  const Button = (props) => {
    const { icon, selected, size, className } = props;
    
    return {
      tag: 'button',
      props: {
        class: `rounded-full transition-all duration-200 
                ${size === 'sm' ? 'h-7 w-7 p-1.5' : 'h-8 w-8 p-2'} 
                ${selected ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'} 
                ${className || ''}`,
        onclick: props.onclick
      },
      slots: {
        default: {
          render: (slotProps) => {
            return {
              tag: props.icon,
              props: {
                class: 'w-full h-full'
              }
            };
          }
        }
      }
    };
  };
</script>

<div class="flex items-center justify-between py-2">
  <!-- Zen Mode Button -->
  <button 
    class="rounded-full h-7 w-7 p-1.5 transition-all duration-200 hover:rotate-90
           {zenMode ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'}"
    onclick={toggleZenMode}
  >
    <Minimize2 class="w-full h-full" />
  </button>
  
  <div class="flex items-center justify-middle gap-2">
    <!-- Info Button -->
    <button
      class="rounded-full h-7 w-7 p-1.5 transition-all duration-200 hover:rotate-12
             {showInfo ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'}"
      onclick={toggleShowInfo}
    >
      <Info class="w-full h-full" />
    </button>
    
    <!-- Theme Toggle Button -->
    <div class="relative w-7 h-7 mr-1">
      {#key isDarkMode}
        <div
          in:fade={{ duration: 200 }}
          out:fade={{ duration: 200 }}
          class="absolute inset-0"
        >
          <button
            class="rounded-full h-7 w-7 p-1.5 transition-all duration-200
                  {isDarkMode ? 'hover:rotate-12' : 'hover:rotate-90'}
                  text-muted-foreground hover:text-foreground"
            onclick={handleToggleMode}
          >
            {#if isDarkMode}
              <Moon class="w-full h-full" />
            {:else}
              <Sun class="w-full h-full" />
            {/if}
          </button>
        </div>
      {/key}
    </div>
  </div>
</div>

<style>
  /* Optional: Add a subtle transition for the container itself */
  div {
    transition: background-color 0.2s ease;
  }
</style>