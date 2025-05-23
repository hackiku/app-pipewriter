// src/lib/services/google/table.ts
import { getGoogleService } from './client';
import type { StatusCallback } from './client';
import type { ApiResponse } from '$lib/data/addon/types';

/**
 * Apply table horizontal alignment (table position in document)
 */
export async function setTableAlignment(
	alignment: 'left' | 'center' | 'right',
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('tableOps', {
			action: 'tableAlignHorizontal',
			payload: { alignment }
		}, onStatus);
	} catch (error) {
		console.error('Error in setTableAlignment:', error);
		throw error;
	}
}

/**
 * Apply cell vertical alignment (content position within cells)
 */
export async function setCellAlignment(
	alignment: 'top' | 'middle' | 'bottom',
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('tableOps', {
			action: 'tableAlignVertical',
			payload: { alignment }
		}, onStatus);
	} catch (error) {
		console.error('Error in setCellAlignment:', error);
		throw error;
	}
}

/**
 * Apply table size properties
 */
export async function setTableProperties(
	properties: {
		columns?: number;
		rows?: number;
		columnWidth?: number;
		rowHeight?: number;
		cellPadding?: number;
	},
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('tableOps', {
			action: 'tableSetProperties',
			payload: properties
		}, onStatus);
	} catch (error) {
		console.error('Error in setTableProperties:', error);
		throw error;
	}
}

/**
 * Get current table properties
 */
export async function getTableProperties(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('tableOps', {
			action: 'tableGetProperties',
			payload: {}
		}, onStatus);
	} catch (error) {
		console.error('Error in getTableProperties:', error);
		throw error;
	}
}