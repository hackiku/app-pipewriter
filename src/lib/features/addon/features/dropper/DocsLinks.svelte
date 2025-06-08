<!-- src/lib/features/addon/features/dropper/DocsLinks.svelte - MODERNIZED -->
<script lang="ts">
  import { ExternalLink, Lock, FileText, Folder } from '@lucide/svelte';
  import { cn } from '$lib/utils';
  
  // MODERNIZED: Import access control utilities
  import { useAccessControl, type SerializedUserAccess } from '$lib/utils/access-control';
  
  // MODERNIZED: Props now receive userAccess instead of legacy userTier
  const props = $props<{
    userAccess?: SerializedUserAccess; // CHANGED: From userTier to userAccess
    showInfo?: boolean;
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

  // Template documents - URLs embedded here
  const templateDocs = [
    {
      id: 'starter-template',
      title: 'Starter',
      description: 'Basic wireframe template',
      url: 'https://docs.google.com/document/d/1VsjRgy_dAccHhRF2iG_jEknv8bQn6t47wX3GD-_uoaQ',
      tier: 'free',
      type: 'doc'
    },
    {
      id: 'pro-template',
      title: 'Pro',
      description: 'Advanced design template',
      url: 'https://docs.google.com/document/d/1hjIdUjCRPGLFJhK6NNmV24zxZxGivWOQX959aUPfXR0',
      tier: 'pro',
      type: 'doc'
    },
    {
      id: 'dark-template',
      title: 'Dark',
      description: 'Dark theme template',
      url: 'https://docs.google.com/document/d/1MBSDZ7EDJ4JBenwoUnna5dbbXr7oCAOv1__m8LVJfSA',
      tier: 'pro',
      type: 'doc'
    }
  ];

  // Drive folders - all pro tier
  const driveFolders = [
    {
      id: 'pro-folder',
      title: 'Pro Templates',
      description: 'Premium template collection',
      url: 'https://drive.google.com/drive/folders/1pro-templates-folder',
      tier: 'pro',
      type: 'drive'
    },
    {
      id: 'prompts-folder', 
      title: 'AI Prompts',
      description: 'Curated prompt library',
      url: 'https://drive.google.com/drive/folders/1prompts-library-folder',
      tier: 'pro',
      type: 'drive'
    },
    {
      id: 'samples-folder',
      title: 'Sample Docs',
      description: 'Real-world examples',
      url: 'https://drive.google.com/drive/folders/1samples-examples-folder',
      tier: 'pro',
      type: 'drive'
    }
  ];

  // MODERNIZED: Check if item is locked using centralized access control
  function isLocked(tier: string): boolean {
    if (!access) return tier !== 'free'; // Fallback behavior
    
    // UPDATED: Use centralized access control (trial users get full access)
    return !access.canUseElement(tier);
  }

  // Handle link clicks - always open (even if locked for preview)
  function handleLinkClick(url: string) {
    window.open(url, '_blank');
  }

  // Get appropriate icon for item type
  function getItemIcon(type: string, tier: string) {
    if (type === 'drive') return Folder;
    return FileText;
  }

  // MODERNIZED: Card styling with access control awareness
  function getCardClass(tier: string) {
    const baseClass = "group relative w-full h-20 p-3 rounded-lg border transition-all duration-200 cursor-pointer";
    const themeClass = "bg-card hover:bg-accent border-border";
    const lockClass = isLocked(tier) ? "opacity-75" : "";
    const hoverClass = "hover:-translate-y-0.5 hover:shadow-md";
    
    return cn(baseClass, themeClass, lockClass, hoverClass);
  }
</script>

{#if access}
  <div class="space-y-4 px-2">
    <!-- Template Documents Section -->
    <section>
      <!-- Category Header - always visible -->
      <h3 class="mb-3 ml-2 text-xs font-normal capitalize text-neutral-400 dark:text-neutral-500">
        Template Documents ({templateDocs.length})
      </h3>

      <!-- Documents Grid - always 3 columns -->
      <div class="grid grid-cols-3 gap-2 mb-6">
        {#each templateDocs as doc}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class={getCardClass(doc.tier)}
            onclick={() => handleLinkClick(doc.url)}
          >
            <!-- Content -->
            <div class="flex flex-col h-full">
              <!-- Header with icon and lock -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <FileText class="h-4 w-4 text-blue-600" />
                  <span class="text-xs font-medium truncate">{doc.title}</span>
                </div>
                
                <!-- MODERNIZED: Lock indicator using centralized access control -->
                {#if isLocked(doc.tier)}
                  <div class="bg-background/90 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1">
                    <Lock class="h-3 w-3 text-muted-foreground" />
                    <span class="text-xs text-muted-foreground font-medium">
                      {doc.tier === 'pro' ? 'Pro' : 'Trial'}
                    </span>
                  </div>
                {/if}
              </div>

              <!-- External link indicator -->
              <div class="flex justify-end mt-2">
                <ExternalLink class="h-3 w-3 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Drive Folders Section -->
    <section>
      <!-- Category Header -->
      <h3 class="mb-3 ml-2 text-xs font-normal capitalize text-neutral-400 dark:text-neutral-500">
        Drive Folders ({driveFolders.length})
      </h3>

      <!-- Folders Grid - always 3 columns -->
      <div class="grid grid-cols-3 gap-2">
        {#each driveFolders as folder}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class={getCardClass(folder.tier)}
            onclick={() => handleLinkClick(folder.url)}
          >
            <!-- Content -->
            <div class="flex flex-col h-full">
              <!-- Header with folder icon and lock -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Folder class="h-4 w-4 text-amber-600" />
                  <span class="text-xs font-medium truncate">{folder.title}</span>
                </div>
                
                <!-- MODERNIZED: All folders are pro - show lock for free users only -->
                {#if isLocked(folder.tier)}
                  <div class="bg-background/90 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1">
                    <Lock class="h-3 w-3 text-muted-foreground" />
                    <span class="text-xs text-muted-foreground font-medium">Pro</span>
                  </div>
                {/if}
              </div>

              <!-- External link indicator -->
              <div class="flex justify-end mt-2">
                <ExternalLink class="h-3 w-3 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
{:else}
  <div class="p-4 text-center">
    <p class="text-muted-foreground text-sm">Loading templates...</p>
  </div>
{/if}