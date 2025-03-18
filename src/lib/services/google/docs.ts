// src/lib/services/google/docs.ts
import { GoogleAppsService } from './client';
import type { StatusCallback } from './client';
import type { ApiResponse } from '$lib/data/addon/status';
import type { ElementTheme } from '$lib/data/addon/elements';

/**
 * Insert an element at the cursor position
 */
export async function insertElement(
	elementId: string,
	theme: ElementTheme = 'light',
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	const client = GoogleAppsService.getInstance();
	return client.sendMessage('getElement', { elementId, theme }, onStatus);
}

/**
 * Change document background color
 */
export async function changeBackground(
	color: string,
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	const client = GoogleAppsService.getInstance();
	return client.sendMessage('changeBg', { color }, onStatus);
}

/**
 * Get current document background color
 */
export async function getCurrentColor(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	const client = GoogleAppsService.getInstance();
	return client.sendMessage('getCurrentColor', {}, onStatus);
}

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
	const client = GoogleAppsService.getInstance();
	return client.sendMessage('dropHtml', {
		position: options.position || 'end',
		copyToClipboard: options.copyToClipboard || false,
		prompt: options.prompt
	}, onStatus);
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
	const client = GoogleAppsService.getInstance();
	return client.sendMessage('stripHtml', {
		all: options.all || false,
		copyToClipboard: options.copyToClipboard || false
	}, onStatus);
}