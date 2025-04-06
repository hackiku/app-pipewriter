// src/lib/features/addon/features/table/tableContext.svelte.ts
import { updateTableConfig, getTableConfig } from './data.svelte';

// Cell position interface
export interface CellPosition {
	row: number;
	col: number;
}

// Cell alignment options
export type HorizontalAlignment = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'middle' | 'bottom';

// Interactive state
let hoverPosition = $state<CellPosition | null>(null);
let selectedPosition = $state<CellPosition | null>(null);

// Layout configuration for 3-column zigzag 
export const columnWidths = [40, 20, 40]; // Percentages
export const columnAlignments: HorizontalAlignment[] = ['left', 'center', 'right'];

// Handle hover over a cell
export function handleHover(position: CellPosition | null) {
	hoverPosition = position;
}

// Handle selecting a cell
export function handleSelect(position: CellPosition) {
	selectedPosition = position;

	// Update table alignment based on cell column
	const horizontalAlignment = getHorizontalAlignmentForColumn(position.col);
	const currentConfig = getTableConfig();

	updateTableConfig({
		alignment: {
			tableAlignment: horizontalAlignment,
			cellVerticalAlignment: currentConfig.alignment.cellVerticalAlignment
		}
	});
}

// Handle selecting a vertical alignment
export function handleVerticalAlignmentSelect(alignment: VerticalAlignment) {
	const currentConfig = getTableConfig();

	updateTableConfig({
		alignment: {
			tableAlignment: currentConfig.alignment.tableAlignment,
			cellVerticalAlignment: alignment
		}
	});
}

// Get horizontal alignment for a column
export function getHorizontalAlignmentForColumn(col: number): HorizontalAlignment {
	return columnAlignments[col] || 'left';
}

// Get the current hover position
export function getHoverPosition(): CellPosition | null {
	return hoverPosition;
}

// Get the current selected position
export function getSelectedPosition(): CellPosition | null {
	return selectedPosition;
}

// Check if a position is hovered
export function isPositionHovered(row: number, col: number): boolean {
	return hoverPosition !== null &&
		hoverPosition.row === row &&
		hoverPosition.col === col;
}

// Check if a position is selected
export function isPositionSelected(row: number, col: number): boolean {
	return selectedPosition !== null &&
		selectedPosition.row === row &&
		selectedPosition.col === col;
}

// Update selected position based on current table alignment
export function syncSelectedPositionWithConfig() {
	const config = getTableConfig();
	const alignment = config.alignment.tableAlignment;

	// Find column that matches the current alignment
	const colIndex = columnAlignments.findIndex(a => a === alignment);

	if (colIndex >= 0) {
		selectedPosition = {
			row: 0,
			col: colIndex
		};
	}
}

// Reset state
export function resetState() {
	hoverPosition = null;
	selectedPosition = null;
}