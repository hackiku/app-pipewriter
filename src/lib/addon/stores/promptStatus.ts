// src/lib/iframe/stores/promptStatus.ts

import { writable, derived } from 'svelte/store';

export type PromptStatus = 'idle' | 'processing' | 'success' | 'error';

interface StatusState {
	status: PromptStatus;
	message: string | null;
	executionTime?: number;
}

function createPromptStatusStore() {
	const { subscribe, set, update } = writable<StatusState>({
		status: 'idle',
		message: null
	});

	return {
		subscribe,

		setProcessing: (message: string = 'Processing...') =>
			set({ status: 'processing', message }),

		setSuccess: (message: string, executionTime?: number) =>
			set({ status: 'success', message, executionTime }),

		setError: (message: string) =>
			set({ status: 'error', message }),

		reset: () =>
			set({ status: 'idle', message: null }),

		update
	};
}

export const promptStatus = createPromptStatusStore();

// Derived values for easy status checks
export const isProcessing = derived(
	promptStatus,
	$status => $status.status === 'processing'
);

export const isSuccess = derived(
	promptStatus,
	$status => $status.status === 'success'
);

export const isError = derived(
	promptStatus,
	$status => $status.status === 'error'
);