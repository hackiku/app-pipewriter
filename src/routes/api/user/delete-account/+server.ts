// src/routes/api/user/delete-account/+server.ts
import { json } from '@sveltejs/kit';
import { adminAuth, adminFirestore } from '$lib/server/firebase-admin';

/**
 * DELETE /api/user/delete-account
 * Permanently delete user account and all associated data
 * Required for GDPR compliance and Google verification
 */
export async function DELETE({ locals, request }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;
		const { confirmEmail } = await request.json().catch(() => ({}));

		// Security check: require email confirmation
		if (confirmEmail !== locals.user.email) {
			return json({
				error: 'Email confirmation required',
				message: 'Please confirm your email address to delete your account'
			}, { status: 400 });
		}

		console.log(`🗑️ Starting account deletion for user: ${locals.user.email}`);

		// 1. Delete user's subcollections (prompts, etc.)
		const userDocRef = adminFirestore.collection('users').doc(uid);

		// Delete user's prompts collection
		const promptsSnapshot = await userDocRef.collection('prompts').get();
		const promptsBatch = adminFirestore.batch();
		promptsSnapshot.docs.forEach(doc => {
			promptsBatch.delete(doc.ref);
		});
		if (!promptsSnapshot.empty) {
			await promptsBatch.commit();
			console.log(`   ✅ Deleted ${promptsSnapshot.size} user prompts`);
		}

		// Delete any other subcollections here as you add them
		// const otherSnapshot = await userDocRef.collection('other').get();
		// ...

		// 2. Delete main user document
		await userDocRef.delete();
		console.log(`   ✅ Deleted user document`);

		// 3. Revoke all refresh tokens (signs user out everywhere)
		await adminAuth.revokeRefreshTokens(uid);
		console.log(`   ✅ Revoked all refresh tokens`);

		// 4. Delete Firebase Auth user (this is irreversible)
		await adminAuth.deleteUser(uid);
		console.log(`   ✅ Deleted Firebase Auth user`);

		console.log(`🎉 Account deletion completed for: ${locals.user.email}`);

		return json({
			success: true,
			message: 'Account deleted successfully',
			deletedAt: new Date().toISOString()
		});

	} catch (error) {
		console.error(`❌ Account deletion failed for user ${locals.user?.uid}:`, error);

		// Return appropriate error based on type
		if (error.code === 'auth/user-not-found') {
			return json({
				error: 'User not found',
				message: 'This account may have already been deleted'
			}, { status: 404 });
		}

		return json({
			error: 'Account deletion failed',
			message: 'Please try again or contact support if the problem persists'
		}, { status: 500 });
	}
}

/**
 * GET /api/user/delete-account
 * Get information about what will be deleted (for user confirmation)
 */
export async function GET({ locals }) {
	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const uid = locals.user.uid;

		// Count user data that will be deleted
		const userDocRef = adminFirestore.collection('users').doc(uid);
		const userDoc = await userDocRef.get();

		const promptsSnapshot = await userDocRef.collection('prompts').get();

		const deletionPreview = {
			user: {
				email: locals.user.email,
				displayName: locals.user.displayName,
				createdAt: userDoc.data()?.createdAt?.toDate()?.toISOString(),
				tier: userDoc.data()?.tier || 'free'
			},
			dataToDelete: {
				prompts: promptsSnapshot.size,
				// Add other data counts as you expand
			},
			warning: 'This action cannot be undone. All your data will be permanently deleted.'
		};

		return json({
			success: true,
			preview: deletionPreview
		});

	} catch (error) {
		console.error('Error getting deletion preview:', error);
		return json({
			error: 'Failed to load account information'
		}, { status: 500 });
	}
}