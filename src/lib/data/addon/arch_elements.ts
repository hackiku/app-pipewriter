// src/lib/data/addon/elements.ts

// Define element types
// export type ElementTheme = 'light' | 'dark';

// export interface ElementDefinition {
// 	category: string;
// 	description: string;
// 	hasDarkVariant: boolean;
// }

// export interface Element {
// 	id: string;
// 	baseId: string;
// 	category: string;
// 	theme: ElementTheme;
// 	src: string;
// 	alt: string;
// 	description: string;
// }

// // Define elements database
// const elementsDb: Record<string, ElementDefinition> = {
// 	// Containers
// 	'container-center': {
// 		category: 'containers',
// 		description: 'Centered container for content',
// 		hasDarkVariant: true
// 	},
// 	'background-empty': {
// 		category: 'containers',
// 		description: 'Full width empty container',
// 		hasDarkVariant: true
// 	},
// 	'background-color': {
// 		category: 'containers',
// 		description: 'Full width colored container',
// 		hasDarkVariant: true
// 	},

// 	// Content
// 	'hero': {
// 		category: 'content',
// 		description: 'Hero layout with heading and subtext',
// 		hasDarkVariant: true
// 	},
// 	'zz-left': {
// 		category: 'content',
// 		description: 'Text layout with left zigzag pattern',
// 		hasDarkVariant: true
// 	},
// 	'zz-right': {
// 		category: 'content',
// 		description: 'Text layout with right zigzag pattern',
// 		hasDarkVariant: true
// 	},

// 	// Blurbs
// 	'blurbs-3': {
// 		category: 'blurbs',
// 		description: '3 horizontal blurbs',
// 		hasDarkVariant: true
// 	},
// 	'blurbs-4': {
// 		category: 'blurbs',
// 		description: '4 horizontal blurbs',
// 		hasDarkVariant: true
// 	},
// 	'blurbs-vertical-3': { // Changed from 'blurbs-vert-3' to match SVG files
// 		category: 'blurbs',
// 		description: '3 vertical blurbs',
// 		hasDarkVariant: true
// 	},

// 	// Lists
// 	'list-1': {
// 		category: 'lists',
// 		description: 'Single column list',
// 		hasDarkVariant: true
// 	},
// 	'list-2': {
// 		category: 'lists',
// 		description: 'Two column list',
// 		hasDarkVariant: true
// 	},
// 	'list-3': {
// 		category: 'lists',
// 		description: '2x2 grid list layout',
// 		hasDarkVariant: true
// 	},

// 	// Buttons - updated to match SVG files
// 	'button-primary-left': {
// 		category: 'buttons',
// 		description: 'Left-aligned full color button',
// 		hasDarkVariant: true
// 	},
// 	'button-secondary-left': {
// 		category: 'buttons',
// 		description: 'Left-aligned outline button',
// 		hasDarkVariant: true
// 	},
// 	'buttons-2-left': {
// 		category: 'buttons',
// 		description: 'Two buttons, left-aligned',
// 		hasDarkVariant: true
// 	},
// 	'button-primary-center': {
// 		category: 'buttons',
// 		description: 'Center-aligned full color button',
// 		hasDarkVariant: true
// 	},
// 	'button-secondary-center': {
// 		category: 'buttons',
// 		description: 'Center-aligned outline button',
// 		hasDarkVariant: true
// 	},
// 	'buttons-2-center': {
// 		category: 'buttons',
// 		description: 'Two buttons, center-aligned',
// 		hasDarkVariant: true
// 	},

// 	// Cards
// 	'cards-2': {
// 		category: 'cards',
// 		description: 'Two horizontal cards',
// 		hasDarkVariant: true
// 	},
// 	'cards-3': {
// 		category: 'cards',
// 		description: 'Three horizontal cards',
// 		hasDarkVariant: true
// 	},
// 	'cards-4': {
// 		category: 'cards',
// 		description: 'Four horizontal cards',
// 		hasDarkVariant: true
// 	},
// 	'cards-2x2': {
// 		category: 'cards',
// 		description: '2x2 grid of cards',
// 		hasDarkVariant: true
// 	},
// 	'cards-6': {
// 		category: 'cards',
// 		description: 'Six cards grid layout',
// 		hasDarkVariant: true
// 	},
// 	'pricing-2': {
// 		category: 'cards',
// 		description: 'Two pricing comparison cards',
// 		hasDarkVariant: true
// 	},

// 	// Special elements
// 	'styleguide': {
// 		category: 'special',
// 		description: 'Text style guidelines',
// 		hasDarkVariant: false
// 	}
// };

// // Element Manager class with Singleton pattern
// class ElementManager {
// 	private static instance: ElementManager;
// 	private elementsCache: Map<string, Element>;
// 	private initialized = false;

// 	constructor() {
// 		this.elementsCache = new Map<string, Element>();

// 		// Initialize the cache once during construction
// 		if (!this.initialized) {
// 			this.initializeCache();
// 			this.initialized = true;
// 		}
// 	}

// 	static getInstance() {
// 		if (!this.instance) {
// 			this.instance = new ElementManager();
// 		}
// 		return this.instance;
// 	}

// 	private initializeCache() {
// 		console.log("Initializing element cache...");

// 		// Populate cache with all elements including dark variants
// 		Object.entries(elementsDb).forEach(([id, props]) => {
// 			// Create light theme element
// 			const lightElement = this.createElement(id, props, 'light');
// 			this.elementsCache.set(id, lightElement);

// 			// Create dark theme element if it has a dark variant
// 			if (props.hasDarkVariant) {
// 				const darkId = `${id}-dark`;
// 				const darkElement = this.createElement(darkId, props, 'dark');
// 				this.elementsCache.set(darkId, darkElement);
// 			}
// 		});

// 		// Log summary for debugging
// 		console.log(`Element cache initialized with ${this.elementsCache.size} elements`);
// 		console.log(`Light elements: ${this.getElementsByTheme('light').length}`);
// 		console.log(`Dark elements: ${this.getElementsByTheme('dark').length}`);
// 	}

// 	private createElement(id: string, definition: ElementDefinition, theme: ElementTheme): Element {
// 		// Handle cases where id already includes -dark suffix
// 		const isDarkVariant = id.endsWith('-dark');
// 		const baseId = isDarkVariant ? id.replace(/-dark$/, '') : id;

// 		// Get SVG path, ensuring it starts with /
// 		const svgPath = `/elements/${id}.svg`;

// 		return {
// 			id: id,
// 			baseId,
// 			category: definition.category,
// 			theme,
// 			src: svgPath,
// 			alt: baseId.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
// 			description: definition.description
// 		};
// 	}

// 	// Debug method to help find issues
// 	debug() {
// 		const summary = {
// 			totalElements: this.elementsCache.size,
// 			byTheme: {
// 				light: this.getElementsByTheme('light').length,
// 				dark: this.getElementsByTheme('dark').length
// 			},
// 			categories: this.getAllCategories(),
// 			elementIds: Array.from(this.elementsCache.keys()),
// 			elementsByTheme: {
// 				light: this.getElementsByTheme('light').map(e => e.id),
// 				dark: this.getElementsByTheme('dark').map(e => e.id)
// 			},
// 			svgPaths: Array.from(this.elementsCache.values()).map(e => e.src)
// 		};

// 		console.log('Element Manager Debug:', summary);
// 		return summary;
// 	}

// 	// Public methods
// 	getElement(id: string) {
// 		return this.elementsCache.get(id) || null;
// 	}

// 	getElementsByTheme(theme: ElementTheme) {
// 		return Array.from(this.elementsCache.values())
// 			.filter(element => element.theme === theme);
// 	}

// 	getElementsByCategory(theme: ElementTheme) {
// 		const elements = this.getElementsByTheme(theme);
// 		const result = elements.reduce((grouped, element) => {
// 			if (!grouped[element.category]) {
// 				grouped[element.category] = [];
// 			}
// 			grouped[element.category].push(element);
// 			return grouped;
// 		}, {} as Record<string, Element[]>);

// 		console.log(`Found ${elements.length} elements in ${Object.keys(result).length} categories for theme '${theme}'`);
// 		return result;
// 	}

// 	getAllCategories() {
// 		const categories = new Set<string>();
// 		this.elementsCache.forEach(element => {
// 			categories.add(element.category);
// 		});
// 		return Array.from(categories);
// 	}

// 	isValidElement(id: string) {
// 		return this.elementsCache.has(id);
// 	}
// }

// // Create and export the element manager instance
// export const elementManager = ElementManager.getInstance();

// // Export convenience methods
// export const getElement = (id: string) => elementManager.getElement(id);
// export const getElementsByTheme = (theme: ElementTheme) => elementManager.getElementsByTheme(theme);
// export const getElementsByCategory = (theme: ElementTheme) => elementManager.getElementsByCategory(theme);
// export const getAllCategories = () => elementManager.getAllCategories();
// export const isValidElement = (id: string) => elementManager.isValidElement(id);

// // Debug output to help troubleshooting
// console.log(`Elements module loaded with ${getAllCategories().length} categories`);