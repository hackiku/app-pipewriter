// $lib/iframe/utils/appsScript.ts

import { browser } from '$app/environment';

interface AppsScriptResponse {
	success: boolean;
	action?: string;
	error?: string;
	executionTime?: number;
	data?: any;
}

interface StatusUpdate {
	type: "processing" | "success" | "error";
	message: string;
	executionTime?: number;
}

type StatusCallback = (status: StatusUpdate) => void;

export class AppsScriptClient {
	private static instance: AppsScriptClient;
	private initialized = false;
	private activeRequests = new Map<
		string,
		{
			resolve: (value: AppsScriptResponse) => void;
			reject: (reason: any) => void;
			timer: number;
			startTime: number;
			onStatus?: StatusCallback;
		}
	>();

	private constructor(private timeout: number = 2000) {
		// Don't initialize during SSR
		if (browser) {
			this.initialize();
		}
	}

	getTimeout(): number {
		return this.timeout;
	}

	static getInstance(timeout?: number): AppsScriptClient {
		if (!AppsScriptClient.instance) {
			AppsScriptClient.instance = new AppsScriptClient(timeout);
		}
		return AppsScriptClient.instance;
	}

	private initialize() {
		if (this.initialized || !browser) return;
		try {
			window.addEventListener('message', this.handleMessage);
			this.initialized = true;
		} catch (error) {
			console.error('Failed to initialize AppsScriptClient:', error);
		}
	}

	private handleMessage = (event: MessageEvent) => {
		// Skip this in SSR
		if (!browser) return;

		// Handle direct success messages (e.g., background change)
		if (event.data === "Background changed") {
			const request = this.activeRequests.get("changeBg");
			if (request) {
				const executionTime = this.calculateExecutionTime(request.startTime);
				request.onStatus?.({
					type: "success",
					message: "Color applied successfully",
					executionTime,
				});
				request.resolve({
					success: true,
					action: "changeBg",
					executionTime,
				});
				this.cleanupRequest("changeBg");
			}
			return;
		}

		// Handle other responses
		try {
			const response = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
			if (response?.action) {
				this.handleResponse(response);
			}
		} catch (error) {
			// Ignore non-JSON messages
		}
	};

	private handleResponse(response: any) {
		const request = this.activeRequests.get(response.action);
		if (!request) return;

		const executionTime = this.calculateExecutionTime(request.startTime);

		if (response.error) {
			request.onStatus?.({
				type: "error",
				message: response.error,
				executionTime,
			});
			request.resolve({
				success: false,
				error: response.error,
				executionTime,
			});
		} else {
			request.onStatus?.({
				type: "success",
				message: "Operation completed successfully",
				executionTime,
			});
			request.resolve({
				success: true,
				...response,
				executionTime,
			});
		}

		this.cleanupRequest(response.action);
	}

	private calculateExecutionTime(startTime: number): number {
		return Math.round(new Date().getTime() - startTime);
	}

	private cleanupRequest(action: string) {
		const request = this.activeRequests.get(action);
		if (request) {
			clearTimeout(request.timer);
			this.activeRequests.delete(action);
		}
	}

	// Element-specific convenience methods
	async insertElement(elementId: string, theme?: string): Promise<AppsScriptResponse> {
		return this.sendMessage('getElement', {
			elementId,
			theme: theme || 'light'
		});
	}

	// Generic message sender
	public async sendMessage(
		action: string,
		payload: Record<string, any> = {},
		onStatus?: StatusCallback,
	): Promise<AppsScriptResponse> {
		// Skip actual API calls during SSR
		if (!browser) {
			return Promise.resolve({
				success: true,
				action,
				executionTime: 0,
				data: { ssrMock: true }
			});
		}

		// Make sure client is initialized
		if (!this.initialized) {
			this.initialize();
		}

		this.cleanupRequest(action);

		return new Promise((resolve) => {
			const startTime = new Date().getTime();

			const timer = window.setTimeout(() => {
				const executionTime = this.calculateExecutionTime(startTime);
				onStatus?.({
					type: "success",
					message: "Changes applied",
					executionTime,
				});
				resolve({
					success: true,
					action,
					executionTime,
				});
				this.cleanupRequest(action);
			}, this.timeout);

			this.activeRequests.set(action, {
				resolve,
				reject: () => { },
				timer,
				startTime,
				onStatus,
			});

			onStatus?.({
				type: "processing",
				message: "Applying changes...",
			});

			window.parent.postMessage(JSON.stringify({ action, payload }), "*");
		});
	}

	destroy() {
		if (browser && this.initialized) {
			window.removeEventListener('message', this.handleMessage);
			this.initialized = false;
			this.activeRequests.forEach((request) => {
				clearTimeout(request.timer);
			});
			this.activeRequests.clear();
		}
	}
}

// Export a default instance for backwards compatibility
export const appsScript = AppsScriptClient.getInstance();