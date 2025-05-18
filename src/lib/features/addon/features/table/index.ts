// src/lib/features/addon/features/table/index.ts

// Re-export from data module
export {
	getTableConfig,
	updateTableConfig,
	getAppsScriptConfig,
	resetConfig
} from './data.svelte';

// Re-export from context module
export {
	handleHover,
	handleSelect,
	handleVerticalAlignmentSelect,
	isPositionHovered,
	isPositionSelected,
	columnWidths,
	getHorizontalAlignmentForColumn,
	syncSelectedPositionWithConfig,
	resetState,
	generateCellElements,
	generateCellContents,
	resetInteractiveState
} from './tableContext.svelte';

// Export types
export type {
	CellPosition,
	CellAlignment,
	HorizontalAlignment,
	VerticalAlignment
} from './tableContext.svelte';

// Component exports
export { default as TableGrid } from './TableGrid.svelte';
export { default as TableCell } from './TableCell.svelte';
export { default as Interactive } from './interactive/index.svelte';
export { default as InteractiveTable } from './interactive/InteractiveTable.svelte';