// src/lib/features/addon/features/colors/color-data.ts

export interface ColorScheme {
	color: string;
	title: string;
	tier: 'free' | 'pro';
	isGradient?: boolean;
}

export interface ColorCategory {
	id: string;
	name: string;
	description: string;
	colors: ColorScheme[];
}

export const colorCategories: ColorCategory[] = [
	{
		id: 'essentials',
		name: 'Essentials',
		description: 'Most commonly used backgrounds',
		colors: [
			{ color: '#FFFFFF', title: 'White', tier: 'free' },
			{ color: '#F8FAFC', title: 'Slate 50', tier: 'free' },
			{ color: '#F1F5F9', title: 'Slate 100', tier: 'free' },
			{ color: '#E2E8F0', title: 'Slate 200', tier: 'free' },
			{ color: '#CBD5E1', title: 'Slate 300', tier: 'free' },
			{ color: '#64748B', title: 'Slate 500', tier: 'free' },
			{ color: '#475569', title: 'Slate 600', tier: 'free' },
			{ color: '#334155', title: 'Slate 700', tier: 'free' },
			{ color: '#1E293B', title: 'Slate 800', tier: 'free' },
			{ color: '#0F172A', title: 'Slate 900', tier: 'free' },
		]
	},
	{
		id: 'neutrals',
		name: 'Neutrals',
		description: 'Classic gray tones',
		colors: [
			{ color: '#FAFAFA', title: 'Gray 50', tier: 'free' },
			{ color: '#F5F5F5', title: 'Gray 100', tier: 'free' },
			{ color: '#E5E5E5', title: 'Gray 200', tier: 'free' },
			{ color: '#D4D4D4', title: 'Gray 300', tier: 'free' },
			{ color: '#A3A3A3', title: 'Gray 400', tier: 'free' },
			{ color: '#737373', title: 'Gray 500', tier: 'free' },
			{ color: '#525252', title: 'Gray 600', tier: 'free' },
			{ color: '#404040', title: 'Gray 700', tier: 'free' },
			{ color: '#262626', title: 'Gray 800', tier: 'free' },
			{ color: '#171717', title: 'Gray 900', tier: 'free' },
		]
	},
	{
		id: 'warm',
		name: 'Warm Tones',
		description: 'Stone and warm grays',
		colors: [
			{ color: '#FAFAF9', title: 'Stone 50', tier: 'pro' },
			{ color: '#F5F5F4', title: 'Stone 100', tier: 'pro' },
			{ color: '#E7E5E4', title: 'Stone 200', tier: 'pro' },
			{ color: '#D6D3D1', title: 'Stone 300', tier: 'pro' },
			{ color: '#A8A29E', title: 'Stone 400', tier: 'pro' },
			{ color: '#78716C', title: 'Stone 500', tier: 'pro' },
			{ color: '#57534E', title: 'Stone 600', tier: 'pro' },
			{ color: '#44403C', title: 'Stone 700', tier: 'pro' },
			{ color: '#292524', title: 'Stone 800', tier: 'pro' },
			{ color: '#1C1917', title: 'Stone 900', tier: 'pro' },
		]
	},
	{
		id: 'colors',
		name: 'Brand Colors',
		description: 'Vibrant backgrounds for impact',
		colors: [
			{ color: '#FEF3C7', title: 'Amber 100', tier: 'pro' },
			{ color: '#DBEAFE', title: 'Blue 100', tier: 'pro' },
			{ color: '#D1FAE5', title: 'Emerald 100', tier: 'pro' },
			{ color: '#FCE7F3', title: 'Pink 100', tier: 'pro' },
			{ color: '#EDE9FE', title: 'Violet 100', tier: 'pro' },
			{ color: '#FEF2F2', title: 'Red 100', tier: 'pro' },
			{ color: '#ECFDF5', title: 'Green 100', tier: 'pro' },
			{ color: '#F0F9FF', title: 'Sky 100', tier: 'pro' },
			{ color: '#FAF5FF', title: 'Purple 100', tier: 'pro' },
			{ color: '#FFFBEB', title: 'Orange 100', tier: 'pro' },
		]
	},
	{
		id: 'bold',
		name: 'Bold Colors',
		description: 'Strong, saturated backgrounds',
		colors: [
			{ color: '#F59E0B', title: 'Amber 500', tier: 'pro' },
			{ color: '#3B82F6', title: 'Blue 500', tier: 'pro' },
			{ color: '#10B981', title: 'Emerald 500', tier: 'pro' },
			{ color: '#EC4899', title: 'Pink 500', tier: 'pro' },
			{ color: '#8B5CF6', title: 'Violet 500', tier: 'pro' },
			{ color: '#EF4444', title: 'Red 500', tier: 'pro' },
			{ color: '#22C55E', title: 'Green 500', tier: 'pro' },
			{ color: '#0EA5E9', title: 'Sky 500', tier: 'pro' },
			{ color: '#A855F7', title: 'Purple 500', tier: 'pro' },
			{ color: '#F97316', title: 'Orange 500', tier: 'pro' },
		]
	}
];

// Quick access to most common colors for the top section
export const quickColors: ColorScheme[] = [
	{ color: '#FFFFFF', title: 'White', tier: 'free' },
	{ color: '#F8FAFC', title: 'Light Gray', tier: 'free' },
	{ color: '#E2E8F0', title: 'Medium Gray', tier: 'free' },
	{ color: '#64748B', title: 'Dark Gray', tier: 'free' },
	{ color: '#1E293B', title: 'Very Dark', tier: 'free' },
	{ color: '#0F172A', title: 'Near Black', tier: 'free' },
	{ color: '#DBEAFE', title: 'Light Blue', tier: 'pro' },
	{ color: '#D1FAE5', title: 'Light Green', tier: 'pro' },
	{ color: '#FEF3C7', title: 'Light Yellow', tier: 'pro' },
	{ color: '', title: 'Custom Color', isGradient: true, tier: 'free' },
];

// Helper to get all colors across categories
export function getAllColors(): ColorScheme[] {
	return colorCategories.flatMap(category => category.colors);
}

// Helper to get colors by tier
export function getColorsByTier(tier: 'free' | 'pro'): ColorScheme[] {
	return getAllColors().filter(color => color.tier === tier);
}