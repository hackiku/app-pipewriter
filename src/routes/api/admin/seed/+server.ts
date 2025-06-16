// src/routes/api/admin/seed/+server.ts
import { json } from '@sveltejs/kit';
import { runSeeding } from '../../../../scripts/seed.js';
import { dev } from '$app/environment';

/**
 * POST /api/admin/seed
 * Trigger seeding from admin panel
 * Body: { targets: string[], force?: boolean, environment?: 'dev' | 'prod' }
 */
export async function POST({ request, locals }) {
	// Admin check
	if (!dev && !locals.user?.email?.includes('@pipewriter.io')) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const {
			targets = ['all'],
			force = false,
			environment = dev ? 'dev' : 'prod'
		} = await request.json();

		console.log(`🌱 Admin seeding request from ${locals.user.email}`);
		console.log(`   Targets: ${targets.join(', ')}`);
		console.log(`   Environment: ${environment}`);
		console.log(`   Force: ${force}`);

		// Validate targets
		const validTargets = ['elements', 'prompts', 'all'];
		const invalidTargets = targets.filter((t: string) => !validTargets.includes(t));

		if (invalidTargets.length > 0) {
			return json({
				success: false,
				error: 'Invalid targets',
				invalidTargets,
				validTargets
			}, { status: 400 });
		}

		// Run seeding
		const success = await runSeeding({
			environment,
			targets,
			force,
			verbose: true
		});

		return json({
			success,
			targets,
			environment,
			force,
			triggeredBy: locals.user.email,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ Admin seeding failed:', error);
		return json({
			success: false,
			error: 'Seeding failed',
			details: error.message
		}, { status: 500 });
	}
}

/**
 * GET /api/admin/seed/status
 * Get seeding status and environment info
 */
export async function GET({ locals }) {
	// Admin check
	if (!dev && !locals.user?.email?.includes('@pipewriter.io')) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	if (!locals.authenticated || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { detectEnvironment } = await import('../../../../scripts/seed.js');

	try {
		// Import firebase admin to check collections
		const { adminFirestore } = await import('$lib/server/firebase-admin');

		// Check elements count
		const elementsSnapshot = await adminFirestore
			.collection('elements')
			.where('active', '==', true)
			.get();

		// Check system prompts count
		const promptsSnapshot = await adminFirestore
			.collection('prompts')
			.where('active', '==', true)
			.where('isSystem', '==', true)
			.get();

		const status = {
			environment: {
				detected: detectEnvironment(),
				dev: dev,
				hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
				hasEmulatorVars: !!(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST)
			},
			collections: {
				elements: {
					count: elementsSnapshot.size,
					lastUpdate: elementsSnapshot.docs[0]?.data()?.updatedAt?.toDate()?.toISOString()
				},
				systemPrompts: {
					count: promptsSnapshot.size,
					lastUpdate: promptsSnapshot.docs[0]?.data()?.updatedAt?.toDate()?.toISOString()
				}
			},
			availableTargets: ['elements', 'prompts', 'all'],
			recommendations: []
		};

		// Add recommendations
		if (status.collections.elements.count === 0) {
			status.recommendations.push('Seed elements collection');
		}
		if (status.collections.systemPrompts.count === 0) {
			status.recommendations.push('Seed system prompts collection');
		}

		return json({
			success: true,
			status
		});

	} catch (error) {
		console.error('❌ Failed to get seeding status:', error);
		return json({
			success: false,
			error: 'Failed to get status',
			details: error.message
		}, { status: 500 });
	}
}

// ====================================================================
// Updated package.json scripts section
// ====================================================================

/*
{
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"prepare": "svelte-kit sync || echo ''",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"format": "prettier --write .",
		"lint": "prettier --check .",

		// === UNIFIED SEEDING SCRIPTS ===
		"seed": "bun run scripts/seed.ts",
		"seed:dev": "bun run scripts/seed.ts --dev",
		"seed:prod": "bun run scripts/seed.ts --prod --force",
		"seed:elements": "bun run scripts/seed.ts --elements",
		"seed:prompts": "bun run scripts/seed.ts --prompts",
		"seed:dev:elements": "bun run scripts/seed.ts --dev --elements",
		"seed:dev:prompts": "bun run scripts/seed.ts --dev --prompts",
		"seed:prod:elements": "bun run scripts/seed.ts --prod --elements --force",
		"seed:prod:prompts": "bun run scripts/seed.ts --prod --prompts --force",

		// === FIREBASE EMULATOR ===
		"emulators": "firebase emulators:start",
		"emulators:ui": "firebase emulators:start --only hosting,firestore,auth,functions --import=./emulator-data",
		"emulators:export": "firebase emulators:export ./emulator-data",
		"emulators:clear": "firebase emulators:exec --only firestore 'echo Clearing data...'",

		// === DEVELOPMENT WORKFLOWS ===
		"dev:fresh": "npm run emulators:clear && npm run seed:dev && npm run dev",
		"dev:setup": "concurrently \"firebase emulators:start\" \"wait-on http://localhost:8080 && bun run seed:dev\"",

		// === LEGACY (kept for backwards compatibility) ===
		"seed:elements:old": "bun run scripts/seed/seed-elements.ts",
		"seed:prompts:old": "bun run scripts/seed/seed-prompts.ts",
		"seed:prod:old": "bun run scripts/seed-production.ts",

		// === STORE (WIP) ===
		"seed:store": "bun run scripts/store/seed-store.ts",
		"seed:store:simple": "bun run scripts/store/simple-seed-store.ts",
		"verify:store": "bun run scripts/store/verify-store-data.ts"
	}
}
*/

// ====================================================================
// Example usage commands for documentation
// ====================================================================

/*
UNIFIED SEEDING COMMANDS:

Development (Emulator):
	bun run seed:dev                    # Auto-detect dev, seed everything
	bun run seed:dev:elements           # Dev mode, elements only
	bun run seed:dev:prompts            # Dev mode, prompts only
	bun run seed --dev --verbose        # Dev mode, verbose logging

Production:
	bun run seed:prod                   # Production, requires --force
	bun run seed:prod:elements          # Production, elements only
	bun run seed:prod:prompts           # Production, prompts only
	bun run seed --prod --force         # Production with force flag

Auto-detection:
	bun run seed                        # Auto-detect environment
	bun run seed --elements             # Auto-detect, elements only
	bun run seed --prompts              # Auto-detect, prompts only

Development workflows:
	bun run dev:fresh                   # Clear emulator + seed + dev server
	bun run dev:setup                   # Start emulator + seed in parallel

Environment variables for control:
	USE_FIREBASE_EMULATOR=true bun run seed     # Force emulator
	USE_FIREBASE_EMULATOR=false bun run seed    # Force production
	NODE_ENV=development bun run seed           # Dev mode
	NODE_ENV=production bun run seed            # Prod mode (requires service account)

API endpoints:
	POST /api/admin/seed                # Trigger seeding from admin panel
	GET  /api/admin/seed/status         # Check seeding status
	POST /api/prompts/restore-defaults  # Restore user prompts to defaults
	POST /api/admin/reprovision-prompts # Bulk re-provision users
*/