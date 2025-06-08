// src/lib/services/firestore/users.ts
import { getFirebaseService } from '$lib/services/firebase/client';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface UserProfile {
	uid: string;
	email: string;
	displayName?: string;
	photoURL?: string;
	tier: 'free' | 'trial' | 'pro';
	pro: boolean;
	trialStartDate?: Date;
	trialEndDate?: Date;
	trialDaysRemaining: number;
	projectsCreated: number;
	elementsUsed: number;
	customFeatures?: any;
	createdAt: Date;
	updatedAt: Date;
	lastLoginDate: Date;
}

class UserService {
	private static instance: UserService;

	static getInstance(): UserService {
		if (!this.instance) {
			this.instance = new UserService();
		}
		return this.instance;
	}

	async createOrUpdateUser(firebaseUser: User): Promise<UserProfile> {
		const { db } = getFirebaseService();
		const userRef = doc(db, 'users', firebaseUser.uid);

		try {
			const userDoc = await getDoc(userRef);
			const now = new Date();

			if (!userDoc.exists()) {
				// Create new user with trial
				const newUser: Partial<UserProfile> = {
					uid: firebaseUser.uid,
					email: firebaseUser.email!,
					displayName: firebaseUser.displayName || undefined,
					photoURL: firebaseUser.photoURL || undefined,
					tier: 'trial',
					pro: false,
					trialStartDate: now,
					projectsCreated: 0,
					elementsUsed: 0,
					createdAt: now,
					updatedAt: now,
					lastLoginDate: now
				};

				await setDoc(userRef, {
					...newUser,
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
					lastLoginDate: serverTimestamp(),
					trialStartDate: serverTimestamp()
				});

				return newUser as UserProfile;
			} else {
				// Update existing user login date
				await updateDoc(userRef, {
					lastLoginDate: serverTimestamp(),
					updatedAt: serverTimestamp()
				});

				return this.processUserData(userDoc.data());
			}
		} catch (error) {
			console.error('Error creating/updating user:', error);
			throw error;
		}
	}

	async getUserProfile(uid: string): Promise<UserProfile | null> {
		const { db } = getFirebaseService();
		const userRef = doc(db, 'users', uid);

		try {
			const userDoc = await getDoc(userRef);
			return userDoc.exists() ? this.processUserData(userDoc.data()) : null;
		} catch (error) {
			console.error('Error fetching user profile:', error);
			return null;
		}
	}

	private processUserData(data: any): UserProfile {
		const trialDaysRemaining = this.calculateTrialDaysRemaining(data.trialStartDate?.toDate());

		return {
			...data,
			trialStartDate: data.trialStartDate?.toDate(),
			trialEndDate: data.trialEndDate?.toDate(),
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate(),
			lastLoginDate: data.lastLoginDate?.toDate(),
			trialDaysRemaining,
			tier: data.pro ? 'pro' : (trialDaysRemaining > 0 ? 'trial' : 'free')
		};
	}

	private calculateTrialDaysRemaining(trialStartDate?: Date): number {
		if (!trialStartDate) return 0;

		const TRIAL_DURATION_DAYS = 14;
		const now = new Date();
		const diffTime = now.getTime() - trialStartDate.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		return Math.max(0, TRIAL_DURATION_DAYS - diffDays);
	}
}

export const userService = UserService.getInstance();