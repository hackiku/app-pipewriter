// src/lib/data/addon/functions.ts

// Define function parameter types
export interface FunctionDefinition {
	action: string;
	description: string;
	requiredParams: string[];
	optionalParams: string[];
}

// Define all available Google Apps Script functions
export const gasFunctions = {
	// Element operations
	getElement: {
		action: 'getElement',
		description: 'Insert an element at the cursor position',
		requiredParams: ['elementId'],
		optionalParams: ['theme']
	},

	// Background operations
	changeBg: {
		action: 'changeBg',
		description: 'Change document background color',
		requiredParams: ['color'],
		optionalParams: []
	},
	getCurrentColor: {
		action: 'getCurrentColor',
		description: 'Get current document background color',
		requiredParams: [],
		optionalParams: []
	},

	// HTML operations
	dropHtml: {
		action: 'dropHtml',
		description: 'Drop HTML into document',
		requiredParams: [],
		optionalParams: ['position', 'copyToClipboard', 'prompt']
	},
	stripHtml: {
		action: 'stripHtml',
		description: 'Strip HTML from document',
		requiredParams: [],
		optionalParams: ['all', 'copyToClipboard']
	},

	// Additional functions from js.html

	// Element operations - extended
	getElementTypes: {
		action: 'getElementTypes',
		description: 'Get all available element types',
		requiredParams: [],
		optionalParams: ['theme']
	},
	previewElement: {
		action: 'previewElement',
		description: 'Preview an element without inserting it',
		requiredParams: ['elementId'],
		optionalParams: ['theme']
	},

	// Document formatting
	getDocumentStyles: {
		action: 'getDocumentStyles',
		description: 'Get current document styles',
		requiredParams: [],
		optionalParams: []
	},
	applyDocumentStyles: {
		action: 'applyDocumentStyles',
		description: 'Apply styles to document',
		requiredParams: ['styles'],
		optionalParams: []
	},
	resetDocumentStyles: {
		action: 'resetDocumentStyles',
		description: 'Reset document styles to default',
		requiredParams: [],
		optionalParams: []
	},

	// Text operations
	formatSelectedText: {
		action: 'formatSelectedText',
		description: 'Format selected text',
		requiredParams: ['format'],
		optionalParams: ['options']
	},
	countWords: {
		action: 'countWords',
		description: 'Count words in selection or document',
		requiredParams: [],
		optionalParams: ['selection']
	},

	// Table operations
	insertTable: {
		action: 'insertTable',
		description: 'Insert a table at cursor position',
		requiredParams: ['rows', 'cols'],
		optionalParams: ['style']
	},
	formatTable: {
		action: 'formatTable',
		description: 'Format selected table',
		requiredParams: ['format'],
		optionalParams: []
	},

	// AI operations
	analyzeText: {
		action: 'analyzeText',
		description: 'Analyze text with AI',
		requiredParams: ['text'],
		optionalParams: ['options']
	},
	generateContent: {
		action: 'generateContent',
		description: 'Generate content with AI',
		requiredParams: ['prompt'],
		optionalParams: ['options']
	},

	// Template operations
	useTemplate: {
		action: 'useTemplate',
		description: 'Use a template',
		requiredParams: ['templateId'],
		optionalParams: ['customizations']
	},
	saveAsTemplate: {
		action: 'saveAsTemplate',
		description: 'Save current document as template',
		requiredParams: ['name'],
		optionalParams: ['description', 'category']
	},

	// Export operations
	exportDocument: {
		action: 'exportDocument',
		description: 'Export document to a different format',
		requiredParams: ['format'],
		optionalParams: ['options']
	},
	shareDocument: {
		action: 'shareDocument',
		description: 'Share document with others',
		requiredParams: ['emails'],
		optionalParams: ['permissions', 'message']
	}
};

// Export types for function parameters
export type GasFunction = keyof typeof gasFunctions;

// Export helper functions
export function validateParams(
	functionName: GasFunction,
	params: Record<string, any>
): { valid: boolean; missing?: string[] } {
	const functionDef = gasFunctions[functionName];
	if (!functionDef) {
		return { valid: false, missing: ['Invalid function name'] };
	}

	const missing = functionDef.requiredParams.filter(param => !(param in params));
	return {
		valid: missing.length === 0,
		missing: missing.length > 0 ? missing : undefined
	};
}

export function getRequiredParams(functionName: GasFunction): string[] {
	return gasFunctions[functionName]?.requiredParams || [];
}

export function getOptionalParams(functionName: GasFunction): string[] {
	return gasFunctions[functionName]?.optionalParams || [];
}

export function getFunctionDescription(functionName: GasFunction): string {
	return gasFunctions[functionName]?.description || 'No description available';
}