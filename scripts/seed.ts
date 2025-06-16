// scripts/seed.ts - UNIFIED SEEDING SCRIPT
// Handles both dev (emulator) and production environments

import { seedElements } from './seed/seed-elements.ts';
import { seedSimplePrompts } from './seed/seed-prompts.ts';

interface SeedOptions {
	environment: 'dev' | 'prod';
	targets: ('elements' | 'prompts' | 'all')[];
	force?: boolean;
	verbose?: boolean;
}

// Environment detection
function detectEnvironment(): 'dev' | 'prod' {
	// Check explicit flags first
	if (process.env.USE_FIREBASE_EMULATOR === 'true') return 'dev';
	if (process.env.USE_FIREBASE_EMULATOR === 'false') return 'prod';

	// Check NODE_ENV
	if (process.env.NODE_ENV === 'production') return 'prod';
	if (process.env.NODE_ENV === 'development') return 'dev';

	// Check for emulator environment variables
	if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
		return 'dev';
	}

	// Check for production service account
	if (process.env.FIREBASE_SERVICE_ACCOUNT) return 'prod';

	// Default to dev for safety
	console.log('⚠️  Could not detect environment, defaulting to dev');
	return 'dev';
}

// Parse command line arguments
function parseArgs(): SeedOptions {
	const args = process.argv.slice(2);

	let environment: 'dev' | 'prod' = detectEnvironment();
	let targets: ('elements' | 'prompts' | 'all')[] = ['all'];
	let force = false;
	let verbose = false;

	args.forEach(arg => {
		if (arg === '--dev' || arg === '-d') environment = 'dev';
		if (arg === '--prod' || arg === '-p') environment = 'prod';
		if (arg === '--force' || arg === '-f') force = true;
		if (arg === '--verbose' || arg === '-v') verbose = true;
		if (arg === '--elements') targets = ['elements'];
		if (arg === '--prompts') targets = ['prompts'];
		if (arg === '--all') targets = ['all'];
	});

	return { environment, targets, force, verbose };
}

// Safety checks
function validateEnvironment(environment: 'dev' | 'prod'): boolean {
	if (environment === 'prod') {
		if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
			console.error('❌ FIREBASE_SERVICE_ACCOUNT required for production seeding');
			return false;
		}

		// Extra safety check for production
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
		if (serviceAccount.project_id !== 'pipewriter-app') {
			console.error('❌ Wrong project ID in service account. Expected: pipewriter-app');
			return false;
		}
	}

	return true;
}

// Main seeding function
async function runSeeding(options: SeedOptions): Promise<boolean> {
	const { environment, targets, force, verbose } = options;

	console.log(`🌱 Starting seeding process...`);
	console.log(`   Environment: ${environment.toUpperCase()}`);
	console.log(`   Targets: ${targets.join(', ')}`);
	console.log(`   Force: ${force}`);
	console.log('');

	// Set environment variables
	process.env.USE_FIREBASE_EMULATOR = environment === 'dev' ? 'true' : 'false';

	if (environment === 'dev') {
		console.log('🔧 Using Firebase emulator');
		console.log('   Firestore: http://localhost:8080');
		console.log('   Auth: http://localhost:9099');
	} else {
		console.log('🔥 Using Firebase production');
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
		console.log(`   Project: ${serviceAccount.project_id}`);
	}
	console.log('');

	let success = true;
	let results: { [key: string]: boolean } = {};

	// Seed elements
	if (targets.includes('all') || targets.includes('elements')) {
		console.log('📦 Seeding elements...');
		try {
			const elementsSuccess = await seedElements();
			results.elements = elementsSuccess;
			if (!elementsSuccess) success = false;
			console.log('');
		} catch (error) {
			console.error('❌ Elements seeding failed:', error.message);
			results.elements = false;
			success = false;
		}
	}

	// Seed prompts
	if (targets.includes('all') || targets.includes('prompts')) {
		console.log('📝 Seeding prompts...');
		try {
			const promptsSuccess = await seedSimplePrompts();
			results.prompts = promptsSuccess;
			if (!promptsSuccess) success = false;
			console.log('');
		} catch (error) {
			console.error('❌ Prompts seeding failed:', error.message);
			results.prompts = false;
			success = false;
		}
	}

	// Results summary
	console.log('📊 Seeding Results:');
	Object.entries(results).forEach(([target, result]) => {
		console.log(`   ${target}: ${result ? '✅' : '❌'}`);
	});
	console.log('');

	if (success) {
		console.log('🎉 Seeding completed successfully!');
		console.log('');

		if (environment === 'dev') {
			console.log('👀 View your data:');
			console.log('   Firestore UI: http://localhost:4000/firestore');
			console.log('   Elements: http://localhost:4000/firestore/data/elements');
			console.log('   Prompts: http://localhost:4000/firestore/data/prompts');
		} else {
			console.log('👀 View your data:');
			console.log('   Firebase Console: https://console.firebase.google.com/project/pipewriter-app');
		}

		console.log('');
		console.log('🚀 Ready to test your app!');
	} else {
		console.log('💥 Seeding failed. Check errors above.');
		process.exit(1);
	}

	return success;
}

// CLI help
function showHelp() {
	console.log(`
🌱 Pipewriter Unified Seeding Script

Usage:
  bun run scripts/seed.ts [options]

Options:
  --dev, -d          Force development (emulator) mode
  --prod, -p         Force production mode
  --elements         Seed only elements
  --prompts          Seed only prompts  
  --all              Seed everything (default)
  --force, -f        Force overwrite existing data
  --verbose, -v      Verbose logging
  --help, -h         Show this help

Examples:
  bun run scripts/seed.ts                    # Auto-detect env, seed all
  bun run scripts/seed.ts --dev --elements   # Dev mode, elements only
  bun run scripts/seed.ts --prod --prompts   # Prod mode, prompts only
  bun run scripts/seed.ts --prod --force     # Prod mode, force overwrite

Environment Detection:
  1. USE_FIREBASE_EMULATOR env var
  2. NODE_ENV env var
  3. Presence of emulator env vars
  4. Presence of FIREBASE_SERVICE_ACCOUNT
  5. Defaults to dev for safety
	`);
}

// Main execution
async function main() {
	const args = process.argv.slice(2);

	if (args.includes('--help') || args.includes('-h')) {
		showHelp();
		process.exit(0);
	}

	const options = parseArgs();

	// Validate environment
	if (!validateEnvironment(options.environment)) {
		process.exit(1);
	}

	// Production safety check
	if (options.environment === 'prod' && !options.force) {
		console.log('⚠️  Production seeding detected!');
		console.log('   This will modify live data.');
		console.log('   Add --force flag to proceed.');
		console.log('');
		process.exit(1);
	}

	try {
		await runSeeding(options);
	} catch (error) {
		console.error('💥 Fatal seeding error:', error);
		process.exit(1);
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}

export { runSeeding, detectEnvironment };