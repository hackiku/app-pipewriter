// $lib/iframe/stores/dropperStore.ts

import { writable, derived } from "svelte/store";

interface DropperState {
  chainMode: boolean;
  previewMode: boolean;
  selectedElements: string[];
  isProcessing: boolean;
}

function createDropperStore() {
  const { subscribe, set, update } = writable<DropperState>({
    chainMode: false,
    previewMode: false,
    selectedElements: [],
    isProcessing: false,
  });

  return {
    subscribe,
    toggleChainMode: () =>
      update((state) => ({
        ...state,
        chainMode: !state.chainMode,
        // Reset selections when turning off chain mode
        selectedElements: state.chainMode ? [] : state.selectedElements,
      })),
    togglePreviewMode: () =>
      update((state) => ({
        ...state,
        previewMode: !state.previewMode,
      })),
    addElement: (elementId: string) =>
      update((state) => ({
        ...state,
        selectedElements: [...state.selectedElements, elementId],
      })),
    removeElement: (elementId: string) =>
      update((state) => ({
        ...state,
        selectedElements: state.selectedElements.filter(
          (id) => id !== elementId,
        ),
      })),
    clearElements: () =>
      update((state) => ({
        ...state,
        selectedElements: [],
      })),
    setProcessing: (processing: boolean) =>
      update((state) => ({
        ...state,
        isProcessing: processing,
      })),
    reset: () =>
      set({
        chainMode: false,
        previewMode: false,
        selectedElements: [],
        isProcessing: false,
      }),
  };
}

export const dropperStore = createDropperStore();

// Derived stores for specific state slices
export const chainMode = derived(dropperStore, ($store) => $store.chainMode);

export const isChainActive = derived(
  dropperStore,
  ($store) => $store.chainMode && $store.selectedElements.length > 0,
);

export const selectedElements = derived(
  dropperStore,
  ($store) => $store.selectedElements,
);

// Helper derived store for UI states
export const dropperStatus = derived(dropperStore, ($store) => ({
  isActive: $store.chainMode,
  hasElements: $store.selectedElements.length > 0,
  isProcessing: $store.isProcessing,
}));
