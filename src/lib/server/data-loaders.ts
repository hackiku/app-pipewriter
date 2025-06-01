// src/lib/server/data-loaders.ts

import { adminFirestore } from '$lib/server/firebase-admin';
import type { ElementTheme } from '$lib/types/elements';

export interface ElementData {
	id: string;
	category: string;
	description: string;
	text?: Record<string, string>;
	metadata?: {
		tier?: 'free' | 'trial' | 'pro';
		supports?: {
			darkMode?: boolean;
			customText?: boolean;
			customColors?: boolean;
		};
		cols?: number;
		rows?: number;
		variant?: string;
	};
	svgPath: string;
	svgPathDark?: string;
}

export interface PromptData {
	id: string;
	category: string;
	title: string;
	description: string;
	content: string;
	metadata?: {
		tier?: 'free' | 'trial' | 'pro';
		tags?: string[];
		usage?: number;
	};
	isUserPrompt?: boolean;
}

export async function getFilteredElements(userTier: 'free' | 'trial' | 'pro'): Promise<Record<string, ElementData[]>> {
	try {
		const elementsRef = adminFirestore.collection('elements');
		const snapshot = await elementsRef.where('active', '==', true).get();

		const elements: ElementData[] = [];

		snapshot.docs.forEach(doc => {
			const element = doc.data();
			const elementTier = element.metadata?.tier || 'free';

			// Filter based on user tier
			if (canAccessElement(userTier, elementTier)) {
				elements.push({
					id: doc.id,
					category: element.category,
					description: element.description,
					text: element.text,
					metadata: element.metadata,
					svgPath: `/elements/${doc.id}.svg`,
					svgPathDark: element.metadata?.supports?.darkMode
						? `/elements/${doc.id}-dark.svg`
						: undefined
				});
			}
		});

		// Group by category and sort
		const grouped = groupElementsByCategory(elements);
		return grouped;

	} catch (error) {
		console.error('Error loading elements:', error);
		return {};
	}
}

export async function getFilteredPrompts(userTier: 'free' | 'trial' | 'pro', uid: string): Promise<Record<string, PromptData[]>> {
	try {
		// Load system prompts
		const systemPromptsRef = adminFirestore.collection('prompts');
		const systemSnapshot = await systemPromptsRef.where('active', '==', true).get();

		const systemPrompts: PromptData[] = [];
		systemSnapshot.docs.forEach(doc => {
			const prompt = doc.data();
			const promptTier = prompt.metadata?.tier || 'free';

			if (canAccessPrompt(userTier, promptTier)) {
				systemPrompts.push({
					id: doc.id,
					category: prompt.category,
					title: prompt.title,
					description: prompt.description,
					content: prompt.content,
					metadata: prompt.metadata,
					isUserPrompt: false
				});
			}
		});

		// Load user prompts (if any)
		const userPrompts: PromptData[] = [];
		try {
			const userPromptsRef = adminFirestore.collection('user_prompts');
			const userSnapshot = await userPromptsRef.where('uid', '==', uid).get();

			userSnapshot.docs.forEach(doc => {
				const prompt = doc.data();
				userPrompts.push({
					id: doc.id,
					category: prompt.category || 'custom',
					title: prompt.title,
					description: prompt.description || 'Custom prompt',
					content: prompt.content,
					isUserPrompt: true
				});
			});
		} catch (error) {
			console.log('No user prompts found or error loading them:', error);
		}

		// Combine and group
		const allPrompts = [...systemPrompts, ...userPrompts];
		const grouped = groupPromptsByCategory(allPrompts);
		return grouped;

	} catch (error) {
		console.error('Error loading prompts:', error);
		return {};
	}
}

function canAccessElement(userTier: string, elementTier: string): boolean {
	if (userTier === 'pro') return true;
	if (userTier === 'trial') return elementTier !== 'pro';
	return elementTier === 'free';
}

function canAccessPrompt(userTier: string, promptTier: string): boolean {
	if (userTier === 'pro') return true;
	if (userTier === 'trial') return promptTier !== 'pro';
	return promptTier === 'free';
}

function groupElementsByCategory(elements: ElementData[]): Record<string, ElementData[]> {
	const categoryOrder = ['containers', 'content', 'buttons', 'cards', 'blurbs', 'lists', 'special'];

	const grouped = elements.reduce((acc, element) => {
		if (!acc[element.category]) {
			acc[element.category] = [];
		}
		acc[element.category].push(element);
		return acc;
	}, {} as Record<string, ElementData[]>);

	// Sort categories and elements within categories
	const sorted: Record<string, ElementData[]> = {};

	categoryOrder.forEach(category => {
		if (grouped[category]) {
			sorted[category] = grouped[category].sort((a, b) => a.id.localeCompare(b.id));
		}
	});

	// Add any remaining categories
	Object.keys(grouped).forEach(category => {
		if (!sorted[category]) {
			sorted[category] = grouped[category].sort((a, b) => a.id.localeCompare(b.id));
		}
	});

	return sorted;
}

function groupPromptsByCategory(prompts: PromptData[]): Record<string, PromptData[]> {
	const categoryOrder = ['writing', 'code', 'design', 'marketing', 'technical', 'custom'];

	const grouped = prompts.reduce((acc, prompt) => {
		if (!acc[prompt.category]) {
			acc[prompt.category] = [];
		}
		acc[prompt.category].push(prompt);
		return acc;
	}, {} as Record<string, PromptData[]>);

	// Sort categories and prompts within categories
	const sorted: Record<string, PromptData[]> = {};

	categoryOrder.forEach(category => {
		if (grouped[category]) {
			sorted[category] = grouped[category].sort((a, b) => a.title.localeCompare(b.title));
		}
	});

	return sorted;
}

export function getSvgUrl(elementId: string, elementTheme: ElementTheme, appTheme: ElementTheme): string {
	const baseId = elementId.endsWith('-dark') ? elementId.replace(/-dark$/, '') : elementId;

	// Element theme creates CONTRAST with app theme
	const shouldUseDarkVariant = elementTheme !== appTheme;

	const svgPath = shouldUseDarkVariant ? `${baseId}-dark.svg` : `${baseId}.svg`;
	return `/elements/${svgPath}`;
}