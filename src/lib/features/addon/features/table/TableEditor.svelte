<!-- src/lib/features/addon/features/table/TableEditor.svelte -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { DEFAULT_CONFIG } from "./tableState.svelte";
  import type { TableConfig } from "./tableState.svelte";
  import TablePreview from "./TablePreview.svelte";
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
  
  // Props with Svelte 5 runes
  const { config, onConfigUpdate } = $props<{
    config: TableConfig;
    onConfigUpdate: (updatedConfig: TableConfig) => void;
  }>();
  
  // State for accordion sections
  let openSections = $state({
    table: true,
    column: false,
    row: false,
    cell: false,
    color: false
  });
  
  // Form state
  let columnWidth = $state(config?.dimensions.columnWidth.toString() || DEFAULT_CONFIG.dimensions.columnWidth.toString());
  let rowHeight = $state(config?.dimensions.rowHeight.toString() || DEFAULT_CONFIG.dimensions.rowHeight.toString());
  let cellPadding = $state("0");
  let headerRows = $state("0");
  
  // Effect to update form state when props change
  $effect(() => {
    columnWidth = config.dimensions.columnWidth.toString();
    rowHeight = config.dimensions.rowHeight.toString();
  });
  
  // Toggle section
  function toggleSection(section: keyof typeof openSections) {
    openSections[section] = !openSections[section];
  }
  
  // Update functions
  function updateTableAlignment(alignment: "left" | "center" | "right") {
    onConfigUpdate({
      ...config,
      alignment: {
        ...config.alignment,
        tableAlignment: alignment
      }
    });
  }
  
  function updateCellAlignment(alignment: "top" | "middle" | "bottom") {
    onConfigUpdate({
      ...config,
      alignment: {
        ...config.alignment,
        cellVerticalAlignment: alignment
      }
    });
  }
  
  function handleColumnWidthUpdate() {
    const width = parseFloat(columnWidth);
    if (!isNaN(width) && width > 0) {
      onConfigUpdate({
        ...config,
        dimensions: {
          ...config.dimensions,
          columnWidth: width
        }
      });
    }
  }
  
  function handleRowHeightUpdate() {
    const height = parseFloat(rowHeight);
    if (!isNaN(height) && height > 0) {
      onConfigUpdate({
        ...config,
        dimensions: {
          ...config.dimensions,
          rowHeight: height
        }
      });
    }
  }
  
  function updateBorderColor(color: string) {
    onConfigUpdate({
      ...config,
      borders: {
        ...config.borders,
        color
      }
    });
  }
  
  function updateBorderWidth(width: number) {
    onConfigUpdate({
      ...config,
      borders: {
        ...config.borders,
        width
      }
    });
  }
  
  function updateColumns(value: number) {
    onConfigUpdate({
      ...config,
      dimensions: {
        ...config.dimensions,
        columns: value
      }
    });
  }
  
  function updateRows(value: number) {
    onConfigUpdate({
      ...config,
      dimensions: {
        ...config.dimensions,
        rows: value
      }
    });
  }
  
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
  <div class="border-b border-neutral-200 dark:border-neutral-800">
    <TablePreview config={config} />
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
              class={getAlignButtonClass(config.alignment.tableAlignment, "left")}
              onclick={() => updateTableAlignment("left")}
              title="Align left"
            >
              <AlignLeft class="h-5 w-5" />
            </button>
            <button 
              class={getAlignButtonClass(config.alignment.tableAlignment, "center")}
              onclick={() => updateTableAlignment("center")}
              title="Align center"
            >
              <AlignCenter class="h-5 w-5" />
            </button>
            <button 
              class={getAlignButtonClass(config.alignment.tableAlignment, "right")}
              onclick={() => updateTableAlignment("right")}
              title="Align right"
            >
              <AlignRight class="h-5 w-5" />
            </button>
          </div>
          
          <div class="mt-4 flex items-center gap-4">
            <div>
              <label for="table-columns" class="text-sm block mb-1">Columns</label>
              <input 
                id="table-columns"
                type="number" 
                min="1" 
                max="10"
                value={config.dimensions.columns}
                onchange={(e) => updateColumns(parseInt(e.target.value) || 3)}
                class="w-16 h-8 px-2 text-right border border-neutral-300 dark:border-neutral-700 rounded"
              />
            </div>
            
            <div>
              <label for="table-rows" class="text-sm block mb-1">Rows</label>
              <input 
                id="table-rows"
                type="number" 
                min="1" 
                max="20"
                value={config.dimensions.rows}
                onchange={(e) => updateRows(parseInt(e.target.value) || 2)}
                class="w-16 h-8 px-2 text-right border border-neutral-300 dark:border-neutral-700 rounded"
              />
            </div>
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
                  onblur={handleColumnWidthUpdate}
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
                  onblur={handleRowHeightUpdate}
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
                class={getAlignButtonClass(config.alignment.cellVerticalAlignment, "top")}
                onclick={() => updateCellAlignment("top")}
                title="Align top"
              >
                <AlignStartVertical class="h-5 w-5" />
              </button>
              <button 
                class={getAlignButtonClass(config.alignment.cellVerticalAlignment, "middle")}
                onclick={() => updateCellAlignment("middle")}
                title="Align middle"
              >
                <AlignCenterVertical class="h-5 w-5" />
              </button>
              <button 
                class={getAlignButtonClass(config.alignment.cellVerticalAlignment, "bottom")}
                onclick={() => updateCellAlignment("bottom")}
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
                style="background-color: {config.borders.color};"
              ></div>
              <input 
                type="color" 
                value={config.borders.color}
                class="opacity-0 absolute"
                onchange={(e) => updateBorderColor(e.target.value)}
              />
              <span class="text-xs uppercase">{config.borders.color}</span>
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
                value={config.borders.width}
                class="flex-1 mr-2"
                onchange={(e) => updateBorderWidth(parseFloat(e.target.value))}
              />
              <span class="w-10 text-right">{config.borders.width}pt</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>