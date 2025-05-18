// src/lib/services/google/text.ts
// Import this file in src/lib/services/google/index.ts
import { getGoogleService } from './client';
import type { StatusCallback } from './client';
import type { ApiResponse } from '$lib/data/addon/types';

/**
 * Apply a text style to the selected text
 */
export async function applyTextStyle(
	style: {
		headingType: string;
		fontSize?: number;
		fontFamily?: string;
		isBold?: boolean;
		isItalic?: boolean;
		color?: string;
	},
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('formatSelectedText', { format: style }, onStatus);
	} catch (error) {
		console.error('Error in applyTextStyle:', error);
		throw error;
	}
}

/**
 * Get the current format of the selected text
 */
export async function getSelectedTextFormat(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('getSelectedFormat', {}, onStatus);
	} catch (error) {
		console.error('Error in getSelectedTextFormat:', error);
		throw error;
	}
}

/**
 * Count words in the document or selection
 */
export async function countWords(
	options: {
		selection?: boolean;
	} = {},
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('countWords', {
			selection: options.selection || false
		}, onStatus);
	} catch (error) {
		console.error('Error in countWords:', error);
		throw error;
	}
}