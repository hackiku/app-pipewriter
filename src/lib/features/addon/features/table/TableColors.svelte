<!-- src/lib/iframe/features/table/TableColors.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Palette, Square, Table, SquareCode } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Select from "$lib/components/ui/select";
  import { cn } from "$lib/utils";
  
  // Props
  const props = $props<{
    initialValues: {
      borderColor: string;
      borderWidth: number;
      backgroundColor: string;
      headerBackground: string;
      hasHeaderRow: boolean;
    };
  }>();

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Local state
  let borderColor = $state(props.initialValues.borderColor);
  let borderWidth = $state(props.initialValues.borderWidth);
  let backgroundColor = $state(props.initialValues.backgroundColor);
  let headerBackground = $state(props.initialValues.headerBackground);
  let hasHeaderRow = $state(props.initialValues.hasHeaderRow);

  // Common colors
  const presetColors = [
    { value: "#FFFFFF", label: "White" },
    { value: "#000000", label: "Black" },
    { value: "#F1F3F4", label: "Light Gray" },
    { value: "#4285F4", label: "Blue" },
    { value: "#EA4335", label: "Red" },
    { value: "#FBBC04", label: "Yellow" },
    { value: "#34A853", label: "Green" },
    { value: "#673AB7", label: "Purple" }
  ];

  // Border width options
  const borderWidthOptions = [
    { value: 0, label: "0 pt" },
    { value: 0.5, label: "½ pt" },
    { value: 1, label: "1 pt" },
    { value: 1.5, label: "1½ pt" },
    { value: 2.25, label: "2¼ pt" },
    { value: 3, label: "3 pt" },
    { value: 4.5, label: "4½ pt" },
    { value: 6, label: "6 pt" }
  ];

  // Dispatch changes
  function dispatchChange() {
    dispatch("change", {
      borderColor,
      borderWidth,
      backgroundColor,
      headerBackground,
      hasHeaderRow
    });
  }

  // Handle color changes
  function handleBorderColorChange(event: Event) {
    borderColor = (event.target as HTMLInputElement).value;
    dispatchChange();
  }

  function handleBackgroundColorChange(event: Event) {
    backgroundColor = (event.target as HTMLInputElement).value;
    dispatchChange();
  }

  function handleHeaderBackgroundChange(event: Event) {
    headerBackground = (event.target as HTMLInputElement).value;
    dispatchChange();
  }

  // Handle border width change
  function handleBorderWidthChange(value: number) {
    borderWidth = value;
    dispatchChange();
  }

  // Handle header row toggle
  function handleHeaderRowChange(checked: boolean) {
    hasHeaderRow = checked;
    dispatchChange();
  }
</script>

<div class="space-y-6">
  <!-- Border Settings -->
  <div class="space-y-4">
    <Label class="text-sm font-medium">Border</Label>
    
    <div class="grid grid-cols-2 gap-4">
      <!-- Border Color -->
      <div class="space-y-2">
        <Label class="text-xs text-gray-500">Color</Label>
        <div class="flex gap-2">
          <div class="relative w-8 h-8">
            <Input 
              type="color" 
              value={borderColor}
              on:change={handleBorderColorChange} 
              class="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
            />
            <div 
              class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600" 
              style="background-color: {borderColor};"
            ></div>
          </div>
          <Select.Root value={borderColor} onValueChange={(value) => { borderColor = value; dispatchChange(); }}>
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Select color" />
            </Select.Trigger>
            <Select.Content>
              {#each presetColors as color}
                <Select.Item value={color.value}>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-sm" style="background-color: {color.value};"></div>
                    {color.label}
                  </div>
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>
      
      <!-- Header Background -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <Label class="text-xs text-gray-500">Header Background</Label>
          <Checkbox 
            id="has-header" 
            checked={hasHeaderRow}
            onCheckedChange={handleHeaderRowChange}
            class="h-3 w-3"
          />
          <Label for="has-header" class="text-xs cursor-pointer">Enable</Label>
        </div>
        <div class="flex gap-2" class:opacity-50={!hasHeaderRow}>
          <div class="relative w-8 h-8">
            <Input 
              type="color" 
              value={headerBackground}
              on:change={handleHeaderBackgroundChange} 
              class="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
              disabled={!hasHeaderRow}
            />
            <div 
              class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600" 
              style="background-color: {headerBackground};"
            ></div>
          </div>
          <Select.Root 
            value={headerBackground} 
            onValueChange={(value) => { headerBackground = value; dispatchChange(); }}
            disabled={!hasHeaderRow}
          >
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Select color" />
            </Select.Trigger>
            <Select.Content>
              {#each presetColors as color}
                <Select.Item value={color.value}>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-sm" style="background-color: {color.value};"></div>
                    {color.label}
                  </div>
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Table Preview with Colors -->
  <div class="border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
    <div class="flex justify-center">
      <div class="w-3/4" style="border: {borderWidth}pt solid {borderColor};">
        {#if hasHeaderRow}
          <div 
            class="p-2" 
            style="background-color: {headerBackground}; border-bottom: {borderWidth}pt solid {borderColor};"
          >
            <div class="h-4 bg-gray-300 dark:bg-gray-500 w-2/3 rounded"></div>
          </div>
        {/if}
        
        <div class="grid grid-cols-2">
          <div 
            class="p-2"
            style="background-color: {backgroundColor}; border-right: {borderWidth}pt solid {borderColor};"
          >
            <div class="h-3 bg-gray-300 dark:bg-gray-500 w-1/2 rounded"></div>
          </div>
          <div 
            class="p-2"
            style="background-color: {backgroundColor};"
          >
            <div class="h-3 bg-gray-300 dark:bg-gray-500 w-3/4 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Quick Presets -->
  <div class="space-y-2">
    <Label class="text-sm font-medium">Quick Styles</Label>
    <div class="grid grid-cols-4 gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        class="p-1 h-16"
        on:click={() => {
          borderColor = "#000000";
          borderWidth = 0.5;
          backgroundColor = "#FFFFFF";
          headerBackground = "#F1F3F4";
          hasHeaderRow = true;
          dispatchChange();
        }}
      >
        <div class="w-full h-full border border-black">
          <div class="h-1/3 bg-gray-100"></div>
          <div class="h-2/3 bg-white"></div>
        </div>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        class="p-1 h-16"
        on:click={() => {
          borderColor = "#FFFFFF";
          borderWidth = 0.5;
          backgroundColor = "#F1F3F4";
          headerBackground = "#4285F4";
          hasHeaderRow = true;
          dispatchChange();
        }}
      >
        <div class="w-full h-full border border-white">
          <div class="h-1/3 bg-blue-500"></div>
          <div class="h-2/3 bg-gray-100"></div>
        </div>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        class="p-1 h-16"
        on:click={() => {
          borderColor = "#000000";
          borderWidth = 1;
          backgroundColor = "#FFFFFF";
          headerBackground = "#FFFFFF";
          hasHeaderRow = false;
          dispatchChange();
        }}
      >
        <div class="w-full h-full border border-black bg-white"></div>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        class="p-1 h-16"
        on:click={() => {
          borderColor = "#4285F4";
          borderWidth = 1;
          backgroundColor = "#FFFFFF";
          headerBackground = "#4285F4";
          hasHeaderRow = true;
          dispatchChange();
        }}
      >
        <div class="w-full h-full border border-blue-500">
          <div class="h-1/3 bg-blue-500"></div>
          <div class="h-2/3 bg-white"></div>
        </div>
      </Button>
    </div>
  </div>
</div>
          </Select.Root>
        </div>
      </div>
      
      <!-- Border Width -->
      <div class="space-y-2">
        <Label class="text-xs text-gray-500">Width</Label>
        <Select.Root value={borderWidth.toString()} onValueChange={(value) => handleBorderWidthChange(parseFloat(value))}>
          <Select.Trigger class="w-full">
            <Select.Value placeholder="Select width" />
          </Select.Trigger>
          <Select.Content>
            {#each borderWidthOptions as option}
              <Select.Item value={option.value.toString()}>
                {option.label}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  </div>
  
  <!-- Background Colors -->
  <div class="space-y-4">
    <Label class="text-sm font-medium">Background</Label>
    
    <div class="grid grid-cols-2 gap-4">
      <!-- Cell Background -->
      <div class="space-y-2">
        <Label class="text-xs text-gray-500">Cell Background</Label>
        <div class="flex gap-2">
          <div class="relative w-8 h-8">
            <Input 
              type="color" 
              value={backgroundColor}
              on:change={handleBackgroundColorChange} 
              class="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
            />
            <div 
              class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600" 
              style="background-color: {backgroundColor};"
            ></div>
          </div>
          <Select.Root value={backgroundColor} onValueChange={(value) => { backgroundColor = value; dispatchChange(); }}>
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Select color" />
            </Select.Trigger>
            <Select.Content>
              {#each presetColors as color}
                <Select.Item value={color.value}>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-sm" style="background-color: {color.value};"></div>
                    {color.label}
                  </div>
                </Select.Item>
              {/each}
            </Select.Content>