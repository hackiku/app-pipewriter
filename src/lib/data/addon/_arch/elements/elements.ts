// $lib/data/addon/elements/elements.ts
import { elements } from './data';

const BASE_URL = 'elements';

export type ElementsTheme = 'light' | 'dark';

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
	baseId: string; // Added to help with frontend SVG selection
	src: string;
	alt: string;
	description: string;
}

export class ElementsManager {
	private static instance: ElementsManager;
	private elementsCache: Map<string, ElementObject> = new Map();

	private constructor() {
		this.initializeCache();
	}

	static getInstance(): ElementsManager {
		if (!ElementsManager.instance) {
			ElementsManager.instance = new ElementsManager();
		}
		return ElementsManager.instance;
	}

	private initializeCache() {
		Object.entries(elements).forEach(([id, config]) => {
			// Base element
			this.elementsCache.set(id, this.createElementObject(id, config));

			// Dark variant if available
			if (config.hasDarkVariant) {
				const darkId = `${id}-dark`;
				this.elementsCache.set(darkId, this.createElementObject(darkId, config, 'dark'));
			}
		});
	}

	private createElementObject(id: string, config: any, theme: ElementsTheme = 'light'): ElementObject {
		const baseId = id.replace(/-dark$/, '');

		return {
			id,
			category: config.category,
			theme,
			baseId,
			src: `${BASE_URL}/${id}.svg`,
			alt: baseId.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
			description: config.description
		};
	}

	getElement(elementId: string): ElementObject | null {
		return this.elementsCache.get(elementId) || null;
	}

	getAllElements(theme: ElementsTheme): ElementObject[] {
		return Array.from(this.elementsCache.values())
			.filter(element => element.theme === theme);
	}

	getElementsByCategory(theme: ElementsTheme): Record<string, ElementObject[]> {
		return this.getAllElements(theme).reduce((acc, element) => {
			if (!acc[element.category]) {
				acc[element.category] = [];
			}
			acc[element.category].push(element);
			return acc;
		}, {} as Record<string, ElementObject[]>);
	}

	isValidElement(elementId: string): boolean {
		return this.elementsCache.has(elementId);
	}
}

// Convenience exports
export const elementsManager = ElementsManager.getInstance();
export const getElement = elementsManager.getElement.bind(elementsManager);
export const getAllElements = elementsManager.getAllElements.bind(elementsManager);
export const getElementsByCategory = elementsManager.getElementsByCategory.bind(elementsManager);
export const isValidElement = elementsManager.isValidElement.bind(elementsManager);

export type { ElementsTheme, ElementObject }