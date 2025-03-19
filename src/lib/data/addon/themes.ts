// src/lib/data/addon/themes.ts
import { ElementTheme, Theme } from './types';

// Define available themes
export const themes: Theme[] = [
	{
		id: 'light',
		color: '#FFFFFF',
		label: 'Light',
		mode: 'light',
		textColor: '#000000'
	},
	{
		id: 'dark',
		color: '#171717',
		label: 'Dark',
		mode: 'dark',
		textColor: '#FFFFFF'
	}
];

// Helper functions
export function getThemeById(id: string): Theme | undefined {
	return themes.find(theme => theme.id === id);
}

export function getNextTheme(currentId: string): Theme {
	const currentIndex = themes.findIndex(theme => theme.id === currentId);
	return themes[(currentIndex + 1) % themes.length];
}

// Default theme
export const defaultTheme = themes[0];

// Get opposite theme
export function getOppositeTheme(theme: ElementTheme): ElementTheme {
	return theme === 'light' ? 'dark' : 'light';
}

// Detect if should show dark theme based on element theme and app theme
export function shouldUseDarkTheme(elementTheme: ElementTheme, appTheme: ElementTheme): boolean {
	// If element is already in dark theme, it should always be shown as is
	if (elementTheme === 'dark') return true;

	// If element is in light theme but app is in dark mode, we should consider inverting
	if (elementTheme === 'light' && appTheme === 'dark') return true;

	return false;
}

// Get appropriate element theme based on current context
export function getContextualElementTheme(elementId: string, appTheme: ElementTheme): string {
	const baseId = elementId.endsWith('-dark') ? elementId.replace(/-dark$/, '') : elementId;
	const isDarkVariant = elementId.endsWith('-dark');

	// If element is explicitly dark, keep it dark
	if (isDarkVariant) return elementId;

	// If app is in dark mode and element is light, make it dark
	if (appTheme === 'dark' && !isDarkVariant) {
		return `${baseId}-dark`;
	}

	// Default case: keep the original ID
	return elementId;
}