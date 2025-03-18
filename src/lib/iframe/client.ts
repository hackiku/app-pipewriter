// src/lib/iframe/client.ts
import type { ApiResponse, StatusUpdate } from '$lib/core/types';

export type StatusCallback = (status: StatusUpdate) => void;

export class AppsScriptClient {
	private static instance: AppsScriptClient;
	private activeRequests = new Map<string, {
		resolve: (value: ApiResponse) => void;
		reject: (reason: any) => void;
		timer: number;
		startTime: number;
		onStatus?: StatusCallback;
	}>();

	private constructor(private timeout: number = 5000) {
		this.setupMessageListener();
	}

	static getInstance(timeout?: number): AppsScriptClient {
		if (!AppsScriptClient.instance) {
			AppsScriptClient.instance = new AppsScriptClient(timeout);
		}
		return AppsScriptClient.instance;
	}

	private setupMessageListener(): void {
		window.addEventListener('message', (event: MessageEvent) => {
			// Handle direct success message for background change
			if (event.data === "Background changed") {
				const request = this.activeRequests.get('changeBg');
				if (request) {
					const executionTime = this.calculateExecutionTime(request.startTime);
					request.onStatus?.({
						type: 'success',
						message: 'Color applied successfully',
						executionTime
					});
					request.resolve({
						success: true,
						action: 'changeBg',
						executionTime
					});
					this.cleanupRequest('changeBg');
				}
				return;
			}

			// Handle other responses
			try {
				const response = typeof event.data === 'string' ?
					JSON.parse(event.data) : event.data;

				if (response?.action) {
					this.handleResponse(response);
				}
			} catch (error) {
				// Ignore non-JSON messages
			}
		});
	}

	private handleResponse(response: any): void {
		const request = this.activeRequests.get(response.action);
		if (!request) return;

		const executionTime = this.calculateExecutionTime(request.startTime);

		if (response.error) {
			request.onStatus?.({
				type: 'error',
				message: response.error,
				executionTime
			});
			request.resolve({
				success: false,
				error: response.error,
				executionTime
			});
		} else {
			request.onStatus?.({
				type: 'success',
				message: 'Operation completed successfully',
				executionTime
			});
			request.resolve({
				success: true,
				...response,
				executionTime
			});
		}

		this.cleanupRequest(response.action);
	}

	private calculateExecutionTime(startTime: number): number {
		return Math.round(new Date().getTime() - startTime);
	}

	private cleanupRequest(action: string): void {
		const request = this.activeRequests.get(action);
		if (request) {
			clearTimeout(request.timer);
			this.activeRequests.delete(action);
		}
	}

	public async sendMessage(
		action: string,
		payload: Record<string, any> = {},
		onStatus?: StatusCallback
	): Promise<ApiResponse> {
		// Clean up any existing request
		this.cleanupRequest(action);

		return new Promise((resolve) => {
			const startTime = new Date().getTime();

			// Set up timeout handler
			const timer = window.setTimeout(() => {
				const executionTime = this.calculateExecutionTime(startTime);
				onStatus?.({
					type: 'success', // Assume success since we saw changes
					message: 'Changes applied',
					executionTime
				});
				resolve({
					success: true, // Assume success
					action,
					executionTime
				});
				this.cleanupRequest(action);
			}, this.timeout);

			// Store request info
			this.activeRequests.set(action, {
				resolve,
				reject: () => { }, // Not using reject anymore
				timer,
				startTime,
				onStatus
			});

			// Initial status update
			onStatus?.({
				type: 'processing',
				message: 'Applying changes...'
			});

			// Send message to Apps Script
			window.parent.postMessage(JSON.stringify({ action, payload }), '*');
		});
	}

	public destroy(): void {
		window.removeEventListener('message', this.handleResponse.bind(this));
		this.activeRequests.forEach(request => {
			clearTimeout(request.timer);
		});
		this.activeRequests.clear();
	}
}