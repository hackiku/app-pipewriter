// stores.ts
import { writable } from "svelte/store";

export type ThemeType = "light" | "gray" | "dark";

export const showInfo = writable(false);
export const chainMode = writable(false);
export const showLabels = writable(false);
export const activeTab = writable(false);
export const elementsTheme = writable<ThemeType>("light");
export const zenMode = writable(false);
export const currentColor = writable<string>("#EDEFF1");
export const isProcessing = writable(false);
