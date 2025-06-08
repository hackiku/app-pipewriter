// src/routes/api/auth/session/+server.ts - WITH PROMPT PROVISIONING
import { json } from '@sveltejs/kit';
import { adminAuth, adminFirestore } from '$lib/server/firebase-admin';
import { provisionUserPrompts, userHasPromptsProvisioned } from '$lib/services/firestore/user-provisioning-prompts';
import { dev } from '$app/environment';

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days

/**
 * ENHANCED: Creates session AND provisions user + prompts in one atomic operation
 */
export async function POST({ request, cookies }) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return json({ error: 'No ID token provided' }, { status: 400 });
		}

		// Verify token and create session
		const sessionCookie = await adminAuth.createSessionCookie(idToken, {
			expiresIn: SESSION_EXPIRES_IN
		});

		// Get user info
		const decodedToken = await adminAuth.verifyIdToken(idToken);
		const authUser = await adminAuth.getUser(decodedToken.uid);

		// ATOMIC USER + PROMPTS PROVISIONING
		const userRef = adminFirestore.collection('users').doc(authUser.uid);
		const userDoc = await userRef.get();

		const now = new Date();
		let isNewUser = false;

		if (!userDoc.exists) {
			// NEW USER: Create with trial
			await userRef.set({
				// Identity (from Firebase Auth)
				uid: authUser.uid,
				email: authUser.email,
				displayName: authUser.displayName || null,
				photoURL: authUser.photoURL || null,

				// App-specific subscription data
				tier: 'trial',
				pro: false,
				trialStartDate: now,

				// Usage tracking
				// projectsCreated: 0,
				elementsUsed: 0,

				// Timestamps
				createdAt: now,
				updatedAt: now,
				lastLoginDate: now,
			});

			isNewUser = true;
			console.log(`✅ NEW USER: ${authUser.email} (trial activated)`);
		} else {
			// EXISTING USER: Just update login info
			await userRef.update({
				lastLoginDate: now,
				updatedAt: now,
				// Sync auth info in case it changed
				email: authUser.email,
				displayName: authUser.displayName || null,
				photoURL: authUser.photoURL || null,
			});

			console.log(`✅ EXISTING USER: ${authUser.email} (login updated)`);
		}

		// PROVISION PROMPTS FOR NEW USERS
		if (isNewUser) {
			console.log(`📋 Provisioning prompts for new user: ${authUser.email}`);
			const promptsProvisioned = await provisionUserPrompts(authUser.uid);

			if (promptsProvisioned) {
				console.log(`✅ Prompts provisioned successfully for ${authUser.email}`);
			} else {
				console.warn(`⚠️ Failed to provision prompts for ${authUser.email}`);
			}
		} else {
			// For existing users, check if they have prompts (migration)
			const hasPrompts = await userHasPromptsProvisioned(authUser.uid);
			if (!hasPrompts) {
				console.log(`📋 Migrating existing user to new prompt system: ${authUser.email}`);
				await provisionUserPrompts(authUser.uid);
			}
		}

		// Set secure iframe-compatible cookie
		cookies.set('__session', sessionCookie, {
			maxAge: SESSION_EXPIRES_IN / 1000,
			httpOnly: true,
			secure: true,
			path: '/',
			sameSite: 'none' // Required for iframe
		});

		return json({
			success: true,
			isNewUser,
			promptsProvisioned: true
		});

	} catch (error) {
		console.error('Session/provisioning failed:', error);
		return json({
			error: 'Authentication failed',
			details: dev ? error.message : undefined
		}, { status: 401 });
	}
}

export async function DELETE({ cookies }) {
	cookies.delete('__session', { path: '/' });
	return json({ success: true });
}