// src/lib/services/google/table.ts
import { getGoogleService } from './client';
import type { StatusCallback, GoogleAppsService } from './client';
import type { ApiResponse } from '$lib/types/elements';

// Helper to ensure client is available and reduce repetition
function getClientOrThrow(): GoogleAppsService {
	const client = getGoogleService();
	if (!client) {
		throw new Error('Google Apps Service is not available');
	}
	return client;
}

/**
 * Apply cell content vertical alignment.
 * @param alignment - 'top', 'middle', or 'bottom'.
 * @param scope - 'cell' or 'table'.
 * @param onStatus - Optional callback for status updates.
 * @returns Promise<ApiResponse>
 */
export async function setCellAlignment(
	alignment: 'top' | 'middle' | 'bottom',
	scope: 'cell' | 'table',
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getClientOrThrow();
		return client.sendMessage(
			'tableOps', // This matches the key in js.html actionMap
			{
				// This is the payload for tableOps in appHandler.js,
				// which then becomes the params for formatting/table.js#tableOps
				action: 'setCellAlignment', // Specific action for the tableOps router in GAS
				scope,
				alignment
			},
			onStatus
		);
	} catch (error) {
		console.error('Error in setCellAlignment (client):', error);
		// Optionally, return a structured error response if needed by consuming code
		// For now, rethrowing to be caught by a higher-level handler.
		throw error;
	}
}

/**
 * Apply cell padding.
 * @param padding - Padding value in points.
 * @param scope - 'cell' or 'table'.
 * @param onStatus - Optional callback for status updates.
 * @returns Promise<ApiResponse>
 */
export async function setCellPadding(
	padding: number,
	scope: 'cell' | 'table',
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getClientOrThrow();
		return client.sendMessage(
			'tableOps',
			{
				action: 'setCellPadding',
				scope,
				padding
			},
			onStatus
		);
	} catch (error) {
		console.error('Error in setCellPadding (client):', error);
		throw error;
	}
}

/**
 * Apply table borders (table-wide only).
 * @param borderWidth - Border width in points. Use 0 to remove borders.
 * @param borderColor - Optional border color hex string (e.g., '#000000'). Defaults to black if width > 0.
 * @param onStatus - Optional callback for status updates.
 * @returns Promise<ApiResponse>
 */
export async function setTableBorders(
	borderWidth: number,
	borderColor?: string, // Optional, server-side defaults to black if not provided and width > 0
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getClientOrThrow();
		const payload: {
			action: string;
			scope: 'table'; // Borders are always table scope
			borderWidth: number;
			borderColor?: string;
		} = {
			action: 'setBorders',
			scope: 'table', // As per your GAS logic, borders are table-wide
			borderWidth
		};
		if (borderColor) {
			payload.borderColor = borderColor;
		}
		return client.sendMessage('tableOps', payload, onStatus);
	} catch (error) {
		console.error('Error in setTableBorders (client):', error);
		throw error;
	}
}

/**
 * Apply cell background color.
 * @param backgroundColor - Background color hex string (e.g., '#FFFFFF') or null/empty to clear.
 * @param scope - 'cell' or 'table'.
 * @param onStatus - Optional callback for status updates.
 * @returns Promise<ApiResponse>
 */
export async function setCellBackground(
	backgroundColor: string, // Can be a color string, or potentially an empty string/null to clear
	scope: 'cell' | 'table',
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getClientOrThrow();
		return client.sendMessage(
			'tableOps',
			{
				action: 'setCellBackground',
				scope,
				backgroundColor
			},
			onStatus
		);
	} catch (error) {
		console.error('Error in setCellBackground (client):', error);
		throw error;
	}
}

/**
 * Select the entire table containing the cursor or the currently selected table.
 * @param onStatus - Optional callback for status updates.
 * @returns Promise<ApiResponse>
 */
export async function selectWholeTable(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getClientOrThrow();
		return client.sendMessage(
			'tableOps',
			{
				action: 'selectWholeTable'
				// No other params like scope needed for this specific action on server-side
			},
			onStatus
		);
	} catch (error) {
		console.error('Error in selectWholeTable (client):', error);
		throw error;
	}
}