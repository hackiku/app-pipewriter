// scripts/seed-emulator.ts
import { adminFirestore, adminAuth } from '../src/lib/server/firebase-admin.js';
import { elementsDb } from '../src/lib/data/addon/elements.js';

// Helper to check if emulators are running
async function checkEmulatorConnection() {
	try {
		// Try to access Firestore - this will fail if emulator isn't running
		await adminFirestore.collection('_health_check').doc('test').get();
		console.log('✅ Connected to Firestore emulator');
		return true;
	} catch (error) {
		console.error('❌ Cannot connect to Firestore emulator');
		console.error('Make sure emulators are running: firebase emulators:start');
		return false;
	}
}

// Clear all data (emulator only!)
async function clearEmulatorData() {
	console.log('🧹 Clearing emulator data...');

	try {
		// Delete all collections we'll be working with
		const collections = ['users', 'elements', 'projects'];

		for (const collectionName of collections) {
			const collection = adminFirestore.collection(collectionName);
			const snapshot = await collection.get();

			if (!snapshot.empty) {
				const batch = adminFirestore.batch();
				snapshot.docs.forEach(doc => batch.delete(doc.ref));
				await batch.commit();
				console.log(`   Cleared ${snapshot.size} documents from ${collectionName}`);
			}
		}

		console.log('✅ Emulator data cleared');
	} catch (error) {
		console.error('❌ Error clearing data:', error);
	}
}

// Seed elements collection
async function seedElements() {
	console.log('🌱 Seeding elements collection...');

	const batch = adminFirestore.batch();
	let count = 0;

	Object.entries(elementsDb).forEach(([elementId, elementData]) => {
		const elementRef = adminFirestore.collection('elements').doc(elementId);

		const firestoreElement = {
			...elementData,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			// Add useful computed fields
			svgPath: `/elements/${elementId}.svg`,
			svgPathDark: elementData.metadata?.supports?.darkMode ? `/elements/${elementId}-dark.svg` : null,
			// Add search-friendly fields
			searchTerms: [
				elementId,
				elementData.category,
				elementData.description.toLowerCase(),
				...(elementData.description.toLowerCase().split(' '))
			],
			// Add tier for easy filtering
			tier: elementData.metadata?.tier || 'free'
		};

		batch.set(elementRef, firestoreElement);
		count++;
	});

	try {
		await batch.commit();
		console.log(`✅ Seeded ${count} elements`);

		// Show breakdown by category and tier
		const categories = {};
		const tiers = { free: 0, trial: 0, pro: 0 };

		Object.values(elementsDb).forEach(element => {
			const category = element.category;
			const tier = element.metadata?.tier || 'free';

			categories[category] = (categories[category] || 0) + 1;
			tiers[tier]++;
		});

		console.log('   Categories:', categories);
		console.log('   Tiers:', tiers);

	} catch (error) {
		console.error('❌ Error seeding elements:', error);
	}
}

// Seed test users with different tiers
async function seedTestUsers() {
	console.log('🌱 Seeding test users...');

	const testUsers = [
		{
			uid: 'free-user-123',
			email: 'free@test.com',
			displayName: 'Free User',
			tier: 'free',
			pro: false,
			projectsCreated: 2,
			elementsUsed: 8,
			// No trial data for free user
		},
		{
			uid: 'trial-user-456',
			email: 'trial@test.com',
			displayName: 'Trial User',
			tier: 'trial',
			pro: false,
			trialStartDate: new Date(), // Active trial starting today
			projectsCreated: 5,
			elementsUsed: 25,
		},
		{
			uid: 'trial-expiring-789',
			email: 'expiring@test.com',
			displayName: 'Trial Expiring Soon',
			tier: 'trial',
			pro: false,
			trialStartDate: (() => {
				const date = new Date();
				date.setDate(date.getDate() - 12); // 12 days ago (2 days left)
				return date;
			})(),
			projectsCreated: 8,
			elementsUsed: 40,
		},
		{
			uid: 'pro-user-999',
			email: 'pro@test.com',
			displayName: 'Pro User',
			tier: 'pro',
			pro: true,
			projectsCreated: 25,
			elementsUsed: 150,
			stripeCustomerId: 'cus_test123',
			stripeSubscriptionId: 'sub_test123'
		}
	];

	for (const userData of testUsers) {
		try {
			await adminFirestore.collection('users').doc(userData.uid).set({
				...userData,
				createdAt: new Date(),
				updatedAt: new Date(),
				lastLoginDate: new Date(),
				// Add some realistic metadata
				userAgent: 'Mozilla/5.0 (Test User)',
				lastElementUsed: 'hero',
				favoriteElements: ['hero', 'cards-3', 'button-primary-center']
			});

			console.log(`   ✅ Created ${userData.displayName} (${userData.tier})`);
		} catch (error) {
			console.error(`   ❌ Error creating ${userData.email}:`, error);
		}
	}
}

// Create some sample projects for testing
async function seedSampleProjects() {
	console.log('🌱 Seeding sample projects...');

	const projects = [
		{
			id: 'project-1',
			userId: 'trial-user-456',
			name: 'Marketing Landing Page',
			docId: 'sample-doc-123',
			elementsUsed: ['hero', 'cards-3', 'button-primary-center'],
			lastModified: new Date()
		},
		{
			id: 'project-2',
			userId: 'pro-user-999',
			name: 'Product Documentation',
			docId: 'sample-doc-456',
			elementsUsed: ['hero', 'list-2', 'blurbs-4', 'pricing-2'],
			lastModified: new Date()
		}
	];

	for (const project of projects) {
		try {
			await adminFirestore.collection('projects').doc(project.id).set({
				...project,
				createdAt: new Date(),
				updatedAt: new Date()
			});
			console.log(`   ✅ Created project: ${project.name}`);
		} catch (error) {
			console.error(`   ❌ Error creating project ${project.name}:`, error);
		}
	}
}

// Main seeding function
async function seedEmulator() {
	console.log('🚀 Starting emulator seeding...');
	console.log('');

	// Check connection first
	const connected = await checkEmulatorConnection();
	if (!connected) {
		process.exit(1);
	}

	// Clear existing data
	await clearEmulatorData();
	console.log('');

	// Seed all data
	await seedElements();
	console.log('');

	await seedTestUsers();
	console.log('');

	await seedSampleProjects();
	console.log('');

	console.log('🎉 Emulator seeding completed!');
	console.log('');
	console.log('👀 View your data at: http://localhost:4000');
	console.log('   - Elements: http://localhost:4000/firestore/data/elements');
	console.log('   - Users: http://localhost:4000/firestore/data/users');
	console.log('   - Projects: http://localhost:4000/firestore/data/projects');
	console.log('');

	process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedEmulator().catch((error) => {
		console.error('💥 Seeding failed:', error);
		process.exit(1);
	});
}

export { seedEmulator, seedElements, seedTestUsers, clearEmulatorData };