// $lib/iframe/elements.ts

// TODO fetch damn svgs
const baseUrlSvg = 'elements';

// Define the type for element properties
export interface ElementProps {
	category: string;
	theme?: string;
	description?: string;
}

// Define the type for an element object
export interface ElementObject {
	id: string;
	category: string;
	theme: string;
	src: string;
	alt: string;
	description: string;
}

function createElementObject(id: string, { category, theme = '', description = '' }: ElementProps): ElementObject {
	return {
		id,
		category,
		theme,
		src: `${baseUrlSvg}/${id}${theme === '' ? '-dark' : ''}.svg`,
		alt: id.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()), // Capitalize the first letter
		description,
	};
}

const elementsDb: Record<string, ElementProps> = {
	'container-center': { category: 'containers', theme: 'light', description: 'Empty centered container in light theme' },
	'background-empty': { category: 'containers', theme: 'light', description: 'Empty fullwidth background in light theme' },
	// 'background-light': { category: 'containers', theme: 'light', description: 'Light gray fullwidth background' },
	// 'container-center-gray': { category: 'containers', theme: 'gray', description: 'Empty centered container in gray theme' },
	// 'container-center-dark': { category: 'containers', theme: 'dark', description: 'Empty centered container in dark theme' },
	// 'background-empty-gray': { category: 'containers', theme: 'gray', description: 'Empty fullwidth background in gray theme' },
	// 'background-empty-dark': { category: 'containers', theme: 'dark', description: 'Empty fullwidth background in dark theme' },
	// 'background-light-gray': { category: 'containers', theme: 'gray', description: 'Light gray background in gray theme' },
	'background-light-dark': { category: 'containers', theme: 'dark', description: 'Dark background in dark theme' },
	'hero': { category: 'content', theme: 'light', description: 'Hero in light theme' },
	'hero-dark': { category: 'content', theme: 'dark', description: 'Hero in dark theme' },
	'zz-left': { category: 'content', theme: 'light', description: 'Zigzag text left in light theme' },
	'zz-right': { category: 'content', theme: 'light', description: 'Zigzag text right in light theme' },
	'zz-left-dark': { category: 'content', theme: 'dark', description: 'Zigzag text left in dark theme' },
	'zz-right-dark': { category: 'content', theme: 'dark', description: 'Zigzag text right in dark theme' },
	'blurbs-3': { category: 'blurbs', theme: 'light', description: '3 horizontal blurbs in light theme' },
	'blurbs-4': { category: 'blurbs', theme: 'light', description: '4 horizontal blurbs in light theme' },
	'blurbs-vert-3': { category: 'blurbs', theme: 'light', description: '3 vertical blurbs in light theme' },
	'blurbs-3-dark': { category: 'blurbs', theme: 'dark', description: '3 horizontal blurbs in dark theme' },
	'blurbs-vert-3-dark': { category: 'blurbs', theme: 'dark', description: '3 vertical blurbs in dark theme' },
	'list-1': { category: 'lists', theme: 'light', description: 'List single in light theme' },
	'list-2': { category: 'lists', theme: 'light', description: 'List 2 in light theme' },
	'list-3': { category: 'lists', theme: 'light', description: 'List 2x2 in light theme' },
	'list-1-dark': { category: 'lists', theme: 'dark', description: 'List single in dark theme' },
	'list-2-dark': { category: 'lists', theme: 'dark', description: 'List 2 in dark theme' },
	'list-3-dark': { category: 'lists', theme: 'dark', description: 'List 2x2 in dark theme' },
	'button-left': { category: 'buttons', theme: 'light', description: 'Button left in light theme' },
	'button-center': { category: 'buttons', theme: 'light', description: 'Button center in light theme' },
	'button-right': { category: 'buttons', theme: 'light', description: 'Button right in light theme' },
	'button-2-left': { category: 'buttons', theme: 'light', description: 'Button 2 left in light theme' },
	'button-2-center': { category: 'buttons', theme: 'light', description: 'Button 2 center in light theme' },
	'button-2-right': { category: 'buttons', theme: 'light', description: 'Button 2 right in light theme' },
	'button-left-dark': { category: 'buttons', theme: 'dark', description: 'Button left in dark theme' },
	'button-center-dark': { category: 'buttons', theme: 'dark', description: 'Button center in dark theme' },
	'button-right-dark': { category: 'buttons', theme: 'dark', description: 'Button right in dark theme' },
	'button-2-left-dark': { category: 'buttons', theme: 'dark', description: 'Button 2 left in dark theme' },
	'button-2-center-dark': { category: 'buttons', theme: 'dark', description: 'Button 2 center in dark theme' },
	'button-2-right-dark': { category: 'buttons', theme: 'dark', description: 'Button 2 right in dark theme' },
	// cards
	'cards-2-left': { category: 'cards', theme: 'light', description: 'Cards 2 left in light theme' },
	'cards-2-center': { category: 'cards', theme: 'light', description: 'Cards 2 center in light theme' },
	'cards-3': { category: 'cards', theme: 'light', description: 'Cards 3 in light theme' },
	'cards-2x2': { category: 'cards', theme: 'light', description: 'Cards 2x2 in light theme' },
	'pricing-cards': { category: 'cards', theme: 'light', description: 'Pricing cards in light theme' },
	'cards-6': { category: 'cards', theme: 'light', description: 'Cards 6 in light theme' },
	'cards-2-left-dark': { category: 'cards', theme: 'dark', description: 'Cards 2 left in dark theme' },
	'cards-2-center-dark': { category: 'cards', theme: 'dark', description: 'Cards 2 center in dark theme' },
	'cards-3-dark': { category: 'cards', theme: 'dark', description: 'Cards 3 in dark theme' },
	'cards-2x2-dark': { category: 'cards', theme: 'dark', description: 'Cards 2x2 in dark theme' },
	'pricing-cards-dark': { category: 'cards', theme: 'dark', description: 'Pricing cards in dark theme' },
	'cards-6-dark': { category: 'cards', theme: 'dark', description: 'Cards 6 in dark theme' },
	// styleguide
	'styleguide': { category: 'cards', theme: 'light', description: 'Editable heading styles' },
};

export const elements: Record<string, ElementObject> = Object.entries(elementsDb).reduce((acc, [id, props]) => {
	acc[id] = createElementObject(id, props);
	return acc;
}, {} as Record<string, ElementObject>);

export function groupElementsByCategory(): Record<string, ElementObject[]> {
	return Object.values(elements).reduce((acc, element) => {
		const { category } = element;
		if (!acc[category]) acc[category] = [];
		acc[category].push(element);
		return acc;
	}, {} as Record<string, ElementObject[]>);
}

export function getElement(id: string): ElementObject | null {
	return elements[id] || null;
}

// Export types and functions
export type { ElementProps, ElementObject };
export { createElementObject };