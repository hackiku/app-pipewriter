<!-- src/lib/features/addon/features/colors/ColorTab.svelte - MODERNIZED -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import { Check, Loader2, Copy, ChevronDown, Crown, Lock } from "@lucide/svelte";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import ColorPicker from "./ColorPicker.svelte";
  import ColorButton from "./ColorButton.svelte";
  import { changeBackground, getCurrentColor } from "$lib/services/google/colors";
  import { colorCategories, type ColorScheme } from './color-data';
  import UpgradeDrawer from '$lib/components/pricing/UpgradeDrawer.svelte';
  
  // MODERNIZED: Import access control utilities
  import { useAccessControl, type SerializedUserAccess } from '$lib/utils/access-control';

  // MODERNIZED: Props now receive userAccess instead of legacy features
  const props = $props<{
    context: any;
    userAccess: SerializedUserAccess; // CHANGED: From features to userAccess
		onStatusUpdate?: (status: {
			type: 'processing' | 'success' | 'error';
			message: string;
			details?: string;
			executionTime?: number;
			error?: any;
		}) => void;
    onProcessingStart: () => void;
    onProcessingEnd: () => void;
  }>();
  
  // MODERNIZED: Create access control utilities from userAccess
  const access = useAccessControl(props.userAccess);
  
  // State
  let currentColor = $state("#FFFFFF");
  let showColorPicker = $state(false);
  let isProcessing = $state(false);
  let activeTab = $state(colorCategories[0]?.id || "base");
  let copySuccess = $state(false);
  let isEditingHex = $state(false);
  let hexInputValue = $state("#FFFFFF");
  let showUpgradeDrawer = $state(false);

  // Initialize by getting the current color
  $effect(() => {
    if (props.context?.googleService) {
      loadCurrentColor();
    }
  });

  // Sync hex input with current color
  $effect(() => {
    hexInputValue = currentColor;
  });

  async function loadCurrentColor() {
    if (isProcessing) return;
    
    isProcessing = true;
    props.onProcessingStart();
    
    try {
      const response = await getCurrentColor((statusUpdate) => {
        props.onStatusUpdate?.(statusUpdate);
      });
      
      if (response.success && response.data?.color) {
        const cleanColor = stripAlpha(response.data.color);
        currentColor = cleanColor;
        hexInputValue = cleanColor;
      }
    } catch (error) {
      console.error("Failed to get current color:", error);
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  function stripAlpha(color: string): string {
    if (color.toUpperCase() === "#FFFFFF" || color.toUpperCase() === "FFFFFF") {
      return "#FFFFFF";
    }
    return color.replace(/FF$/, "").slice(0, 7).toUpperCase();
  }

  async function handleColorChange(color: string) {
    if (isProcessing) return;

    isProcessing = true;
    props.onProcessingStart();
    props.onStatusUpdate?.({
      type: 'processing',
      message: 'Applying color...',
      details: `Changing background to ${color}`
    });

    try {
      const cleanColor = stripAlpha(color);
      
      const response = await changeBackground(cleanColor, (statusUpdate) => {
        props.onStatusUpdate?.(statusUpdate);
      });

      if (response.success) {
        currentColor = cleanColor;
        props.onStatusUpdate?.({
          type: 'success',
          message: 'Color applied',
          executionTime: response.executionTime
        });
      } else {
        throw new Error(response.error || "Failed to change color");
      }
    } catch (error) {
      console.error("Failed to change background:", error);
      props.onStatusUpdate?.({
        type: 'error',
        message: error instanceof Error ? error.message : "Failed to change color",
        error
      });
    } finally {
      isProcessing = false;
      props.onProcessingEnd();
    }
  }

  function handleColorUpdate(color: string) {
    const cleanColor = stripAlpha(color);
    currentColor = cleanColor;
    hexInputValue = cleanColor;
  }

  function handleSubmit() {
    handleColorChange(currentColor);
  }
  
  function handleUpgradeDrawerChange(open: boolean) {
    showUpgradeDrawer = open;
  }

  // MODERNIZED: Simplified preset color click handling using access utilities
  function handlePresetColorClick(preset: ColorScheme) {
    if (!access.canUseColor(preset.tier)) {
      props.onStatusUpdate?.({
        type: 'error',
        message: 'Upgrade required',
        details: access.getUpgradeMessage(preset.tier)
      });
      return;
    }
    handleColorUpdate(preset.color);
  }

  // Handle hex input editing
  function handleHexEdit() {
    isEditingHex = true;
  }

  function handleHexSubmit(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const cleanHex = hexInputValue.startsWith('#') ? hexInputValue : `#${hexInputValue}`;
      if (/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        handleColorUpdate(cleanHex);
      }
      isEditingHex = false;
    } else if (event.key === 'Escape') {
      hexInputValue = currentColor;
      isEditingHex = false;
    }
  }

  function handleHexBlur() {
    const cleanHex = hexInputValue.startsWith('#') ? hexInputValue : `#${hexInputValue}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      handleColorUpdate(cleanHex);
    } else {
      hexInputValue = currentColor;
    }
    isEditingHex = false;
  }

  // Toggle color picker
  function toggleColorPicker() {
    showColorPicker = !showColorPicker;
  }

  // Copy color to clipboard with visual feedback
  async function copyColorToClipboard() {
    try {
      await navigator.clipboard.writeText(currentColor);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 1500);
      
      props.onStatusUpdate?.({
        type: 'success',
        message: 'Color copied to clipboard',
        details: `Copied ${currentColor}`
      });
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }

  // Get colors for active tab, split into 2 rows
  function getTabColors(tabId: string) {
    const category = colorCategories.find(cat => cat.id === tabId);
    if (!category) return { row1: [], row2: [] };
    
    const colors = category.colors;
    const mid = Math.ceil(colors.length / 2);
    
    return {
      row1: colors.slice(0, mid),      // First half (light)
      row2: colors.slice(mid)          // Second half (dark)
    };
  }

  // MODERNIZED: Simplified category access check using utilities
  function hasPro(category: typeof colorCategories[0]): boolean {
    return category.tier === 'pro' || category.colors.some(color => color.tier === 'pro');
  }

  // MODERNIZED: Simplified upgrade bar logic using utilities
  function shouldShowUpgradeBar(): boolean {
    const activeCategory = colorCategories.find(cat => cat.id === activeTab);
    return activeCategory?.tier === 'pro' && access.shouldShowUpgrade('pro');
  }
  
  // MODERNIZED: Simplified interaction check using utilities
  function canInteractWithCurrentTab(): boolean {
    const activeCategory = colorCategories.find(cat => cat.id === activeTab);
    return !activeCategory || access.canUseColor(activeCategory.tier);
  }
</script>

<div class="relative flex flex-col h-full">
  <!-- Color Picker Overlay - positioned above bottom controls -->
  {#if showColorPicker && !shouldShowUpgradeBar()}
    <div
      class="absolute bottom-12 left-0 right-0 z-20 bg-card border border-border rounded-xl shadow-lg p-4"
      transition:fade={{ duration: 150 }}
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium">Custom Color</h3>
        <Button 
          variant="ghost" 
          size="icon"
          class="h-6 w-6"
          onclick={toggleColorPicker}
        >
          <ChevronDown class="h-3 w-3" />
        </Button>
      </div>
      
      <ColorPicker 
        initialColor={currentColor} 
        onColorUpdate={handleColorUpdate} 
      />
    </div>
  {/if}

  <!-- Main Content -->
  <div class="flex flex-col h-full space-y-4">
    <!-- Scrollable Tabs -->
    <Tabs.Root value={activeTab} onValueChange={(value) => activeTab = value || colorCategories[0]?.id || "base"}>
      <div class="relative hide-scrollbar-container">
        <div class="hide-scrollbar-content">
          <Tabs.List class="flex w-[32em] gap-1 bg-secondary-foreground/5 p-1 rounded-lg justify-start">
            {#each colorCategories as category}
              <Tabs.Trigger 
                value={category.id}
                class="flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1"
              >
                <span>{category.name}</span>
                {#if hasPro(category)}
                  <Crown class="h-3 w-3 text-amber-500" />
                {/if}
              </Tabs.Trigger>
            {/each}
          </Tabs.List>
        </div>
      </div>

      <!-- Tab Content: Color Swatches in 2 Rows -->
      <div class="flex-1 overflow-hidden">
        {#each colorCategories as category}
          <Tabs.Content value={category.id} class="h-full">
            {@const { row1, row2 } = getTabColors(category.id)}
            
            <div class="gap-2 h-full flex flex-col">
              <!-- Row 1 -->
              <div class="grid grid-cols-5 gap-2">
                {#each row1 as preset}
                  <div class="relative p-0.5">
                    <ColorButton
                      color={preset.color}
                      title={access.canUseColor(preset.tier) ? preset.title : `${preset.title} (${access.getUpgradeMessage(preset.tier)})`}
                      isSelected={currentColor === preset.color}
                      isProcessing={isProcessing || !access.canUseColor(preset.tier)}
                      onClick={() => handlePresetColorClick(preset)}
                    />
                    
                    <!-- MODERNIZED: Lock overlay using access utilities -->
                    {#if !access.canUseColor(preset.tier)}
                      <div class="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none">
                        <Lock class="h-3 w-3 mb-1 text-muted-foreground" />
                      </div>
                    {:else if preset.tier === 'pro'}
                      <!-- Pro badge for accessible premium colors -->
                      <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                        <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
              
              <!-- Row 2 -->
              {#if row2.length > 0}
                <div class="grid grid-cols-5 gap-2">
                  {#each row2 as preset}
                    <div class="relative p-0.5">
                      <ColorButton
                        color={preset.color}
                        title={access.canUseColor(preset.tier) ? preset.title : `${preset.title} (${access.getUpgradeMessage(preset.tier)})`}
                        isSelected={currentColor === preset.color}
                        isProcessing={isProcessing || !access.canUseColor(preset.tier)}
                        onClick={() => handlePresetColorClick(preset)}
                      />
                      
                      <!-- MODERNIZED: Lock overlay using access utilities -->
                      {#if !access.canUseColor(preset.tier)}
                        <div class="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none">
                          <Lock class="h-3 w-3 mb-1 text-muted-foreground" />
                        </div>
                      {:else if preset.tier === 'pro'}
                        <!-- Pro badge for accessible premium colors -->
                        <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </Tabs.Content>
        {/each}
      </div>
    </Tabs.Root>

    <!-- Bottom Controls: Hex Button + Apply -->
    <div class="flex gap-2 mt-auto h-9 relative">
      <!-- MODERNIZED: Upgrade Bar Overlay using access utilities -->
      {#if shouldShowUpgradeBar()}
        <div class="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 
                    border border-amber-200 dark:border-amber-800 rounded-md backdrop-blur-sm z-10
                    flex items-center justify-between px-3"
             transition:fade={{ duration: 200 }}>
          <div class="flex items-center gap-2">
            <Crown class="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span class="text-xs font-medium text-amber-800 dark:text-amber-200">
              {access.getUpgradeMessage('pro')}
            </span>
          </div>
          <Button
            variant="default"
            size="sm"
            class="h-6 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
						onclick={() => {
							showUpgradeDrawer = true;
						}}
          >
            Upgrade
          </Button>
        </div>
      {/if}

      <!-- Hex Color Button with Integrated Copy -->
      <button
        class="flex flex-1 items-center h-8 rounded-lg overflow-hidden border border-input bg-card text-sm shadow-sm transition-all duration-200 hover:bg-accent disabled:opacity-50 group
               {shouldShowUpgradeBar() ? 'pointer-events-none opacity-40' : ''}"
        onclick={(e) => {
          if (shouldShowUpgradeBar()) return;
          // Only open picker if clicking outside hex text and copy button
          if (!e.target.closest('.hex-input') && !e.target.closest('.copy-button')) {
            toggleColorPicker();
          }
        }}
        disabled={isProcessing || shouldShowUpgradeBar()}
      >
        <!-- Color preview -->
        <div class="h-7 ml-[1px] aspect-square relative">
          <div
            class="absolute inset-0.5 border border-black/5 rounded-md"
            style="background-color: {currentColor};"
          ></div>
        </div>
        
        <!-- Color value and copy button -->
        <div class="relative flex-1 px-3 flex items-center justify-between min-w-0">
          <!-- Show placeholder text when upgrade bar is active -->
          {#if shouldShowUpgradeBar()}
            <span class="font-mono text-xs tracking-wider uppercase text-muted-foreground">
              #PRO
            </span>
          {:else if isEditingHex}
            <input
              class="hex-input font-mono text-xs tracking-wider uppercase bg-transparent border-none outline-none flex-1"
              bind:value={hexInputValue}
              onkeydown={handleHexSubmit}
              onblur={handleHexBlur}
              autofocus
            />
          {:else}
            <span
              role="button"
              tabindex="0"
              class="hex-input font-mono text-xs tracking-wider uppercase truncate cursor-text w-full text-left"
              onclick={handleHexEdit}
              onkeydown={(e) => e.key === 'Enter' && handleHexEdit()}
            >
              {currentColor}
            </span>
          {/if}
          
          <!-- Copy button -->
          {#if !shouldShowUpgradeBar()}
            <Button
              variant="ghost"
              size="icon"
              class="copy-button h-6 w-6 -mr-2 p-1 hover:bg-background/80"
              onclick={(e) => {
                e.stopPropagation();
                copyColorToClipboard();
              }}
              title="Copy color code"
              disabled={isProcessing}
            >
              {#if copySuccess}
                <Check class="h-2 w-2 text-green-500" />
              {:else}
                <Copy class="h-2 w-2 text-muted-foreground" />
              {/if}
            </Button>
          {/if}
        </div>
      </button>

      <!-- Apply button -->
      <Button 
        variant="default" 
        class="px-3 h-8 text-xs {shouldShowUpgradeBar() ? 'pointer-events-none opacity-40' : ''}"
        disabled={isProcessing || shouldShowUpgradeBar()}
        onclick={handleSubmit}
      >
        {#if isProcessing}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          <Check class="h-3 w-3 -mr-1" />
          Apply
        {/if}
      </Button>
    </div>
  </div>

	<UpgradeDrawer isOpen={showUpgradeDrawer} onOpenChange={handleUpgradeDrawerChange} />

</div>

<style>
  /* Bulletproof horizontal scrollbar hiding - container technique */
  .hide-scrollbar-container {
    overflow: hidden;
    position: relative;
  }
  
  .hide-scrollbar-content {
    overflow-x: auto;
    overflow-y: hidden;
    /* Push scrollbar below visible area */
    padding-bottom: 20px;
    margin-bottom: -20px;
  }
</style>