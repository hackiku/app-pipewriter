<!-- src/lib/features/addon/features/table/ColorControls.svelte - MODERNIZED -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { X, ChevronDown, ChevronRight, Copy, Check, Crown, Lock } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { fade, slide } from "svelte/transition";
  import ColorPicker from "../colors/ColorPicker.svelte";
  
  // MODERNIZED: Import access control utilities
  import { useAccessControl, type SerializedUserAccess } from '$lib/utils/access-control';

  // MODERNIZED: Props now receive userAccess instead of legacy features
  const props = $props<{
    backgroundColor: string;
    isProcessing: boolean;
    userAccess?: SerializedUserAccess; // CHANGED: From features to userAccess
    onColorChange: (color: string) => void;
    onOpenUpgrade?: () => void;
  }>();

  // MODERNIZED: Create access control utilities with fallback
  let access = $state();
  
  $effect(() => {
    if (!props.userAccess) {
      // Fallback to free tier if userAccess is not available
      access = useAccessControl({
        tier: 'free',
        isPro: false,
        trialActive: false,
        trialDaysLeft: 0,
        features: {
          elements: { canUseBasicElements: true, canUseTrialElements: false, canUseProElements: false },
          colors: { canUseBasicColors: true, canUsePremiumColorSchemes: false, canUseDocumentBackgrounds: false, canUseTableBackgrounds: false },
          prompts: { canCreateCustom: false, canEditOwn: false, maxCustomPrompts: 0 },
          ai: { canUseBasicPrompts: false, canUseAdvancedPrompts: false, canGenerateContent: false },
          export: { canExportBasic: false, canExportAdvanced: false }
        }
      });
    } else {
      access = useAccessControl(props.userAccess);
    }
  });

  // State for accordion and color picker
  let isOpen = $state(false);
  let showColorPicker = $state(false);
  let copySuccess = $state(false);

  // Quick color presets - 7 colors + clear button = 8 total
  const colorPresets = [
    { color: '#ffffff', label: 'White', tier: 'free' },
    { color: '#f3f3f3', label: 'Light Gray', tier: 'free' },
    { color: '#e0e0e0', label: 'Gray', tier: 'trial' },
    { color: '#e3f2fd', label: 'Light Blue', tier: 'trial' },
    { color: '#e8f5e8', label: 'Light Green', tier: 'pro' },
    { color: '#fff9c4', label: 'Light Yellow', tier: 'pro' },
    { color: '#333333', label: 'Dark Gray', tier: 'pro' }
  ];

  // Toggle accordion - ALWAYS allow opening to show what they're missing
  function toggleAccordion() {
    isOpen = !isOpen;
  }

  // MODERNIZED: Get button class for color swatches using access utilities
  function getColorClass(color: string, tier: string) {
    const isSelected = props.backgroundColor === color;
    const canUse = access.canUseColor(tier);
    
    return cn(
      "w-6 h-6 rounded border-2 transition-all relative",
      isSelected 
        ? "border-primary shadow-md scale-110" 
        : "border-border hover:border-primary hover:scale-105",
      (props.isProcessing || !canUse) && "opacity-50 cursor-not-allowed"
    );
  }

  // MODERNIZED: Handle color click using access utilities
  function handleColorClick(color: string, tier: string) {
    if (!props.isProcessing && access.canUseColor(tier)) {
      props.onColorChange(color);
    }
  }

  // MODERNIZED: Handle clear background using access utilities
  function handleClear() {
    if (!props.isProcessing && access.canUseFeature('colors.canUseTableBackgrounds')) {
      props.onColorChange('');
    }
  }

  // MODERNIZED: Toggle color picker using access utilities
  function toggleColorPicker() {
    if (access.canUseFeature('colors.canUseTableBackgrounds')) {
      showColorPicker = !showColorPicker;
    }
  }

  // MODERNIZED: Handle color update from picker using access utilities
  function handleColorUpdate(color: string) {
    if (access.canUseFeature('colors.canUseTableBackgrounds')) {
      props.onColorChange(color);
    }
  }

  // Copy color to clipboard
  async function copyColorToClipboard() {
    if (!props.backgroundColor || !access.canUseFeature('colors.canUseTableBackgrounds')) return;
    
    try {
      await navigator.clipboard.writeText(props.backgroundColor);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 1500);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }

  // Strip alpha from color for display
  function stripAlpha(color: string): string {
    if (color.toUpperCase() === "#FFFFFF" || color.toUpperCase() === "FFFFFF") {
      return "#FFFFFF";
    }
    return color.replace(/FF$/, "").slice(0, 7).toUpperCase();
  }

  // Get display color (current background or default)
  function getDisplayColor(): string {
    return props.backgroundColor || '#FFFFFF';
  }

  // MODERNIZED: Check if user can use table backgrounds
  const canUseTableBackgrounds = $derived(access.canUseFeature('colors.canUseTableBackgrounds'));
  const shouldShowUpgrade = $derived(!canUseTableBackgrounds);
</script>

<div class="relative">
  <!-- Color Picker Overlay - positioned above entire control -->
  {#if showColorPicker && isOpen && canUseTableBackgrounds}
    <div
      class="absolute bottom-full left-0 right-0 z-20 mb-2 bg-card border border-border rounded-xl shadow-lg p-4"
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
        initialColor={getDisplayColor()} 
        onColorUpdate={handleColorUpdate} 
      />
    </div>
  {/if}

  <!-- Accordion Header - ALWAYS allow opening -->
  <button 
    class="flex items-center justify-between w-full py-2 text-left group hover:bg-accent/50 rounded-md px-1 transition-colors"
    onclick={toggleAccordion}
    disabled={props.isProcessing}
  >
    <h3 class="text-[0.6em] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
      Background color
    </h3>
    
    <div class="flex items-center gap-1">
      {#if isOpen}
        <ChevronDown class="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-all" />
      {:else}
        <ChevronRight class="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-all" />
      {/if}
    </div>
  </button>

  <!-- MODERNIZED: Accordion Content - ALWAYS show content, use overlays for restrictions -->
  {#if isOpen}
    <div transition:slide={{ duration: 200 }}>
      <!-- 2 Column Layout (original design) -->
      <div class="grid grid-cols-2 gap-3 h-full mt-2 relative">
        
        <!-- LEFT: Color Picker -->
        <div class="flex flex-col justify-between gap-2 h-full">
          <!-- Color picker button -->
          <button
            class="flex items-center rounded-lg overflow-hidden border border-border bg-card text-sm shadow-sm transition-all duration-200 hover:bg-accent disabled:opacity-50 group h-8
                   {!canUseTableBackgrounds ? 'cursor-not-allowed' : ''}"
            onclick={(e) => {
              // Only open picker if clicking outside copy button and user has access
              if (!e.target.closest('.copy-button') && canUseTableBackgrounds) {
                toggleColorPicker();
              }
            }}
            disabled={props.isProcessing || !canUseTableBackgrounds}
          >
            <!-- Color preview -->
            <div class="h-6 ml-[1px] aspect-square relative">
              <div
                class="absolute inset-0.5 border border-black/5 rounded-sm"
                style="background-color: {getDisplayColor()};"
              ></div>
            </div>
            
            <!-- Color value and copy button -->
            <div class="relative px-2 flex items-center justify-between min-w-0 flex-1">
              {#if !canUseTableBackgrounds}
                <span class="font-mono text-xs tracking-wider uppercase truncate text-muted-foreground">
                  #PRO
                </span>
              {:else}
                <span class="font-mono text-xs tracking-wider uppercase truncate">
                  {stripAlpha(getDisplayColor())}
                </span>
                
                {#if props.backgroundColor}
                  <!-- Copy button -->
                  <Button
                    variant="ghost"
                    size="icon"
                    class="copy-button h-4 w-4 -mr-1 p-0 hover:bg-background/80 ml-1"
                    onclick={(e) => {
                      e.stopPropagation();
                      copyColorToClipboard();
                    }}
                    title="Copy color code"
                    disabled={props.isProcessing}
                  >
                    {#if copySuccess}
                      <Check class="h-2 w-2 text-green-500" />
                    {:else}
                      <Copy class="h-2 w-2 text-muted-foreground" />
                    {/if}
                  </Button>
                {/if}
              {/if}
            </div>
          </button>
        </div>

        <!-- RIGHT: Color Swatches Grid (2 rows x 4 columns) - ALWAYS VISIBLE -->
        <div class="flex flex-col gap-2 h-full justify-between">
          <!-- Row 1: Clear + 3 colors -->
          <div class="grid grid-cols-4 gap-1.5">
            <!-- Clear button first -->
            <button
              class={cn(
                "w-6 h-6 rounded border-2 border-dashed border-border hover:border-red-400 transition-all flex items-center justify-center relative",
                !props.backgroundColor && "border-red-400 bg-red-50 dark:bg-red-950/20",
                (props.isProcessing || !canUseTableBackgrounds) && "opacity-50 cursor-not-allowed"
              )}
              onclick={handleClear}
              disabled={props.isProcessing || !canUseTableBackgrounds}
              title={canUseTableBackgrounds ? "Clear background" : "Pro feature"}
            >
              <X class="w-3 h-3 text-muted-foreground" />
              
              <!-- Lock overlay for restricted access -->
              {#if !canUseTableBackgrounds}
                <div class="absolute inset-0 flex items-center justify-center">
                  <Lock class="h-2 w-2 text-muted-foreground" />
                </div>
              {/if}
            </button>
            
            <!-- First 3 color swatches -->
            {#each colorPresets.slice(0, 3) as preset}
              <div class="relative">
                <button
                  class={getColorClass(preset.color, preset.tier)}
                  style="background-color: {preset.color};"
                  onclick={() => handleColorClick(preset.color, preset.tier)}
                  disabled={props.isProcessing || !access.canUseColor(preset.tier)}
                  title={access.canUseColor(preset.tier) ? preset.label : `${preset.label} (${access.getUpgradeMessage(preset.tier)})`}
                >
                  <span class="sr-only">{preset.label}</span>
                </button>
                
                <!-- Lock overlay for restricted colors -->
                {#if !access.canUseColor(preset.tier)}
                  <div class="absolute inset-0 rounded flex items-center justify-center pointer-events-none">
                    <Lock class="h-2 w-2 text-muted-foreground" />
                  </div>
                {:else if preset.tier === 'pro'}
                  <!-- Pro badge for accessible premium colors -->
                  <div class="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <div class="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
          
          <!-- Row 2: Last 4 colors -->
          <div class="grid grid-cols-4 gap-1.5">
            {#each colorPresets.slice(3) as preset}
              <div class="relative">
                <button
                  class={getColorClass(preset.color, preset.tier)}
                  style="background-color: {preset.color};"
                  onclick={() => handleColorClick(preset.color, preset.tier)}
                  disabled={props.isProcessing || !access.canUseColor(preset.tier)}
                  title={access.canUseColor(preset.tier) ? preset.label : `${preset.label} (${access.getUpgradeMessage(preset.tier)})`}
                >
                  <span class="sr-only">{preset.label}</span>
                </button>
                
                <!-- Lock overlay for restricted colors -->
                {#if !access.canUseColor(preset.tier)}
                  <div class="absolute inset-0 rounded flex items-center justify-center pointer-events-none">
                    <Lock class="h-2 w-2 text-muted-foreground" />
                  </div>
                {:else if preset.tier === 'pro'}
                  <!-- Pro badge for accessible premium colors -->
                  <div class="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <div class="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- MODERNIZED: Upgrade Bar using access utilities -->
    {#if shouldShowUpgrade}
      <div 
        class="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 
               border border-amber-200 dark:border-amber-800 rounded-md backdrop-blur-sm
               flex items-center justify-between px-3 py-2"
        transition:slide={{ duration: 200 }}
      >
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
          onclick={() => props.onOpenUpgrade?.()}
        >
          Upgrade
        </Button>
      </div>
    {/if}
  {/if}
</div>