// src/lib/data/addon/themes.ts

export type ThemeMode = 'light' | 'dark';

export interface Theme {
	id: string;
	color: string;
	label: string;
	mode: ThemeMode;
	textColor: string;
}

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