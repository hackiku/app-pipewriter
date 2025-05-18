// src/lib/features/addon/features/table/tableContext.svelte.ts
import { updateTableConfig, getTableConfig } from './data.svelte';

// Re-export the function that's causing the error
export { updateTableConfig } from './data.svelte';

// Cell position interface
export interface CellPosition {
	row: number;
	col: number;
}

// Cell alignment options
export type HorizontalAlignment = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'middle' | 'bottom';

// Cell alignment type
export interface CellAlignment {
	horizontal: HorizontalAlignment;
	vertical: VerticalAlignment;
}

// Interactive state
let hoverPosition = $state<CellPosition | null>(null);
let selectedPosition = $state<CellPosition | null>(null);

// Layout configuration for 3-column zigzag 
export const columnWidths = [40, 40, 5]; // Percentages
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

// Generate cell content for interactive table
export function generateCellElements() {
	return Array(9).fill(0); // Creates a 3x3 grid of elements
}

// Generate cell contents for table mockup
export function generateCellContents(rows: number) {
	const grid = [];
	for (let i = 0; i < rows; i++) {
		const row = [];
		for (let j = 0; j < 3; j++) {
			row.push({
				alignment: {
					horizontal: columnAlignments[j],
					vertical: 'middle'
				}
			});
		}
		grid.push(row);
	}
	return grid;
}

// Reset state
export function resetState() {
	hoverPosition = null;
	selectedPosition = null;
}

// Reset interactive state for the table
export function resetInteractiveState() {
	hoverPosition = null;
	// Don't reset selection - we may want to keep that
}