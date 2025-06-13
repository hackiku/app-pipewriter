// src/lib/services/google/html.ts
import { getGoogleService } from './client';
import type { StatusCallback } from './client';
import type { ApiResponse } from '$lib/types/elements';

/**
 * Insert HTML into document
 */
export async function insertHtml(
	options: {
		position?: 'start' | 'end';
		copyToClipboard?: boolean;
		prompt?: string;
	} = {},
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('dropHtml', {
			position: options.position || 'end',
			copyToClipboard: options.copyToClipboard || false,
			prompt: options.prompt
		}, onStatus);
	} catch (error) {
		console.error('Error in insertHtml:', error);
		throw error;
	}
}

/**
 * Strip HTML from document
 */
export async function stripHtml(
	options: {
		all?: boolean;
		copyToClipboard?: boolean;
	} = {},
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('stripHtml', {
			all: options.all || false,
			copyToClipboard: options.copyToClipboard || false
		}, onStatus);
	} catch (error) {
		console.error('Error in stripHtml:', error);
		throw error;
	}
}

/**
 * Download HTML as file
 */
export async function downloadHtmlFile(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('downloadHtmlFile', {}, onStatus);
	} catch (error) {
		console.error('Error in downloadHtmlFile:', error);
		throw error;
	}
}