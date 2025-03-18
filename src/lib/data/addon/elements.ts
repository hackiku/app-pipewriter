// src/lib/data/addon/elements.ts

// Define element types
export type ElementTheme = 'light' | 'dark';

export interface ElementDefinition {
	category: string;
	description: string;
	hasDarkVariant: boolean;
}

export interface Element {
	id: string;
	baseId: string;
	category: string;
	theme: ElementTheme;
	src: string;
	alt: string;
	description: string;
}

// Define elements database
const elementsDb: Record<string, ElementDefinition> = {
	// Containers
	'container-center': {
		category: 'containers',
		description: 'Centered container for content',
		hasDarkVariant: true
	},
	'background-empty': {
		category: 'containers',
		description: 'Full width empty container',
		hasDarkVariant: true
	},
	'background-color': {
		category: 'containers',
		description: 'Full width colored container',
		hasDarkVariant: true
	},

	// Content
	'hero': {
		category: 'content',
		description: 'Hero layout with heading and subtext',
		hasDarkVariant: true
	},
	'zz-left': {
		category: 'content',
		description: 'Text layout with left zigzag pattern',
		hasDarkVariant: true
	},
	'zz-right': {
		category: 'content',
		description: 'Text layout with right zigzag pattern',
		hasDarkVariant: true
	},

	// Blurbs
	'blurbs-3': {
		category: 'blurbs',
		description: '3 horizontal blurbs',
		hasDarkVariant: true
	},
	'blurbs-4': {
		category: 'blurbs',
		description: '4 horizontal blurbs',
		hasDarkVariant: true
	},
	'blurbs-vert-3': {
		category: 'blurbs',
		description: '3 vertical blurbs',
		hasDarkVariant: true
	},

	// Lists
	'list-1': {
		category: 'lists',
		description: 'Single column list',
		hasDarkVariant: true
	},
	'list-2': {
		category: 'lists',
		description: 'Two column list',
		hasDarkVariant: true
	},
	'list-3': {
		category: 'lists',
		description: '2x2 grid list layout',
		hasDarkVariant: true
	},

	// Buttons
	'button-primary-left': {
		category: 'buttons',
		description: 'Left-aligned full color button',
		hasDarkVariant: true
	},
	'button-secondary-left': {
		category: 'buttons',
		description: 'Left-aligned outline button',
		hasDarkVariant: true
	},
	'buttons-2-left': {
		category: 'buttons',
		description: 'Two buttons, left-aligned',
		hasDarkVariant: true
	},
	'button-primary-center': {
		category: 'buttons',
		description: 'Center-aligned full color button',
		hasDarkVariant: true
	},
	'button-secondary-center': {
		category: 'buttons',
		description: 'Center-aligned outline button',
		hasDarkVariant: true
	},
	'buttons-2-center': {
		category: 'buttons',
		description: 'Two buttons, center-aligned',
		hasDarkVariant: true
	},

	// Cards
	'cards-2': {
		category: 'cards',
		description: 'Two horizontal cards',
		hasDarkVariant: true
	},
	'cards-3': {
		category: 'cards',
		description: 'Three horizontal cards',
		hasDarkVariant: true
	},
	'cards-4': {
		category: 'cards',
		description: 'Four horizontal cards',
		hasDarkVariant: true
	},
	'cards-2x2': {
		category: 'cards',
		description: '2x2 grid of cards',
		hasDarkVariant: true
	},
	'cards-6': {
		category: 'cards',
		description: 'Six cards grid layout',
		hasDarkVariant: true
	},
	'pricing-2': {
		category: 'cards',
		description: 'Two pricing comparison cards',
		hasDarkVariant: true
	},

	// Special elements
	'styleguide': {
		category: 'special',
		description: 'Text style guidelines',
		hasDarkVariant: false
	}
};

// Element Manager class with Singleton pattern
class ElementManager {
	private static instance: ElementManager;
	private elementsCache = new Map<string, Element>();

	private constructor() {
		this.initializeCache();
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new ElementManager();
		}
		return this.instance;
	}

	private initializeCache() {
		// Populate cache with all elements including dark variants
		Object.entries(elementsDb).forEach(([id, props]) => {
			this.elementsCache.set(id, this.createElement(id, props, 'light'));

			if (props.hasDarkVariant) {
				const darkId = `${id}-dark`;
				this.elementsCache.set(darkId, this.createElement(id, props, 'dark'));
			}
		});
	}

	private createElement(id: string, definition: ElementDefinition, theme: ElementTheme): Element {
		const baseId = id.replace(/-dark$/, '');
		const elementId = theme === 'dark' ? `${baseId}-dark` : baseId;

		return {
			id: elementId,
			baseId,
			category: definition.category,
			theme,
			src: `elements/${elementId}.svg`,
			alt: baseId.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
			description: definition.description
		};
	}

	// Public methods
	getElement(id: string) {
		return this.elementsCache.get(id) || null;
	}

	getElementsByTheme(theme: ElementTheme) {
		return Array.from(this.elementsCache.values())
			.filter(element => element.theme === theme);
	}

	getElementsByCategory(theme: ElementTheme) {
		const elements = this.getElementsByTheme(theme);
		return elements.reduce((grouped, element) => {
			if (!grouped[element.category]) {
				grouped[element.category] = [];
			}
			grouped[element.category].push(element);
			return grouped;
		}, {} as Record<string, Element[]>);
	}

	getAllCategories() {
		const categories = new Set<string>();
		this.elementsCache.forEach(element => {
			categories.add(element.category);
		});
		return Array.from(categories);
	}

	isValidElement(id: string) {
		return this.elementsCache.has(id);
	}
}

// Create and export the element manager instance
export const elementManager = ElementManager.getInstance();

// Export convenience methods
export const getElement = elementManager.getElement.bind(elementManager);
export const getElementsByTheme = elementManager.getElementsByTheme.bind(elementManager);
export const getElementsByCategory = elementManager.getElementsByCategory.bind(elementManager);
export const getAllCategories = elementManager.getAllCategories.bind(elementManager);
export const isValidElement = elementManager.isValidElement.bind(elementManager);