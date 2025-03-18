// $lib/iframe/stores/textStyles.ts

import { writable, derived } from 'svelte/store';

export interface TextStyle {
	id: string;
	headingType: 'NORMAL' | 'HEADING1' | 'HEADING2' | 'HEADING3' | 'HEADING4' | 'HEADING5' | 'HEADING6';
	tag: string;
	label: string;
	fontSize?: number;
	fontFamily?: string;
	textAttributes: {
		bold?: boolean;
		italic?: boolean;
		underline?: boolean;
		strikethrough?: boolean;
		foregroundColor?: string;
		backgroundColor?: string;
	};
	paragraphAttributes: {
		lineSpacing?: number;
		alignment?: string;
		direction?: string;
		marginLeft?: number;
		marginRight?: number;
		firstLineIndent?: number;
		spacingBefore?: number;
		spacingAfter?: number;
	};
	saved: boolean;
}

// Default styles with basic properties
const defaultStyles: TextStyle[] = [
	{
		id: 'normal',
		headingType: 'NORMAL',
		tag: 'p',
		label: 'Normal text',
		fontSize: 11,
		saved: false,
		textAttributes: {},
		paragraphAttributes: {}
	},
	{
		id: 'h1',
		headingType: 'HEADING1',
		tag: 'h1',
		label: 'Heading 1',
		fontSize: 24,
		saved: false,
		textAttributes: {},
		paragraphAttributes: {}
	},
	{
		id: 'h2',
		headingType: 'HEADING2',
		tag: 'h2',
		label: 'Heading 2',
		fontSize: 20,
		saved: false,
		textAttributes: {},
		paragraphAttributes: {}
	},
	{
		id: 'h3',
		headingType: 'HEADING3',
		tag: 'h3',
		label: 'Heading 3',
		fontSize: 16,
		saved: false,
		textAttributes: {},
		paragraphAttributes: {}
	},
	{
		id: 'h4',
		headingType: 'HEADING4',
		tag: 'h4',
		label: 'Heading 4',
		fontSize: 14,
		saved: false,
		textAttributes: {},
		paragraphAttributes: {}
	},
	{
		id: 'h5',
		headingType: 'HEADING5',
		tag: 'h5',
		label: 'Heading 5',
		fontSize: 12,
		saved: false,
		textAttributes: {},
		paragraphAttributes: {}
	},
	{
		id: 'h6',
		headingType: 'HEADING6',
		tag: 'h6',
		label: 'Heading 6',
		fontSize: 11,
		saved: false,
		textAttributes: {},
		paragraphAttributes: {}
	}
];

function createTextStylesStore() {
	const { subscribe, set, update } = writable<TextStyle[]>(defaultStyles);

	return {
		subscribe,
		saveStyle: (style: TextStyle) =>
			update(styles => {
				const index = styles.findIndex(s => s.headingType === style.headingType);
				if (index >= 0) {
					styles[index] = { ...style, saved: true };
					return [...styles];
				}
				return styles;
			}),
		deleteStyle: (headingType: string) =>
			update(styles =>
				styles.map(style =>
					style.headingType === headingType
						? { ...style, saved: false, textAttributes: {}, paragraphAttributes: {} }
						: style
				)
			),
		deleteAll: () =>
			update(styles =>
				styles.map(style => ({
					...style,
					saved: false,
					textAttributes: {},
					paragraphAttributes: {}
				}))
			),
		reset: () => set(defaultStyles)
	};
}

export const textStyles = createTextStylesStore();

// Derived store for saved styles count
export const savedStylesCount = derived(
	textStyles,
	$styles => $styles.filter(s => s.saved).length
);

// Store for currently selected style
export const selectedStyle = writable<TextStyle | null>(null);