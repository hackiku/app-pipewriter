// src/lib/features/addon/features/table/data.svelte.ts
// Table configuration data store using SvelteKit 5 runes

// Types for table configuration
export interface TableAlignment {
	tableAlignment: "left" | "center" | "right";
	cellVerticalAlignment: "top" | "middle" | "bottom";
}

export interface TableDimensions {
	columns: number;
	rows: number;
	columnWidth: number;
	rowHeight: number;
}

export interface TableBorders {
	width: number;
	color: string;
	style: "solid" | "dotted" | "dashed";
}

export interface TableConfig {
	alignment: TableAlignment;
	dimensions: TableDimensions;
	borders: TableBorders;
}

// Default table configuration matching common Google Docs defaults
let tableConfig = $state<TableConfig>({
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
});

// Predefined zigzag layout configurations
export const zigzagLayouts = {
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

// Helper function to generate Apps Script compatible configuration
export function getAppsScriptConfig() {
	return {
		tableProps: {
			alignment: tableConfig.alignment.tableAlignment,
			verticalAlignment: tableConfig.alignment.cellVerticalAlignment,
			columns: tableConfig.dimensions.columns,
			rows: tableConfig.dimensions.rows,
			columnWidth: tableConfig.dimensions.columnWidth,
			rowHeight: tableConfig.dimensions.rowHeight,
			borderWidth: tableConfig.borders.width,
			borderColor: tableConfig.borders.color.replace('#', ''),
			borderStyle: tableConfig.borders.style
		}
	};
}

// Getters and setters
export function getTableConfig() {
	return tableConfig;
}

export function updateTableConfig(newConfig: Partial<TableConfig>) {
	if (newConfig.alignment) {
		tableConfig.alignment = {
			...tableConfig.alignment,
			...newConfig.alignment
		};
	}

	if (newConfig.dimensions) {
		tableConfig.dimensions = {
			...tableConfig.dimensions,
			...newConfig.dimensions
		};
	}

	if (newConfig.borders) {
		tableConfig.borders = {
			...tableConfig.borders,
			...newConfig.borders
		};
	}
}

// Table helper functions
export function getTableAlignmentClass(align: string) {
	switch (align) {
		case "left": return "justify-start";
		case "center": return "justify-center";
		case "right": return "justify-end";
		default: return "justify-center";
	}
}

export function getCellAlignmentClass(align: string) {
	switch (align) {
		case "top": return "items-start";
		case "middle": return "items-center";
		case "bottom": return "items-end";
		default: return "items-center";
	}
}