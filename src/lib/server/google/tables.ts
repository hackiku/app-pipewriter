// src/lib/server/google/tables.ts
import { getGoogleService } from './client';
import type { StatusCallback } from './client';
import type { ApiResponse } from '$lib/data/addon/types';
import type { TableConfig } from '$lib/features/addon/features/table/data.svelte';

/**
 * Insert a table at the cursor position
 */
export async function insertTable(
	config: Partial<TableConfig>,
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('insertTable', {
			rows: config.dimensions?.rows || 3,
			cols: config.dimensions?.columns || 3,
			style: {
				alignment: config.alignment?.tableAlignment || 'center',
				verticalAlignment: config.alignment?.cellVerticalAlignment || 'middle',
				width: config.dimensions?.columnWidth || 2.5,
				height: config.dimensions?.rowHeight || 0.75,
				borderWidth: config.borders?.width || 1,
				borderColor: (config.borders?.color || '#000000').replace('#', ''),
				borderStyle: config.borders?.style || 'solid'
			}
		}, onStatus);
	} catch (error) {
		console.error('Error in insertTable:', error);
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

		return client.sendMessage('getTableProps', {}, onStatus);
	} catch (error) {
		console.error('Error in getTableProperties:', error);
		throw error;
	}
}

/**
 * Update table formatting
 */
export async function updateTableFormat(
	config: Partial<TableConfig>,
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('formatTable', {
			style: {
				alignment: config.alignment?.tableAlignment,
				verticalAlignment: config.alignment?.cellVerticalAlignment,
				width: config.dimensions?.columnWidth,
				height: config.dimensions?.rowHeight,
				borderWidth: config.borders?.width,
				borderColor: config.borders?.color?.replace('#', ''),
				borderStyle: config.borders?.style
			}
		}, onStatus);
	} catch (error) {
		console.error('Error in updateTableFormat:', error);
		throw error;
	}
}