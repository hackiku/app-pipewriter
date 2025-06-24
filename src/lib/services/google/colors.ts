// src/lib/services/google/colors.ts - CLEANED UP
import { getGoogleService } from './client';
import type { StatusCallback } from './client';
import type { ApiResponse } from '$lib/types/appsScript';

/**
 * Change document background color
 */
export async function changeBackground(
	color: string,
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('changeBg', { color }, onStatus);
	} catch (error) {
		console.error('Error in changeBackground:', error);
		throw error;
	}
}

/**
 * Get current document background color
 */
export async function getCurrentColor(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('getCurrentColor', {}, onStatus);
	} catch (error) {
		console.error('Error in getCurrentColor:', error);
		throw error;
	}
}