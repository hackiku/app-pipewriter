// src/lib/services/google/text.ts
import { getGoogleService } from './client';
import type { StatusCallback } from './client';
import type { ApiResponse } from '$lib/types/elements';

/**
 * Available heading types for text styling
 */
export type HeadingType =
	| 'NORMAL'
	| 'HEADING1'
	| 'HEADING2'
	| 'HEADING3'
	| 'HEADING4'
	| 'HEADING5'
	| 'HEADING6';

/**
 * Apply text style to current paragraph
 */
export async function applyTextStyle(
	headingType: HeadingType,
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('textOps', {
			action: 'applyStyle',
			headingType
		}, onStatus);
	} catch (error) {
		console.error('Error in applyTextStyle:', error);
		throw error;
	}
}

/**
 * Update all matching headings to match current paragraph style
 */
export async function updateAllMatchingHeadings(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('textOps', {
			action: 'updateAllMatching'
		}, onStatus);
	} catch (error) {
		console.error('Error in updateAllMatchingHeadings:', error);
		throw error;
	}
}

/**
 * Get current paragraph style information (for debugging/development)
 */
export async function getStyleInfo(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('textOps', {
			action: 'getStyleInfo'
		}, onStatus);
	} catch (error) {
		console.error('Error in getStyleInfo:', error);
		throw error;
	}
}

/**
 * Get all styles used in the document (batch operation)
 */
export async function getAllDocumentStyles(
	onStatus?: StatusCallback
): Promise<ApiResponse> {
	try {
		const client = getGoogleService();

		if (!client) {
			throw new Error('Google Apps Service is not available');
		}

		return client.sendMessage('textOps', {
			action: 'getAllStyles'
		}, onStatus);
	} catch (error) {
		console.error('Error in getAllDocumentStyles:', error);
		throw error;
	}
}

/**
 * Convenience functions for specific heading types
 */
export const applyNormalText = (onStatus?: StatusCallback) =>
	applyTextStyle('NORMAL', onStatus);

export const applyHeading1 = (onStatus?: StatusCallback) =>
	applyTextStyle('HEADING1', onStatus);

export const applyHeading2 = (onStatus?: StatusCallback) =>
	applyTextStyle('HEADING2', onStatus);

export const applyHeading3 = (onStatus?: StatusCallback) =>
	applyTextStyle('HEADING3', onStatus);

export const applyHeading4 = (onStatus?: StatusCallback) =>
	applyTextStyle('HEADING4', onStatus);

export const applyHeading5 = (onStatus?: StatusCallback) =>
	applyTextStyle('HEADING5', onStatus);

export const applyHeading6 = (onStatus?: StatusCallback) =>
	applyTextStyle('HEADING6', onStatus);