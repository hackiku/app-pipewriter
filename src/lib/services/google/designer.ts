// src/lib/services/google/designer.ts - CLEANED UP

import { getGoogleService } from './client';
import type { StatusCallback } from './client';
import type { ApiResponse } from '$lib/types/appsScript';
import type {
	ElementCreateParams,
	ElementCreateResponse,
	ElementTheme
} from '$lib/types/elements';

/**
 * Create an element using programmatic table generation
 */
export async function createElement(
	elementId: string,
	theme: ElementTheme = 'light',
	customParams?: Record<string, any>,
	onStatus?: StatusCallback
): Promise<ElementCreateResponse> {
	try {
		const client = getGoogleService();
		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		const params: ElementCreateParams = {
			elementId,
			theme,
			...customParams
		};

		const response = await client.sendMessage('createElement', params, onStatus);

		return {
			...response,
			elementId
		};
	} catch (error) {
		console.error('Error in createElement:', error);
		throw error;
	}
}

/**
 * Create multiple elements in sequence (for chain mode)
 */
export async function createElementBatch(
	elements: Array<{ elementId: string; theme: ElementTheme }>,
	onStatus?: StatusCallback
): Promise<ElementCreateResponse> {
	try {
		const client = getGoogleService();
		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		let totalExecutionTime = 0;
		let insertedCount = 0;

		onStatus?.({
			type: 'processing',
			message: `Creating ${elements.length} elements...`
		});

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];

			onStatus?.({
				type: 'processing',
				message: `Creating element ${i + 1} of ${elements.length}: ${element.elementId}`,
				details: `Theme: ${element.theme}`
			});

			const response = await createElement(
				element.elementId,
				element.theme,
				{},
				(status) => {
					// Forward individual element status
					onStatus?.(status);
				}
			);

			if (response.success) {
				insertedCount++;
				if (response.executionTime) {
					totalExecutionTime += response.executionTime;
				}
			} else {
				throw new Error(`Failed to create ${element.elementId}: ${response.error}`);
			}

			// Brief delay between elements to avoid overwhelming the system
			if (i < elements.length - 1) {
				await new Promise(resolve => setTimeout(resolve, 200));
			}
		}

		onStatus?.({
			type: 'success',
			message: `Successfully created ${insertedCount} elements`,
			executionTime: totalExecutionTime
		});

		return {
			success: true,
			data: { insertedCount, totalExecutionTime },
			executionTime: totalExecutionTime
		};

	} catch (error) {
		console.error('Error in createElementBatch:', error);
		onStatus?.({
			type: 'error',
			message: 'Failed to create element batch',
			error: error instanceof Error ? error.message : 'Unknown error'
		});
		throw error;
	}
}

/**
 * Get available element mappings (for validation)
 */
export async function getAvailableElements(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();
		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('getAvailableElements', {}, onStatus);
	} catch (error) {
		console.error('Error in getAvailableElements:', error);
		throw error;
	}
}

/**
 * Validate element exists before creation
 */
export async function validateElement(
	elementId: string,
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();
		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('validateElement', { elementId }, onStatus);
	} catch (error) {
		console.error('Error in validateElement:', error);
		throw error;
	}
}