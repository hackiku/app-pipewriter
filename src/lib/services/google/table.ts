// src/lib/services/google/table.ts
import { getGoogleService } from './client';
import type { StatusCallback } from './client';
// TODO separate response types
import type { ApiResponse } from '$lib/types/elements';

/**
 * Apply cell vertical alignment (content position within cells)
 */
export async function setCellAlignment(
	alignment: 'top' | 'middle' | 'bottom',
	scope: 'cell' | 'table',
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();
		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('tableOps', {
			action: 'setCellAlignment',
			scope,
			alignment
		}, onStatus);
	} catch (error) {
		console.error('Error in setCellAlignment:', error);
		throw error;
	}
}

/**
 * Apply cell padding
 */
export async function setCellPadding(
	padding: number,
	scope: 'cell' | 'table',
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();
		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('tableOps', {
			action: 'setCellPadding',
			scope,
			padding
		}, onStatus);
	} catch (error) {
		console.error('Error in setCellPadding:', error);
		throw error;
	}
}

/**
 * Apply table borders (table-wide only)
 */
export async function setTableBorders(
	borderWidth: number,
	borderColor?: string,
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();
		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('tableOps', {
			action: 'setBorders',
			scope: 'table',
			borderWidth,
			borderColor: borderColor || '#000000'
		}, onStatus);
	} catch (error) {
		console.error('Error in setTableBorders:', error);
		throw error;
	}
}

/**
 * Apply cell background color
 */
export async function setCellBackground(
	backgroundColor: string,
	scope: 'cell' | 'table',
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();
		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('tableOps', {
			action: 'setCellBackground',
			scope,
			backgroundColor
		}, onStatus);
	} catch (error) {
		console.error('Error in setCellBackground:', error);
		throw error;
	}
}

/**
 * Select whole table
 */
export async function selectWholeTable(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();
		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('tableOps', {
			action: 'selectWholeTable'
		}, onStatus);
	} catch (error) {
		console.error('Error in selectWholeTable:', error);
		throw error;
	}
}