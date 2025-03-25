// src/lib/iframe/utils/promptProcessor.ts
import { AppsScriptClient } from './appsScript';
import type { Prompt, MasterPrompt } from '../stores/promptStore';

export interface ProcessingResult {
	success: boolean;
	executionTime?: number;
	error?: string;
	data?: any;
}

export class PromptProcessor {
	private client: AppsScriptClient;

	constructor() {
		this.client = AppsScriptClient.getInstance();
	}

	/**
	 * Process document with AI prompt
	 */
	async processWithPrompt(
		action: string,
		prompt: Prompt | null,
		masterPrompt: MasterPrompt | null,
		params: Record<string, any> = {}
	): Promise<ProcessingResult> {
		try {
			// Construct final prompt
			let finalPrompt = '';

			if (masterPrompt?.enabled) {
				finalPrompt += `${masterPrompt.content}\n\n`;
			}

			if (prompt) {
				finalPrompt += prompt.content;
			}

			// Send to Apps Script
			const response = await this.client.sendMessage(action, {
				...params,
				prompt: finalPrompt.trim()
			});

			return {
				success: response.success,
				executionTime: response.executionTime,
				data: response.data
			};

		} catch (error) {
			console.error('Prompt processing failed:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}

	/**
	 * Save prompt to local storage
	 */
	savePromptToStorage(prompt: Prompt): void {
		try {
			const savedPrompts = this.getSavedPrompts();
			const updatedPrompts = savedPrompts.filter(p => p.id !== prompt.id);
			updatedPrompts.push(prompt);

			localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
		} catch (error) {
			console.error('Failed to save prompt:', error);
		}
	}

	/**
	 * Get saved prompts from storage
	 */
	getSavedPrompts(): Prompt[] {
		try {
			const saved = localStorage.getItem('savedPrompts');
			return saved ? JSON.parse(saved) : [];
		} catch (error) {
			console.error('Failed to get saved prompts:', error);
			return [];
		}
	}

	/**
	 * Clear saved prompts
	 */
	clearSavedPrompts(): void {
		try {
			localStorage.removeItem('savedPrompts');
		} catch (error) {
			console.error('Failed to clear saved prompts:', error);
		}
	}
}

// Export singleton instance
export const promptProcessor = new PromptProcessor();