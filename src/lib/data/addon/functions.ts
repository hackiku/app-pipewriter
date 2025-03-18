// src/lib/data/addon/functions.ts

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
	}
};

// Export types for function parameters
export type GasFunction = keyof typeof gasFunctions;