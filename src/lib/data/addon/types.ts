// src/lib/data/addon/types.ts

// Core element types - explicitly export these first
export type ElementTheme = 'light' | 'dark';
export type ElementCategory = string; // Simplified to fix import issues

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
	text?: ElementContent;
	metadata?: ElementMetadata;
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

// UI Status types
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

// Theme definitions
export interface Theme {
	id: string;
	color: string;
	label: string;
	mode: ElementTheme;
	textColor: string;
} 