// src/lib/data/addon/status.ts

// Define status update types
export type StatusType = 'processing' | 'success' | 'error';

export interface StatusUpdate {
	type: StatusType;
	message: string;
	details?: string;
	executionTime?: number;
	error?: any;
}

// API response interface
export interface ApiResponse {
	success: boolean;
	action?: string;
	error?: string;
	executionTime?: number;
	data?: any;
}

// Helper functions for creating status updates
export function createProcessingStatus(message: string, details?: string): StatusUpdate {
	return {
		type: 'processing',
		message,
		details
	};
}

export function createSuccessStatus(message: string, executionTime?: number, details?: string): StatusUpdate {
	return {
		type: 'success',
		message,
		executionTime,
		details
	};
}

export function createErrorStatus(message: string, error?: any, details?: string): StatusUpdate {
	return {
		type: 'error',
		message,
		error,
		details
	};
}