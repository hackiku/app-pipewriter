// src/lib/types/appsScript.ts - CONSOLIDATED GENERIC TYPES

// Google Apps Script function names (replaces deleted GasFunction)
export type GasFunction =
	| 'changeBg'
	| 'getCurrentColor'
	| 'getElement'
	| 'createElement'  // NEW: programmatic element creation
	| 'validateElement'  // NEW: validate element exists
	| 'getAvailableElements'  // NEW: get all available elements
	| 'dropHtml'
	| 'stripHtml'
	| 'textOps'
	| 'tableOps'
	| 'downloadHtmlFile'
	| 'dropPrompt';

// Status update types
export type StatusType = 'processing' | 'success' | 'error';

export interface StatusUpdate {
	type: StatusType;
	message: string;
	details?: string;
	executionTime?: number;
	error?: any;
	elementId?: string;
}

// Clean API response interface (used by all services)
export interface ApiResponse {
	success: boolean;
	action?: string;
	error?: string;
	executionTime?: number;
	data?: any;
	// Element creation specific fields (optional, only used by designer)
	tableIndex?: number;
	message?: string;
}