// lib/utils/environment.ts

export function getEnvironment(): 'dev' | 'prod' {
	// 1. Explicit override
	if (process.env.USE_FIREBASE_EMULATOR === 'true') return 'dev';
	if (process.env.USE_FIREBASE_EMULATOR === 'false') return 'prod';

	// 2. Service account = production
	if (process.env.FIREBASE_SERVICE_ACCOUNT) return 'prod';

	// 3. NODE_ENV
	if (process.env.NODE_ENV === 'production') return 'prod';

	// 4. Default to dev
	return 'dev';
}