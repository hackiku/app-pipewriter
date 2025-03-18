// src/lib/iframe/types/status.ts

export interface StatusUpdate {
	type: "processing" | "success" | "error";
	message: string;
	details?: string;
	error?: any;
	executionTime?: number;
}


export interface TabStatus extends StatusUpdate {
	tabId: string;
}


