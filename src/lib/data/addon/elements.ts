// src/lib/data/addon/elements.ts
import type { ElementDefinition } from './types';

// Define elements database
export const elementsDb: Record<string, ElementDefinition> = {
	// Containers
	'container-center': {
		id: 'container-center',
		category: 'containers',
		description: 'Centered container for content',
		metadata: {
			supports: {
				darkMode: true,
				customColors: true
			},
			tier: 'free'
		}
	},
	'background-empty': {
		id: 'background-empty',
		category: 'containers',
		description: 'Full width empty container',
		metadata: {
			supports: {
				darkMode: true,
				customColors: true
			},
			tier: 'free'
		}
	},
	'background-color': {
		id: 'background-color',
		category: 'containers',
		description: 'Full width colored container',
		metadata: {
			supports: {
				darkMode: true,
				customColors: true
			},
			tier: 'free'
		}
	},

	// Content
	'hero': {
		id: 'hero',
		category: 'content',
		description: 'Hero layout with heading and subtext',
		text: {
			h1: 'Main Heading',
			p: 'Supporting text that explains more details about the heading above.'
		},
		metadata: {
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'free'
		}
	},
	'zz-left': {
		id: 'zz-left',
		category: 'content',
		description: 'Text layout with left zigzag pattern',
		text: {
			h2: 'Zigzag left',
			p: 'Paragraph 10-45 words.'
		},
		metadata: {
			cols: 3,
			rows: 1,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'free'
		}
	},
	'zz-right': {
		id: 'zz-right',
		category: 'content',
		description: 'Text layout with right zigzag pattern',
		text: {
			h2: 'Zigzag right',
			p: 'Paragraph 10-40 words.'
		},
		metadata: {
			cols: 3,
			rows: 1,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'free'
		}
	},

	// Blurbs
	'blurbs-3': {
		id: 'blurbs-3',
		category: 'blurbs',
		description: '3 horizontal blurbs',
		metadata: {
			cols: 3,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'free'
		}
	},
	'blurbs-4': {
		id: 'blurbs-4',
		category: 'blurbs',
		description: '4 horizontal blurbs',
		metadata: {
			cols: 4,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'free'
		}
	},
	'blurbs-vertical-3': {
		id: 'blurbs-vertical-3',
		category: 'blurbs',
		description: '3 vertical blurbs',
		metadata: {
			rows: 3,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'pro'
		}
	},

	// Lists
	'list-1': {
		id: 'list-1',
		category: 'lists',
		description: 'Single column list',
		metadata: {
			cols: 1,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'free'
		}
	},
	'list-2': {
		id: 'list-2',
		category: 'lists',
		description: 'Two column list',
		metadata: {
			cols: 2,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'pro'
		}
	},
	'list-3': {
		id: 'list-3',
		category: 'lists',
		description: '2x2 grid list layout',
		metadata: {
			cols: 2,
			rows: 2,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'pro'
		}
	},

	// Buttons
	'button-primary-left': {
		id: 'button-primary-left',
		category: 'buttons',
		description: 'Left-aligned full color button',
		text: {
			cta: 'CTA'
		},
		metadata: {
			variant: 'primary',
			supports: {
				darkMode: true,
				customText: true,
				customColors: true
			},
			tier: 'free'
		}
	},
	'button-secondary-left': {
		id: 'button-secondary-left',
		category: 'buttons',
		description: 'Left-aligned outline button',
		text: {
			cta: 'CTA'
		},
		metadata: {
			variant: 'secondary',
			supports: {
				darkMode: true,
				customText: true,
				customColors: true
			},
			tier: 'free'
		}
	},
	'buttons-2-left': {
		id: 'buttons-2-left',
		category: 'buttons',
		description: 'Two buttons, left-aligned',
		text: {
			cta: 'CTA'
		},
		metadata: {
			cols: 2,
			supports: {
				darkMode: true,
				customText: true,
				customColors: true
			},
			tier: 'free'
		}
	},
	'button-primary-center': {
		id: 'button-primary-center',
		category: 'buttons',
		description: 'Center-aligned full color button',
		text: {
			cta: 'CTA'
		},
		metadata: {
			variant: 'primary',
			supports: {
				darkMode: true,
				customText: true,
				customColors: true
			},
			tier: 'pro'
		}
	},
	'button-secondary-center': {
		id: 'button-secondary-center',
		category: 'buttons',
		description: 'Center-aligned outline button',
		text: {
			cta: 'CTA'
		},
		metadata: {
			variant: 'secondary',
			supports: {
				darkMode: true,
				customText: true,
				customColors: true
			},
			tier: 'pro'
		}
	},
	'buttons-2-center': {
		id: 'buttons-2-center',
		category: 'buttons',
		description: 'Two buttons, center-aligned',
		text: {
			cta: 'CTA'
		},
		metadata: {
			cols: 2,
			supports: {
				darkMode: true,
				customText: true,
				customColors: true
			},
			tier: 'pro'
		}
	},

	// Cards
	'cards-2': {
		id: 'cards-2',
		category: 'cards',
		description: 'Two horizontal cards',
		metadata: {
			cols: 2,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'free'
		}
	},
	'cards-3': {
		id: 'cards-3',
		category: 'cards',
		description: 'Three horizontal cards',
		metadata: {
			cols: 3,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'free'
		}
	},
	'cards-4': {
		id: 'cards-4',
		category: 'cards',
		description: 'Four horizontal cards',
		metadata: {
			cols: 4,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'free'
		}
	},
	'cards-2x2': {
		id: 'cards-2x2',
		category: 'cards',
		description: '2x2 grid of cards',
		metadata: {
			cols: 2,
			rows: 2,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'pro'
		}
	},
	'cards-6': {
		id: 'cards-6',
		category: 'cards',
		description: 'Six cards grid layout',
		metadata: {
			cols: 3,
			rows: 2,
			supports: {
				darkMode: true,
				customText: true
			},
			tier: 'pro'
		}
	},
	'pricing-2': {
		id: 'pricing-2',
		category: 'cards',
		description: 'Two pricing comparison cards',
		metadata: {
			cols: 2,
			variant: 'pricing',
			supports: {
				darkMode: true,
				customText: true,
				customColors: true
			},
			tier: 'pro'
		}
	},

	// Special elements
	'styleguide': {
		id: 'styleguide',
		category: 'special',
		description: 'Text style guidelines',
		metadata: {
			supports: {
				darkMode: false
			},
			tier: 'free'
		}
	}
};