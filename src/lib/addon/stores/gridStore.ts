// $lib/iframe/stores/gridStore.ts
import { writable, derived } from "svelte/store";

export type GridColumns = 1 | 2 | 3;

interface GridState {
  columns: GridColumns;
}

function createGridStore() {
  const { subscribe, update } = writable<GridState>({
    columns: 3,
  });

  return {
    subscribe,
    setColumns: (cols: GridColumns) =>
      update((state) => ({ ...state, columns: cols })),
    cycleColumns: () =>
      update((state) => {
        const nextColumns: Record<GridColumns, GridColumns> = {
          3: 2,
          2: 1,
          1: 3,
        };
        return { ...state, columns: nextColumns[state.columns] };
      }),
  };
}

export const gridStore = createGridStore();

// Derived store for grid layout classes
export const gridClass = derived(gridStore, ($store) => ({
  grid: `grid-cols-${$store.columns}`,
  gap: $store.columns === 1 ? "gap-5" : "gap-2",
  padding: $store.columns === 1 ? "px-8" : "px-2",
}));
