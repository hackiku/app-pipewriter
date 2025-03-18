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
	'container-center': {
		category: 'containers',
		description: 'Centered container for content',
		hasDarkVariant: true
	},
	// Add all other elements here...
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
}

// Create and export the element manager instance and convenience methods
export const elementManager = ElementManager.getInstance();