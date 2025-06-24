// src/lib/services/google/html.ts
import { getGoogleService } from './client';
import type { StatusCallback } from './client';
import type { ApiResponse } from '$lib/types/appsScript';

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

/**
 * Drop prompt content into document at cursor
 */
export async function dropPrompt(
	options: {
		promptContent: string;
		promptTitle?: string;
	},
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		if (!options.promptContent) {
			throw new Error('Prompt content is required');
		}

		return client.sendMessage('dropPrompt', {
			promptContent: options.promptContent,
			promptTitle: options.promptTitle
		}, onStatus);
	} catch (error) {
		console.error('Error in dropPrompt:', error);
		throw error;
	}
}