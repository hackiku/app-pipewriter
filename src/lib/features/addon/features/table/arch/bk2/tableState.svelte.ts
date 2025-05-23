// src/lib/features/addon/features/table/tableState.ts

// Table state definition
export interface TableConfig {
	alignment: {
		tableAlignment: "left" | "center" | "right";
		cellVerticalAlignment: "top" | "middle" | "bottom";
	};
	dimensions: {
		columns: number;
		rows: number;
		columnWidth: number;
		rowHeight: number;
	};
	borders: {
		width: number;
		color: string;
		style: "solid" | "dotted" | "dashed";
	};
}

// Default table configuration
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

// Helper function to generate Apps Script compatible configuration
export function getAppsScriptConfig(config: TableConfig) {
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

// Helper CSS class functions
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