// src/lib/services/google/client.ts
import type { StatusUpdate, ApiResponse } from '$lib/data/addon/types';
import type { GasFunction } from '$lib/data/addon/functions';

export type StatusCallback = (status: StatusUpdate) => void;

export class GoogleAppsService {
	private static instance: GoogleAppsService;
	private activeRequests = new Map<string, {
		resolve: (value: ApiResponse) => void;
		reject: (reason: any) => void;
		timer: number;
		startTime: number;
		onStatus?: StatusCallback;
	}>();
	private timeout: number;

	private constructor(timeout = 5000) {
		this.timeout = timeout;
		if (typeof window !== 'undefined') {
			this.setupMessageListener();
		}
	}

	static getInstance(timeout?: number) {
		if (!GoogleAppsService.instance) {
			GoogleAppsService.instance = new GoogleAppsService(timeout);
		}
		return GoogleAppsService.instance;
	}

	private setupMessageListener() {
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

	private handleResponse(response: any) {
		const action = response.action.replace(/Response$/, '');
		const request = this.activeRequests.get(action);
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
				data: response.data,
				executionTime
			});
		}

		this.cleanupRequest(action);
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

	async sendMessage(
		action: GasFunction,
		payload: Record<string, any> = {},
		onStatus?: StatusCallback
	): Promise<ApiResponse> {
		// Clean up any existing request
		this.cleanupRequest(action);

		return new Promise((resolve, reject) => {
			if (typeof window === 'undefined') {
				reject(new Error('Cannot send message from server context'));
				return;
			}

			const startTime = new Date().getTime();

			// Set up timeout handler
			const timer = window.setTimeout(() => {
				const executionTime = this.calculateExecutionTime(startTime);
				onStatus?.({
					type: 'error',
					message: 'Request timed out',
					executionTime
				});
				reject(new Error('Request timed out'));
				this.cleanupRequest(action);
			}, this.timeout);

			// Store request info
			this.activeRequests.set(action, {
				resolve,
				reject,
				timer,
				startTime,
				onStatus
			});

			// Initial status update
			onStatus?.({
				type: 'processing',
				message: 'Processing request...'
			});

			// Send message to Google Apps Script
			window.parent.postMessage(JSON.stringify({
				action,
				payload
			}), '*');
		});
	}

	destroy() {
		if (typeof window !== 'undefined') {
			window.removeEventListener('message', this.handleResponse.bind(this));
		}
		this.activeRequests.forEach(request => {
			clearTimeout(request.timer);
		});
		this.activeRequests.clear();
	}
}