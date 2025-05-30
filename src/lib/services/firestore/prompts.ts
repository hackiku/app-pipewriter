// src/lib/services/firestore/prompts.ts

import { getFirebaseService } from '$lib/services/firebase/client';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { browser } from '$app/environment';

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

class PromptsService {
	private static instance: PromptsService;
	private promptsCache = new Map<string, PromptDefinition>();
	private cacheExpiry = 0;
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
	private unsubscribe: (() => void) | null = null;

	// Define category order for consistent display
	private readonly CATEGORY_ORDER = [
		'writing',
		'code',
		'design',
		'marketing',
		'technical'
	];

	static getInstance(): PromptsService {
		if (!this.instance) {
			this.instance = new PromptsService();
		}
		return this.instance;
	}

	/**
	 * Load all prompts from Firestore with caching
	 */
	async getPrompts(forceRefresh = false): Promise<PromptDefinition[]> {
		if (!browser) return this.getFallbackPrompts();

		const now = Date.now();
		if (!forceRefresh && this.cacheExpiry > now && this.promptsCache.size > 0) {
			return Array.from(this.promptsCache.values());
		}

		try {
			const { db } = getFirebaseService();
			const promptsRef = collection(db, 'prompts');

			const q = query(
				promptsRef,
				where('active', '==', true),
				orderBy('category'),
				orderBy('title')
			);

			const snapshot = await getDocs(q);
			this.promptsCache.clear();

			const prompts: PromptDefinition[] = [];
			snapshot.docs.forEach(doc => {
				const prompt = {
					...doc.data(),
					id: doc.id,
					createdAt: doc.data().createdAt?.toDate(),
					updatedAt: doc.data().updatedAt?.toDate()
				} as PromptDefinition;
				this.promptsCache.set(prompt.id, prompt);
				prompts.push(prompt);
			});

			// Sort prompts by our custom category order
			prompts.sort((a, b) => {
				const aOrder = this.CATEGORY_ORDER.indexOf(a.category);
				const bOrder = this.CATEGORY_ORDER.indexOf(b.category);

				const aIndex = aOrder === -1 ? 999 : aOrder;
				const bIndex = bOrder === -1 ? 999 : bOrder;

				if (aIndex !== bIndex) {
					return aIndex - bIndex;
				}

				// Within same category, sort by title
				return a.title.localeCompare(b.title);
			});

			this.cacheExpiry = now + this.CACHE_DURATION;
			console.log(`✅ Loaded ${prompts.length} prompts from Firestore`);
			return prompts;

		} catch (error) {
			console.error('❌ Error loading prompts from Firestore:', error);
			return this.getFallbackPrompts();
		}
	}

	/**
	 * Get prompts grouped by category with tier filtering
	 */
	async getPromptsByCategory(
		userTier: 'free' | 'trial' | 'pro'
	): Promise<Record<string, PromptWithAccess[]>> {
		const prompts = await this.getPrompts();

		const grouped = prompts.reduce((grouped, prompt) => {
			const promptTier = prompt.metadata?.tier || 'free';
			const isLocked = !this.checkTierAccess(userTier, promptTier);

			const promptWithAccess: PromptWithAccess = {
				...prompt,
				isLocked
			};

			if (!grouped[prompt.category]) {
				grouped[prompt.category] = [];
			}
			grouped[prompt.category].push(promptWithAccess);

			return grouped;
		}, {} as Record<string, PromptWithAccess[]>);

		// Ensure categories are in our preferred order
		const orderedGrouped: Record<string, PromptWithAccess[]> = {};

		this.CATEGORY_ORDER.forEach(category => {
			if (grouped[category]) {
				orderedGrouped[category] = grouped[category];
			}
		});

		// Add any remaining categories
		Object.entries(grouped).forEach(([category, prompts]) => {
			if (!orderedGrouped[category]) {
				orderedGrouped[category] = prompts;
			}
		});

		return orderedGrouped;
	}

	/**
	 * Get single prompt by ID with access control
	 */
	async getPromptById(
		promptId: string,
		userTier: 'free' | 'trial' | 'pro' = 'free'
	): Promise<PromptWithAccess | null> {
		const prompts = await this.getPrompts();
		const prompt = prompts.find(p => p.id === promptId);

		if (!prompt) return null;

		const promptTier = prompt.metadata?.tier || 'free';
		const isLocked = !this.checkTierAccess(userTier, promptTier);

		return {
			...prompt,
			isLocked
		};
	}

	/**
	 * Set up real-time listener for prompts
	 */
	setupRealTimeListener(callback?: (prompts: PromptDefinition[]) => void) {
		if (!browser) return;

		try {
			const { db } = getFirebaseService();
			const promptsRef = collection(db, 'prompts');
			const q = query(
				promptsRef,
				where('active', '==', true),
				orderBy('category'),
				orderBy('title')
			);

			this.unsubscribe = onSnapshot(q, (snapshot) => {
				this.promptsCache.clear();
				const prompts: PromptDefinition[] = [];

				snapshot.docs.forEach(doc => {
					const prompt = {
						...doc.data(),
						id: doc.id,
						createdAt: doc.data().createdAt?.toDate(),
						updatedAt: doc.data().updatedAt?.toDate()
					} as PromptDefinition;
					this.promptsCache.set(prompt.id, prompt);
					prompts.push(prompt);
				});

				console.log(`🔄 Real-time update: ${prompts.length} prompts`);
				callback?.(prompts);
			}, (error) => {
				console.error('❌ Real-time listener error:', error);
			});

		} catch (error) {
			console.error('❌ Error setting up real-time listener:', error);
		}
	}

	/**
	 * Check if user tier has access to prompt tier
	 */
	private checkTierAccess(userTier: string, promptTier: string): boolean {
		if (userTier === 'pro') return true;
		if (userTier === 'trial') return promptTier !== 'pro';
		return promptTier === 'free';
	}

	/**
	 * Fallback to hardcoded prompts (for development/offline)
	 */
	private getFallbackPrompts(): PromptDefinition[] {
		console.log('📦 Using fallback hardcoded prompts');
		return [
			{
				id: "polish-copy",
				category: "writing",
				title: "Polish Copy",
				description: "Improve clarity, tone and engagement while keeping the same meaning and length",
				content: "Please improve the clarity, tone and engagement of the selected text while maintaining the same core meaning and approximate length.",
				active: true,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: "html-structure",
				category: "code",
				title: "HTML Structure",
				description: "Convert to semantic HTML with proper heading hierarchy and tags",
				content: "Convert this content to clean, semantic HTML with proper heading hierarchy (h1, h2, h3) and appropriate tags like <p>, <ul>, <ol>, <strong>, <em>.",
				active: true,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		];
	}

	/**
	 * Cleanup listeners
	 */
	cleanup() {
		if (this.unsubscribe) {
			this.unsubscribe();
			this.unsubscribe = null;
		}
	}
}

// Export singleton instance
export const promptsService = PromptsService.getInstance();