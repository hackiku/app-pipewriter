// $lib/iframe/stores/elementsThemeStore.ts

import { writable } from "svelte/store";

export type ElementsTheme = "light" | "dark";

const createElementsThemeStore = () => {
  const { subscribe, set, update } = writable<ElementsTheme>("light");

  return {
    subscribe,
    set,
    cycle: () =>
      update((current) => {
        const themes: ElementsTheme[] = ["light", "dark"];
        const currentIndex = themes.indexOf(current);
        return themes[(currentIndex + 1) % themes.length];
      }),
  };
};

export const elementsThemeStore = createElementsThemeStore();
