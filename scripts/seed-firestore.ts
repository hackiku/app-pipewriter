// scripts/seed-firestore.ts
import { adminFirestore } from '../src/lib/server/firebase-admin.js';
import { elementsDb } from '../src/lib/data/addon/elements.js';

// Function to seed elements collection
async function seedElements() {
	console.log('🌱 Seeding elements collection...');

	const batch = adminFirestore.batch();

	// Convert your existing elements data to Firestore documents
	Object.entries(elementsDb).forEach(([elementId, elementData]) => {
		const elementRef = adminFirestore.collection('elements').doc(elementId);

		// Add metadata that's useful for Firestore
		const firestoreElement = {
			...elementData,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			// Ensure SVG path is stored for easy access
			svgPath: `/elements/${elementId}.svg`,
			svgPathDark: elementData.metadata?.supports?.darkMode ? `/elements/${elementId}-dark.svg` : null
		};

		batch.set(elementRef, firestoreElement);
	});

	try {
		await batch.commit();
		console.log(`✅ Successfully seeded ${Object.keys(elementsDb).length} elements`);
	} catch (error) {
		console.error('❌ Error seeding elements:', error);
	}
}

// Function to create sample users for testing
async function seedTestUsers() {
	console.log('🌱 Seeding test users...');

	const testUsers = [
		{
			uid: 'test-free-user',
			email: 'free@test.com',
			displayName: 'Free User',
			tier: 'free',
			pro: false,
			projectsCreated: 1,
			elementsUsed: 5
		},
		{
			uid: 'test-trial-user',
			email: 'trial@test.com',
			displayName: 'Trial User',
			tier: 'trial',
			pro: false,
			trialStartDate: new Date(), // Active trial
			projectsCreated: 3,
			elementsUsed: 15
		},
		{
			uid: 'test-pro-user',
			email: 'pro@test.com',
			displayName: 'Pro User',
			tier: 'pro',
			pro: true,
			projectsCreated: 10,
			elementsUsed: 50
		}
	];

	for (const userData of testUsers) {
		try {
			await adminFirestore.collection('users').doc(userData.uid).set({
				...userData,
				createdAt: new Date(),
				updatedAt: new Date(),
				lastLoginDate: new Date()
			});
			console.log(`✅ Created test user: ${userData.email}`);
		} catch (error) {
			console.error(`❌ Error creating user ${userData.email}:`, error);
		}
	}
}

// Main seeding function
async function seedDatabase() {
	console.log('🚀 Starting database seeding...');

	await seedElements();
	await seedTestUsers();

	console.log('🎉 Database seeding completed!');
	process.exit(0);
}

// Run the seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedDatabase().catch(console.error);
}

export { seedElements, seedTestUsers, seedDatabase };