// $lib/iframe/features/dropper/elements/types.ts
export type ElementsTheme = 'white' | 'gray' | 'dark';

export interface ElementProps {
	id: string;
	category: string;
	description: string;
	hasDarkVariant: boolean;
}

export interface ElementObject {
	id: string;
	category: string;
	theme: ElementsTheme;
	src: string;
	alt: string;
	description: string;
}
