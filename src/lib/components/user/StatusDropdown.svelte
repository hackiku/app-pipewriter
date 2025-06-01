<!-- src/lib/components/user/StatusDropdown.svelte - FIXED -->
<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button";
  import { ChevronDown, Crown, Clock, User, Loader2 } from "@lucide/svelte";
  import { dev } from '$app/environment';

  // Props
  const props = $props<{
    currentStatus: 'free' | 'trial' | 'pro';
    isPro: boolean;
    trialActive: boolean;
    trialDaysLeft: number;
    disabled?: boolean;
  }>();

  // Local state
  let isChanging = $state(false);
  let selectedStatus = $state(props.currentStatus);

  // Update selected status when props change
  $effect(() => {
    selectedStatus = props.currentStatus;
  });

  // Status options
  const statusOptions = [
    {
      value: 'free',
      label: 'Free Plan',
      icon: User,
      description: 'Basic features only'
    },
    {
      value: 'trial',
      label: 'Trial Plan', 
      icon: Clock,
      description: '14-day trial access'
    },
    {
      value: 'pro',
      label: 'Pro Plan',
      icon: Crown,
      description: 'Full access to all features'
    }
  ] as const;

  // Get current status display
  function getCurrentStatusDisplay() {
    if (props.isPro) {
      return {
        label: 'Pro Plan',
        icon: Crown,
        color: 'text-primary'
      };
    } else if (props.trialActive) {
      return {
        label: `Trial • ${props.trialDaysLeft}d left`,
        icon: Clock,
        color: 'text-amber-600'
      };
    } else {
      return {
        label: 'Free Plan',
        icon: User,
        color: 'text-muted-foreground'
      };
    }
  }

  // Handle status change
  async function handleStatusChange(newStatus: 'free' | 'trial' | 'pro') {
    if (newStatus === selectedStatus || isChanging) return;

    isChanging = true;
    console.log(`[STATUS] Changing from ${selectedStatus} to ${newStatus}`);

    try {
      let response;

      if (newStatus === 'pro') {
        // Upgrade to Pro
        response = await fetch('/api/user/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (newStatus === 'trial') {
        // Set trial (14 days)
        response = await fetch('/api/user/set-trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days: 14 })
        });
      } else {
        // Downgrade to free (reset trial)
        response = await fetch('/api/user/downgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resetTrial: true })
        });
      }

      if (response?.ok) {
        console.log(`[STATUS] Successfully changed to ${newStatus}`);
        selectedStatus = newStatus;
        
        // Small delay then reload to get updated data
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.error(`[STATUS] Failed to change to ${newStatus}`);
        selectedStatus = props.currentStatus; // Revert
      }

    } catch (error) {
      console.error(`[STATUS] Error changing to ${newStatus}:`, error);
      selectedStatus = props.currentStatus; // Revert
    } finally {
      isChanging = false;
    }
  }

  const currentDisplay = $derived(getCurrentStatusDisplay());
</script>

<!-- Only show in development -->
{#if dev}
  <DropdownMenu.Root>
    <!-- FIXED: Remove asChild and let:builder pattern -->
    <DropdownMenu.Trigger 
      class="flex items-center justify-between w-full h-11 px-3 py-2 text-sm font-medium border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={props.disabled || isChanging}
    >
      <div class="flex items-center gap-2">
        {#if isChanging}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          <svelte:component this={currentDisplay.icon} class="h-4 w-4 {currentDisplay.color}" />
        {/if}
        <span class={currentDisplay.color}>
          {isChanging ? 'Updating...' : currentDisplay.label}
        </span>
      </div>
      <ChevronDown class="h-4 w-4 opacity-50" />
    </DropdownMenu.Trigger>

    <DropdownMenu.Content class="w-64" align="center">
      <DropdownMenu.Group>
        <DropdownMenu.Label class="flex items-center gap-2">
          <User class="h-4 w-4" />
          Change Plan Status
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        
        <DropdownMenu.RadioGroup bind:value={selectedStatus}>
          {#each statusOptions as option}
            <DropdownMenu.RadioItem 
              value={option.value}
              class="flex items-start gap-3 p-3 cursor-pointer"
              disabled={isChanging}
              onclick={() => handleStatusChange(option.value)}
            >
              <div class="flex items-center gap-3 flex-1">
                <svelte:component 
                  this={option.icon} 
                  class="h-4 w-4 {option.value === 'pro' ? 'text-primary' : option.value === 'trial' ? 'text-amber-600' : 'text-muted-foreground'}" 
                />
                <div class="flex-1">
                  <div class="font-medium text-sm">{option.label}</div>
                  <div class="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </div>
            </DropdownMenu.RadioItem>
          {/each}
        </DropdownMenu.RadioGroup>
        
        <DropdownMenu.Separator />
        <div class="px-2 py-1">
          <div class="text-xs text-muted-foreground">
            ⚠️ Dev only - changes user tier for testing
          </div>
        </div>
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{:else}
  <!-- Production: Show upgrade button only -->
  {#if !props.isPro}
    <Button 
      class="w-full h-11 font-medium"
      disabled={props.disabled}
      onclick={() => handleStatusChange('pro')}
    >
      {#if isChanging}
        <Loader2 class="h-4 w-4 animate-spin mr-2" />
        Upgrading...
      {:else}
        <Crown class="h-4 w-4 mr-2" />
        Upgrade to Pro
      {/if}
    </Button>
  {:else}
    <!-- Pro user status display -->
    <div class="flex items-center justify-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-3 rounded-lg">
      <Crown class="h-4 w-4" />
      Pro Plan Active
    </div>
  {/if}
{/if}