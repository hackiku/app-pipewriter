// src/lib/features/addon/features/table/data.ts
// Table types and static data for Apps Script integration

// Types for table configuration
export interface TableAlignment {
	tableAlignment: "left" | "center" | "right";
	cellVerticalAlignment: "top" | "middle" | "bottom";
}

export interface TableDimensions {
	columns: number;
	rows: number;
	columnWidth: number; // in inches
	rowHeight: number; // in inches
}

export interface TableBorders {
	width: number; // in points
	color: string; // hex color
	style: "solid" | "dotted" | "dashed";
}

export interface TableConfig {
	alignment: TableAlignment;
	dimensions: TableDimensions;
	borders: TableBorders;
}

// Default table configuration to match Google Docs defaults
export const DEFAULT_CONFIG: TableConfig = {
	alignment: {
		tableAlignment: "center",
		cellVerticalAlignment: "middle"
	},
	dimensions: {
		columns: 3,
		rows: 2,
		columnWidth: 2.5,
		rowHeight: 0.75
	},
	borders: {
		width: 1,
		color: "#000000",
		style: "solid"
	}
};

// Predefined zigzag layout configurations
export const ZIGZAG_LAYOUTS = {
	threeColumn: [
		{ width: 40, label: "Left", contentAlign: "left" },
		{ width: 20, label: "Center", contentAlign: "center" },
		{ width: 40, label: "Right", contentAlign: "right" }
	],
	twoColumn: [
		{ width: 33, label: "First", contentAlign: "left" },
		{ width: 67, label: "Second", contentAlign: "left" }
	]
};

// Layout configuration for 3-column zigzag 
export const COLUMN_WIDTHS = [40, 20, 40]; // Percentages
export const COLUMN_ALIGNMENTS = ['left', 'center', 'right'];

// Helper function to format config for Apps Script
export function formatAppsScriptConfig(config: TableConfig) {
	return {
		tableProps: {
			alignment: config.alignment.tableAlignment,
			verticalAlignment: config.alignment.cellVerticalAlignment,
			columns: config.dimensions.columns,
			rows: config.dimensions.rows,
			columnWidth: config.dimensions.columnWidth,
			rowHeight: config.dimensions.rowHeight,
			borderWidth: config.borders.width,
			borderColor: config.borders.color.replace('#', ''),
			borderStyle: config.borders.style
		}
	};
}

// Helper functions for CSS classes
export function getTableAlignmentClass(align: string): string {
	switch (align) {
		case "left": return "justify-start";
		case "center": return "justify-center";
		case "right": return "justify-end";
		default: return "justify-center";
	}
}

export function getCellAlignmentClass(align: string): string {
	switch (align) {
		case "top": return "items-start";
		case "middle": return "items-center";
		case "bottom": return "items-end";
		default: return "items-center";
	}
}