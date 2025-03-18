// $lib/iframe/stores/themeStore.ts

import { writable } from "svelte/store";

export type ThemeType = "white" | "gray" | "dark";

const createThemeStore = () => {
  const { subscribe, set, update } = writable<ThemeType>("white");

  return {
    subscribe,
    set,
    cycle: () =>
      update((current) => {
        const themes: ThemeType[] = ["white", "gray", "dark"];
        const currentIndex = themes.indexOf(current);
        return themes[(currentIndex + 1) % themes.length];
      }),
  };
};

export const themeStore = createThemeStore();
