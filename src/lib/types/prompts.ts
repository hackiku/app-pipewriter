// src/lib/types/prompts.ts

export interface PromptDefinition {
	id: string;
	category: string;
	title: string;
	description: string;
	content: string;
	metadata?: {
		tier?: 'free' | 'trial' | 'pro';
		tags?: string[];
		usage?: number;
	};
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface PromptWithAccess extends PromptDefinition {
	isLocked: boolean;
}

export type PromptCategory = 'writing' | 'code' | 'design' | 'marketing' | 'technical';

export type PromptTier = 'free' | 'trial' | 'pro';