// src/lib/types/elements.ts - CLEANED UP

// Core element types - explicitly export these first
export type ElementTheme = 'light' | 'dark';
export type ElementCategory = string;

// NEW: Queue item with individual theme
export interface QueueItem {
	id: string;
	theme: ElementTheme;
}

// Element structure
export interface ElementContent {
	h1?: string;
	h2?: string;
	h3?: string;
	p?: string;
	list?: string[];
	cta?: string;
}

export interface ElementMetadata {
	cols?: number;
	rows?: number;
	variant?: string;
	tier?: 'free' | 'trial' | 'pro';
	supports?: {
		darkMode?: boolean;
		customColors?: boolean;
		customText?: boolean;
	}
}

export interface ElementDefinition {
	id: string;
	category: string;
	description: string;
	text?: Record<string, string>;
	metadata?: {
		tier?: 'free' | 'trial' | 'pro';
		supports?: {
			darkMode?: boolean;
			customText?: boolean;
			customColors?: boolean;
		};
		cols?: number;
		rows?: number;
		variant?: string;
	};
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface ElementWithAccess extends ElementDefinition {
	isLocked: boolean;
	svgPath: string;
	svgPathDark?: string;
}

// Element representation
export interface Element {
	id: string;
	baseId: string;
	category: string;
	theme: ElementTheme;
	src: string;
	alt: string;
	description: string;
	text?: ElementContent;
	metadata?: ElementMetadata;
}

// Element creation parameters (for designer service)
export interface ElementCreateParams {
	elementId: string;
	theme?: ElementTheme;
	customText?: Record<string, string>;
	customColors?: Record<string, string>;
	// Allow any additional custom parameters
	[key: string]: any;
}

// Element creation response (extends generic ApiResponse)
export interface ElementCreateResponse {
	success: boolean;
	action?: string;
	error?: string;
	executionTime?: number;
	data?: any;
	// Element-specific response fields
	tableIndex?: number;
	elementId?: string;
	message?: string;
}

// Theme definitions
export interface Theme {
	id: string;
	color: string;
	label: string;
	mode: ElementTheme;
	textColor: string;
}