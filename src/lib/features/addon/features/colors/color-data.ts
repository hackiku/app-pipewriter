// src/lib/features/addon/features/colors/color-data.ts

export interface ColorScheme {
	color: string;
	title: string;
	tier: 'free' | 'pro';
}

export interface ColorCategory {
	id: string;
	name: string;
	description: string;
	tier: 'free' | 'pro';
	colors: ColorScheme[];
}

export const colorCategories: ColorCategory[] = [
	{
		id: 'base',
		name: 'Base',
		description: 'Essential wireframe backgrounds',
		tier: 'free',
		colors: [
			// Row 1 - Light tones
			{ color: '#FFFFFF', title: 'White', tier: 'free' },
			{ color: '#F8FAFC', title: 'Slate 50', tier: 'free' },
			{ color: '#F1F5F9', title: 'Slate 100', tier: 'free' },
			{ color: '#E2E8F0', title: 'Slate 200', tier: 'free' },
			{ color: '#CBD5E1', title: 'Slate 300', tier: 'free' },
			// Row 2 - Dark tones
			{ color: '#64748B', title: 'Slate 500', tier: 'free' },
			{ color: '#475569', title: 'Slate 600', tier: 'free' },
			{ color: '#334155', title: 'Slate 700', tier: 'free' },
			{ color: '#1E293B', title: 'Slate 800', tier: 'free' },
			{ color: '#0F172A', title: 'Slate 900', tier: 'free' },
		]
	},
	{
		id: 'neutral',
		name: 'Gray',
		description: 'Classic neutral wireframe tones',
		tier: 'free',
		colors: [
			// Row 1 - Light grays
			{ color: '#FAFAFA', title: 'Gray 50', tier: 'free' },
			{ color: '#F5F5F5', title: 'Gray 100', tier: 'free' },
			{ color: '#E5E5E5', title: 'Gray 200', tier: 'free' },
			{ color: '#D4D4D4', title: 'Gray 300', tier: 'free' },
			{ color: '#A3A3A3', title: 'Gray 400', tier: 'free' },
			// Row 2 - Dark grays
			{ color: '#737373', title: 'Gray 500', tier: 'free' },
			{ color: '#525252', title: 'Gray 600', tier: 'free' },
			{ color: '#404040', title: 'Gray 700', tier: 'free' },
			{ color: '#262626', title: 'Gray 800', tier: 'free' },
			{ color: '#171717', title: 'Gray 900', tier: 'free' },
		]
	},
	{
		id: 'green',
		name: 'Green',
		description: 'Modern green-tinted backgrounds',
		tier: 'pro',
		colors: [
			// Row 1 - Light sky tones
			{ color: '#EEEFE0', title: 'Sky 50', tier: 'pro' },
			{ color: '#D1D8BE', title: 'Sky 100', tier: 'pro' },
			{ color: '#A7C1A8', title: 'Sky 200', tier: 'pro' },
			{ color: '#819A91', title: 'Sky 300', tier: 'pro' },
			{ color: '#38BDF8', title: 'Sky 400', tier: 'pro' },
			// Row 2 - Dark sky tones
			{ color: '#819A91', title: 'Sky 500', tier: 'pro' },
			{ color: '#0284C7', title: 'Sky 600', tier: 'pro' },
			{ color: '#0369A1', title: 'Sky 700', tier: 'pro' },
			{ color: '#075985', title: 'Sky 800', tier: 'pro' },
			{ color: '#0C4A6E', title: 'Sky 900', tier: 'pro' },
		]
	},
	{
		id: 'violet',
		name: 'Violet',
		description: 'Contemporary purple-tinted backgrounds',
		tier: 'pro',
		colors: [
			// Row 1 - Light violet tones
			{ color: '#FAF5FF', title: 'Violet 50', tier: 'pro' },
			{ color: '#F3E8FF', title: 'Violet 100', tier: 'pro' },
			{ color: '#E9D5FF', title: 'Violet 200', tier: 'pro' },
			{ color: '#D8B4FE', title: 'Violet 300', tier: 'pro' },
			{ color: '#C084FC', title: 'Violet 400', tier: 'pro' },
			// Row 2 - Dark violet tones
			{ color: '#A855F7', title: 'Violet 500', tier: 'pro' },
			{ color: '#9333EA', title: 'Violet 600', tier: 'pro' },
			{ color: '#7C3AED', title: 'Violet 700', tier: 'pro' },
			{ color: '#6D28D9', title: 'Violet 800', tier: 'pro' },
			{ color: '#581C87', title: 'Violet 900', tier: 'pro' },
		]
	},
	{
		id: 'emerald',
		name: 'Emerald',
		description: 'Fresh green-tinted backgrounds',
		tier: 'pro',
		colors: [
			// Row 1 - Light emerald tones
			{ color: '#ECFDF5', title: 'Emerald 50', tier: 'pro' },
			{ color: '#D1FAE5', title: 'Emerald 100', tier: 'pro' },
			{ color: '#A7F3D0', title: 'Emerald 200', tier: 'pro' },
			{ color: '#6EE7B7', title: 'Emerald 300', tier: 'pro' },
			{ color: '#34D399', title: 'Emerald 400', tier: 'pro' },
			// Row 2 - Dark emerald tones
			{ color: '#10B981', title: 'Emerald 500', tier: 'pro' },
			{ color: '#059669', title: 'Emerald 600', tier: 'pro' },
			{ color: '#047857', title: 'Emerald 700', tier: 'pro' },
			{ color: '#065F46', title: 'Emerald 800', tier: 'pro' },
			{ color: '#064E3B', title: 'Emerald 900', tier: 'pro' },
		]
	}
];

// Helper to get all colors across categories
export function getAllColors(): ColorScheme[] {
	return colorCategories.flatMap(category => category.colors);
}

// Helper to get colors by tier
export function getColorsByTier(tier: 'free' | 'pro'): ColorScheme[] {
	return getAllColors().filter(color => color.tier === tier);
}