// src/lib/data/addon/utils.ts
import type { ElementTheme, Element, ElementDefinition, StatusUpdate } from './types';
import { elementsDb } from './elements';

// Helper functions for creating status updates
export function createProcessingStatus(message: string, details?: string): StatusUpdate {
	return {
		type: 'processing',
		message,
		details
	};
}

export function createSuccessStatus(message: string, executionTime?: number, details?: string): StatusUpdate {
	return {
		type: 'success',
		message,
		executionTime,
		details
	};
}

export function createErrorStatus(message: string, error?: any, details?: string): StatusUpdate {
	return {
		type: 'error',
		message,
		error,
		details
	};
}

// Element Manager class with Singleton pattern
class ElementManager {
	private static instance: ElementManager;
	private elementsCache: Map<string, Element>;
	private initialized = false;

	constructor() {
		this.elementsCache = new Map<string, Element>();

		// Initialize the cache once during construction
		if (!this.initialized) {
			this.initializeCache();
			this.initialized = true;
		}
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new ElementManager();
		}
		return this.instance;
	}

	private initializeCache() {
		console.log("Initializing element cache...");

		// Populate cache with all elements including dark variants
		Object.entries(elementsDb).forEach(([id, definition]) => {
			// Create light theme element
			const lightElement = this.createElement(definition.id, definition, 'light');
			this.elementsCache.set(definition.id, lightElement);

			// Create dark theme element if it supports dark mode
			if (definition.metadata?.supports?.darkMode) {
				const darkId = `${definition.id}-dark`;
				const darkElement = this.createElement(darkId, definition, 'dark');
				this.elementsCache.set(darkId, darkElement);
			}
		});

		// Log summary for debugging
		console.log(`Element cache initialized with ${this.elementsCache.size} elements`);
		console.log(`Light elements: ${this.getElementsByTheme('light').length}`);
		console.log(`Dark elements: ${this.getElementsByTheme('dark').length}`);
	}

	private createElement(id: string, definition: ElementDefinition, theme: ElementTheme): Element {
		// Handle cases where id already includes -dark suffix
		const isDarkVariant = id.endsWith('-dark');
		const baseId = isDarkVariant ? id.replace(/-dark$/, '') : id;

		// Get SVG path, ensuring it starts with /
		const svgPath = `/elements/${id}.svg`;

		return {
			id: id,
			baseId,
			category: definition.category,
			theme,
			src: svgPath,
			alt: baseId.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
			description: definition.description,
			text: definition.text,
			metadata: definition.metadata
		};
	}

	// Debug method to help find issues
	debug() {
		const summary = {
			totalElements: this.elementsCache.size,
			byTheme: {
				light: this.getElementsByTheme('light').length,
				dark: this.getElementsByTheme('dark').length
			},
			categories: this.getAllCategories(),
			elementIds: Array.from(this.elementsCache.keys()),
			elementsByTheme: {
				light: this.getElementsByTheme('light').map(e => e.id),
				dark: this.getElementsByTheme('dark').map(e => e.id)
			},
			svgPaths: Array.from(this.elementsCache.values()).map(e => e.src)
		};

		console.log('Element Manager Debug:', summary);
		return summary;
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
		const result = elements.reduce((grouped, element) => {
			if (!grouped[element.category]) {
				grouped[element.category] = [];
			}
			grouped[element.category].push(element);
			return grouped;
		}, {} as Record<string, Element[]>);

		console.log(`Found ${elements.length} elements in ${Object.keys(result).length} categories for theme '${theme}'`);
		return result;
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

	// New methods for future Firebase integration
	async fetchElementsFromFirebase() {
		// Placeholder for future implementation
		console.log("Firebase fetching not yet implemented");
		return false;
	}
}

// Create and export the element manager instance
export const elementManager = ElementManager.getInstance();

// Export convenience methods
export const getElement = (id: string) => elementManager.getElement(id);
export const getElementsByTheme = (theme: ElementTheme) => elementManager.getElementsByTheme(theme);
export const getElementsByCategory = (theme: ElementTheme) => elementManager.getElementsByCategory(theme);
export const getAllCategories = () => elementManager.getAllCategories();
export const isValidElement = (id: string) => elementManager.isValidElement(id);

// Helper functions
export function getSvgPathForElement(elementId: string, theme: ElementTheme): string {
	const baseId = elementId.endsWith('-dark') ? elementId.replace(/-dark$/, '') : elementId;
	return `/elements/${theme === 'dark' ? `${baseId}-dark` : baseId}.svg`;
}

// Debug output to help troubleshooting
console.log(`Elements module loaded with ${getAllCategories().length} categories`);