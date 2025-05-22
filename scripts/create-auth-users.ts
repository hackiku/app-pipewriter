// scripts/create-auth-users.ts
import { adminAuth, adminFirestore } from '../src/lib/server/firebase-admin';

async function createAuthUsers() {
	console.log('👤 Creating Firebase Auth users...');

	// Define auth users that match your database users
	const authUsers = [
		{
			uid: 'free-user-123',
			email: 'free@test.com',
			displayName: 'Free User',
			password: 'password123',
			photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=free'
		},
		{
			uid: 'trial-user-456',
			email: 'trial@test.com',
			displayName: 'Trial User',
			password: 'password123',
			photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trial'
		},
		{
			uid: 'trial-expiring-789',
			email: 'expiring@test.com',
			displayName: 'Trial Expiring Soon',
			password: 'password123',
			photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=expiring'
		},
		{
			uid: 'pro-user-999',
			email: 'pro@test.com',
			displayName: 'Pro User',
			password: 'password123',
			photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pro'
		}
	];

	for (const userData of authUsers) {
		try {
			// Check if user already exists
			let authUser;
			try {
				authUser = await adminAuth.getUser(userData.uid);
				console.log(`   ⚠️  Auth user ${userData.email} already exists`);
			} catch (error) {
				// User doesn't exist, create them
				authUser = await adminAuth.createUser({
					uid: userData.uid,
					email: userData.email,
					displayName: userData.displayName,
					password: userData.password,
					photoURL: userData.photoURL,
					emailVerified: true, // Skip email verification for testing
				});
				console.log(`   ✅ Created auth user: ${userData.email}`);
			}

			// Update the corresponding Firestore document with auth info
			await adminFirestore.collection('users').doc(userData.uid).update({
				email: userData.email,
				displayName: userData.displayName,
				photoURL: userData.photoURL,
				emailVerified: true,
				updatedAt: new Date()
			});

		} catch (error) {
			console.error(`   ❌ Error creating auth user ${userData.email}:`, error);
		}
	}

	console.log('');
	console.log('🎉 Auth users created successfully!');
	console.log('');
	console.log('🔐 Test Login Credentials:');
	console.log('   Free User: free@test.com / password123');
	console.log('   Trial User: trial@test.com / password123');
	console.log('   Expiring Trial: expiring@test.com / password123');
	console.log('   Pro User: pro@test.com / password123');
	console.log('');
	console.log('👀 View auth users: http://localhost:5000/auth');
	console.log('👀 View user data: http://localhost:5000/firestore/data/users');
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	createAuthUsers().catch(console.error);
}

export { createAuthUsers };