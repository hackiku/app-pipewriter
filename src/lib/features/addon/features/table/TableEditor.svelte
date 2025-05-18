<!-- src/lib/features/addon/features/table/TableEditor.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { onMount } from "svelte";
  import { 
    getTableConfig, 
    updateTableConfig,
    resetState 
  } from "./index";
  import { 
    ChevronDown, 
    Table2, 
    AlignLeft, 
    AlignCenter, 
    AlignRight,
    AlignStartVertical, 
    AlignCenterVertical, 
    AlignEndVertical,
    Columns, 
    RowsIcon, 
    Square, 
    Palette 
  } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  
  // State for accordion sections
  let openSections = $state({
    table: true,
    column: false,
    row: false,
    cell: false,
    color: false
  });
  
  // Table state
  let tableConfig = $derived(getTableConfig());
  let tablePreviewRef = $state<HTMLDivElement | null>(null);
  
  // Numeric inputs
  let columnWidth = $state(tableConfig.dimensions.columnWidth.toString());
  let rowHeight = $state(tableConfig.dimensions.rowHeight.toString());
  let cellPadding = $state("0");
  let headerRows = $state("0");
  
  // Toggle section
  function toggleSection(section: keyof typeof openSections) {
    openSections[section] = !openSections[section];
  }
  
  // Handle alignment changes
  function setTableAlignment(alignment: "left" | "center" | "right") {
    updateTableConfig({
      alignment: {
        ...tableConfig.alignment,
        tableAlignment: alignment
      }
    });
  }
  
  function setCellAlignment(alignment: "top" | "middle" | "bottom") {
    updateTableConfig({
      alignment: {
        ...tableConfig.alignment,
        cellVerticalAlignment: alignment
      }
    });
  }
  
  // Handle input changes
  function updateColumnWidth() {
    const width = parseFloat(columnWidth);
    if (!isNaN(width) && width > 0) {
      updateTableConfig({
        dimensions: {
          ...tableConfig.dimensions,
          columnWidth: width
        }
      });
    }
  }
  
  function updateRowHeight() {
    const height = parseFloat(rowHeight);
    if (!isNaN(height) && height > 0) {
      updateTableConfig({
        dimensions: {
          ...tableConfig.dimensions,
          rowHeight: height
        }
      });
    }
  }
  
  // Update state when component mounts
  onMount(() => {
    // Initialize numeric inputs from config
    columnWidth = tableConfig.dimensions.columnWidth.toString();
    rowHeight = tableConfig.dimensions.rowHeight.toString();
  });
  
  // Helper function for section headers
  function getSectionHeaderClass(isOpen: boolean) {
    return cn(
      "flex items-center justify-between w-full p-3 text-left cursor-pointer",
      "hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
      isOpen && "bg-neutral-50 dark:bg-neutral-900"
    );
  }
  
  // Get alignment button class
  function getAlignButtonClass(current: string, value: string) {
    return cn(
      "flex h-9 w-9 items-center justify-center",
      "border rounded-md transition-colors",
      current === value 
        ? "bg-primary/10 border-primary text-primary" 
        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
    );
  }
</script>

<div class="flex flex-col w-full bg-white dark:bg-neutral-950 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
  <!-- Table Preview -->
  <div class="p-4 border-b border-neutral-200 dark:border-neutral-800">
    <div 
      bind:this={tablePreviewRef}
      class={cn(
        "w-full flex", 
        tableConfig.alignment.tableAlignment === "left" ? "justify-start" : 
        tableConfig.alignment.tableAlignment === "right" ? "justify-end" : "justify-center"
      )}
    >
      <div class="border border-neutral-300 dark:border-neutral-700 rounded overflow-hidden shadow-sm">
        <div class="grid grid-cols-3">
          {#each [0, 1, 2] as col}
            <div class={cn(
              "border-neutral-300 dark:border-neutral-700",
              col < 2 && "border-r"
            )}>
              <div class={cn(
                "h-12 p-1 flex w-full", 
                tableConfig.alignment.cellVerticalAlignment === "top" ? "items-start" : 
                tableConfig.alignment.cellVerticalAlignment === "bottom" ? "items-end" : "items-center"
              )}>
                <div class="h-3 bg-neutral-300 dark:bg-neutral-600 rounded w-16"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Accordion Sections -->
  <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
    <!-- Table Section -->
    <div>
      <button 
        class={getSectionHeaderClass(openSections.table)}
        onclick={() => toggleSection('table')}
      >
        <div class="flex items-center">
          <Table2 class="h-5 w-5 mr-2" />
          <span>Table</span>
        </div>
        <ChevronDown class={cn(
          "h-5 w-5 transition-transform",
          openSections.table ? "rotate-180" : ""
        )} />
      </button>
      
      {#if openSections.table}
        <div class="p-4 bg-neutral-50 dark:bg-neutral-900">
          <h3 class="text-sm mb-2">Alignment</h3>
          <div class="grid grid-cols-3 gap-2">
            <button 
              class={getAlignButtonClass(tableConfig.alignment.tableAlignment, "left")}
              onclick={() => setTableAlignment("left")}
              title="Align left"
            >
              <AlignLeft class="h-5 w-5" />
            </button>
            <button 
              class={getAlignButtonClass(tableConfig.alignment.tableAlignment, "center")}
              onclick={() => setTableAlignment("center")}
              title="Align center"
            >
              <AlignCenter class="h-5 w-5" />
            </button>
            <button 
              class={getAlignButtonClass(tableConfig.alignment.tableAlignment, "right")}
              onclick={() => setTableAlignment("right")}
              title="Align right"
            >
              <AlignRight class="h-5 w-5" />
            </button>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Column Section -->
    <div>
      <button 
        class={getSectionHeaderClass(openSections.column)}
        onclick={() => toggleSection('column')}
      >
        <div class="flex items-center">
          <Columns class="h-5 w-5 mr-2" />
          <span>Column</span>
        </div>
        <ChevronDown class={cn(
          "h-5 w-5 transition-transform",
          openSections.column ? "rotate-180" : ""
        )} />
      </button>
      
      {#if openSections.column}
        <div class="p-4 bg-neutral-50 dark:bg-neutral-900">
          <div class="flex items-center mb-4">
            <input 
              type="checkbox" 
              id="column-width-enabled" 
              class="h-4 w-4 mr-2" 
              checked
            />
            <label for="column-width-enabled" class="text-sm">Column width</label>
            <div class="flex-1 flex justify-end">
              <div class="flex items-center">
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.5" 
                  max="10"
                  bind:value={columnWidth} 
                  onblur={updateColumnWidth}
                  class="w-16 h-8 px-2 text-right border border-neutral-300 dark:border-neutral-700 rounded"
                />
                <span class="ml-2">in</span>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col">
            <label for="column-data-type" class="text-sm mb-1">Column data type</label>
            <select 
              id="column-data-type" 
              class="h-10 px-2 border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
            >
              <option value="none">None</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Row Section -->
    <div>
      <button 
        class={getSectionHeaderClass(openSections.row)}
        onclick={() => toggleSection('row')}
      >
        <div class="flex items-center">
          <RowsIcon class="h-5 w-5 mr-2" />
          <span>Row</span>
        </div>
        <ChevronDown class={cn(
          "h-5 w-5 transition-transform",
          openSections.row ? "rotate-180" : ""
        )} />
      </button>
      
      {#if openSections.row}
        <div class="p-4 bg-neutral-50 dark:bg-neutral-900">
          <div class="flex items-center mb-4">
            <input 
              type="checkbox" 
              id="row-height-enabled" 
              class="h-4 w-4 mr-2" 
              checked
            />
            <label for="row-height-enabled" class="text-sm">Minimum row height</label>
            <div class="flex-1 flex justify-end">
              <div class="flex items-center">
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.1" 
                  max="5"
                  bind:value={rowHeight} 
                  onblur={updateRowHeight}
                  class="w-16 h-8 px-2 text-right border border-neutral-300 dark:border-neutral-700 rounded"
                />
                <span class="ml-2">in</span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="header-row-enabled" 
              class="h-4 w-4 mr-2"
            />
            <label for="header-row-enabled" class="text-sm">Pin header row(s)</label>
            <div class="flex-1 flex justify-end">
              <div class="flex items-center">
                <input 
                  type="number" 
                  bind:value={headerRows}
                  min="0"
                  max="5"
                  class="w-16 h-8 px-2 text-right border border-neutral-300 dark:border-neutral-700 rounded"
                />
                <span class="ml-2">rows</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Cell Section -->
    <div>
      <button 
        class={getSectionHeaderClass(openSections.cell)}
        onclick={() => toggleSection('cell')}
      >
        <div class="flex items-center">
          <Square class="h-5 w-5 mr-2" />
          <span>Cell</span>
        </div>
        <ChevronDown class={cn(
          "h-5 w-5 transition-transform",
          openSections.cell ? "rotate-180" : ""
        )} />
      </button>
      
      {#if openSections.cell}
        <div class="p-4 bg-neutral-50 dark:bg-neutral-900 space-y-4">
          <div class="flex flex-col">
            <label for="cell-vertical-alignment" class="text-sm mb-1">Cell vertical alignment</label>
            <div class="grid grid-cols-3 gap-2">
              <button 
                class={getAlignButtonClass(tableConfig.alignment.cellVerticalAlignment, "top")}
                onclick={() => setCellAlignment("top")}
                title="Align top"
              >
                <AlignStartVertical class="h-5 w-5" />
              </button>
              <button 
                class={getAlignButtonClass(tableConfig.alignment.cellVerticalAlignment, "middle")}
                onclick={() => setCellAlignment("middle")}
                title="Align middle"
              >
                <AlignCenterVertical class="h-5 w-5" />
              </button>
              <button 
                class={getAlignButtonClass(tableConfig.alignment.cellVerticalAlignment, "bottom")}
                onclick={() => setCellAlignment("bottom")}
                title="Align bottom"
              >
                <AlignEndVertical class="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div class="flex items-center">
            <label for="cell-padding" class="text-sm">Cell padding</label>
            <div class="flex-1 flex justify-end">
              <div class="flex items-center">
                <input 
                  type="number" 
                  id="cell-padding"
                  step="0.05" 
                  min="0" 
                  max="1"
                  bind:value={cellPadding}
                  class="w-16 h-8 px-2 text-right border border-neutral-300 dark:border-neutral-700 rounded"
                />
                <span class="ml-2">in</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Color Section -->
    <div>
      <button 
        class={getSectionHeaderClass(openSections.color)}
        onclick={() => toggleSection('color')}
      >
        <div class="flex items-center">
          <Palette class="h-5 w-5 mr-2" />
          <span>Color</span>
        </div>
        <ChevronDown class={cn(
          "h-5 w-5 transition-transform",
          openSections.color ? "rotate-180" : ""
        )} />
      </button>
      
      {#if openSections.color}
        <div class="p-4 bg-neutral-50 dark:bg-neutral-900">
          <div class="flex flex-col mb-4">
            <label class="text-sm mb-1">Border color</label>
            <div class="flex items-center">
              <div 
                class="h-8 w-8 border border-neutral-300 dark:border-neutral-700 rounded mr-2"
                style="background-color: {tableConfig.borders.color};"
              ></div>
              <input 
                type="color" 
                value={tableConfig.borders.color}
                class="opacity-0 absolute"
                onchange={(e) => updateTableConfig({
                  borders: { ...tableConfig.borders, color: e.target.value }
                })}
              />
              <span class="text-xs uppercase">{tableConfig.borders.color}</span>
            </div>
          </div>
          
          <div class="flex flex-col">
            <label class="text-sm mb-1">Border width</label>
            <div class="flex items-center">
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.5"
                value={tableConfig.borders.width}
                class="flex-1 mr-2"
                onchange={(e) => updateTableConfig({
                  borders: { ...tableConfig.borders, width: parseFloat(e.target.value) }
                })}
              />
              <span class="w-10 text-right">{tableConfig.borders.width}pt</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>