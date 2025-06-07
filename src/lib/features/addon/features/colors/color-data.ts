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
		id: 'saas',
		name: 'SaaS',
		description: 'Subtle blue-tinted professional backgrounds',
		tier: 'pro',
		colors: [
			// Row 1 - Light blue tints (readable with black text)
			{ color: '#F0F9FF', title: 'Cloud 50', tier: 'pro' },
			{ color: '#E0F2FE', title: 'Cloud 100', tier: 'pro' },
			{ color: '#BAE6FD', title: 'Cloud 200', tier: 'pro' },
			{ color: '#93C5FD', title: 'Cloud 300', tier: 'pro' },
			{ color: '#DBEAFE', title: 'Cloud 150', tier: 'pro' },
			// Row 2 - Dark blue backgrounds
			{ color: '#1E3A8A', title: 'Cloud 800', tier: 'pro' },
			{ color: '#1E40AF', title: 'Cloud 750', tier: 'pro' },
			{ color: '#312E81', title: 'Cloud 850', tier: 'pro' },
			{ color: '#1E1B4B', title: 'Cloud 900', tier: 'pro' },
			{ color: '#0F172A', title: 'Cloud 950', tier: 'pro' },
		]
	},
	{
		id: 'neon',
		name: 'Neon',
		description: 'Bright cyber-inspired backgrounds',
		tier: 'pro',
		colors: [
			// Row 1 - Light neon tints
			{ color: '#F0FDF4', title: 'Cyber 50', tier: 'pro' },
			{ color: '#ECFCCB', title: 'Cyber 100', tier: 'pro' },
			{ color: '#FEF3C7', title: 'Cyber 150', tier: 'pro' },
			{ color: '#FECACA', title: 'Cyber 175', tier: 'pro' },
			{ color: '#E0E7FF', title: 'Cyber 125', tier: 'pro' },
			// Row 2 - Dark neon backgrounds
			{ color: '#166534', title: 'Cyber 800', tier: 'pro' },
			{ color: '#92400E', title: 'Cyber 850', tier: 'pro' },
			{ color: '#991B1B', title: 'Cyber 875', tier: 'pro' },
			{ color: '#3730A3', title: 'Cyber 825', tier: 'pro' },
			{ color: '#14532D', title: 'Cyber 900', tier: 'pro' },
		]
	},
	{
		id: 'brutal',
		name: 'Neobrutalist',
		description: 'High contrast statement backgrounds',
		tier: 'pro',
		colors: [
			// Row 1 - Light high contrast
			{ color: '#FFFBEB', title: 'Bold 50', tier: 'pro' },
			{ color: '#FEF3C7', title: 'Bold 100', tier: 'pro' },
			{ color: '#FDE68A', title: 'Bold 200', tier: 'pro' },
			{ color: '#FECACA', title: 'Bold 150', tier: 'pro' },
			{ color: '#FCE7F3', title: 'Bold 175', tier: 'pro' },
			// Row 2 - Dark high contrast
			{ color: '#92400E', title: 'Bold 800', tier: 'pro' },
			{ color: '#991B1B', title: 'Bold 850', tier: 'pro' },
			{ color: '#86198F', title: 'Bold 875', tier: 'pro' },
			{ color: '#7C2D12', title: 'Bold 825', tier: 'pro' },
			{ color: '#450A0A', title: 'Bold 950', tier: 'pro' },
		]
	},
	{
		id: 'minimal',
		name: 'Minimal',
		description: 'Extended grayscale range for precise control',
		tier: 'pro',
		colors: [
			// Row 1 - Extended light range
			{ color: '#FDFDFD', title: 'Pure 25', tier: 'pro' },
			{ color: '#F9FAFB', title: 'Pure 50', tier: 'pro' },
			{ color: '#F3F4F6', title: 'Pure 100', tier: 'pro' },
			{ color: '#E5E7EB', title: 'Pure 200', tier: 'pro' },
			{ color: '#D1D5DB', title: 'Pure 300', tier: 'pro' },
			// Row 2 - Extended dark range
			{ color: '#6B7280', title: 'Pure 500', tier: 'pro' },
			{ color: '#374151', title: 'Pure 700', tier: 'pro' },
			{ color: '#1F2937', title: 'Pure 800', tier: 'pro' },
			{ color: '#111827', title: 'Pure 900', tier: 'pro' },
			{ color: '#030712', title: 'Pure 950', tier: 'pro' },
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