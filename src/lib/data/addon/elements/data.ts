// $lib/data/addon/elements/data.ts

export const elements = {
	// Containers ------------------------------------
	'container-center': {
		category: 'containers',
		description: 'Centered container for content',
		hasDarkVariant: true
	},
	'background-empty': {
		category: 'containers',
		description: 'Full width empty container',
		hasDarkVariant: true
	},
	'background-color': {
		category: 'containers',
		description: 'Full width empty container',
		hasDarkVariant: true
	},
	// Content ------------------------------------
	'hero': {
		category: 'content',
		description: 'Hero layout with heading and subtext',
		hasDarkVariant: true
	},
	'zz-left': {
		category: 'content',
		description: 'Text layout with left zigzag pattern',
		hasDarkVariant: true
	},
	'zz-right': {
		category: 'content',
		description: 'Text layout with right zigzag pattern',
		hasDarkVariant: true
	},
	// blurbs
	'blurbs-3': {
		category: 'blurbs',
		description: '3 horizontal blurbs',
		hasDarkVariant: true
	},
	'blurbs-4': {
		category: 'blurbs',
		description: '4 horizontal blurbs',
		hasDarkVariant: true
	},
	'blurbs-vertical-3': {
		category: 'blurbs',
		description: '4 vertical blurbs',
		hasDarkVariant: true
	},

	// Lists ------------------------------------
	'list-1': {
		category: 'lists',
		description: 'Single column list',
		hasDarkVariant: true
	},
	'list-2': {
		category: 'lists',
		description: 'Two column list',
		hasDarkVariant: true
	},
	'list-3': {
		category: 'lists',
		description: '2x2 grid list layout',
		hasDarkVariant: true
	},

	// Buttons ------------------------------------
	'button-primary-left': {
		category: 'buttons',
		description: 'Left-aligned full color button',
		hasDarkVariant: true
	},
	'button-secondary-left': {
		category: 'buttons',
		description: 'Left-aligned outline button',
		hasDarkVariant: true
	},
	'buttons-2-left': {
		category: 'buttons',
		description: 'Two buttons, left-aligned',
		hasDarkVariant: true
	},
	'button-primary-center': {
		category: 'buttons',
		description: 'Center-aligned full color button',
		hasDarkVariant: true
	},
	'button-secondary-center': {
		category: 'buttons',
		description: 'Center-aligned outline button',
		hasDarkVariant: true
	},
	'buttons-2-center': {
		category: 'buttons',
		description: 'Two buttons, center-aligned',
		hasDarkVariant: true
	},
	// Cards ------------------------------------
	'cards-2': {
		category: 'cards',
		description: 'Two hgorizontal cards',
		hasDarkVariant: true
	},
	'cards-3': {
		category: 'cards',
		description: 'Three horizontal cards',
		hasDarkVariant: true
	},
	'cards-4': {
		category: 'cards',
		description: 'Four horizontal cards',
		hasDarkVariant: true
	},
	'cards-2x2': {
		category: 'cards',
		description: '2x2 grid of cards',
		hasDarkVariant: true
	},
	'cards-6': {
		category: 'cards',
		description: 'Six cards grid layout',
		hasDarkVariant: true
	},
	'pricing-2': {
		category: 'cards',
		description: 'Two pricing comparison cards',
		hasDarkVariant: true
	},

	// Special elements ------------------------------------
	'styleguide': {
		category: 'special',
		description: 'Text style guidelines',
		hasDarkVariant: false
	}
} as const;