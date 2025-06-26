// src/lib/services/google/client.ts - FIXED TIMEOUT ISSUES

import type { StatusUpdate, ApiResponse, GasFunction } from '$lib/types/appsScript';

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
	private defaultTimeout: number;
	private isInitialized = false;
	private requestCount = 0;
	private pendingMessages: any[] = [];

	private constructor(timeout = 10000) { // INCREASED: Default 10s instead of 5s
		this.defaultTimeout = timeout;
		if (typeof window !== 'undefined') {
			this.setupMessageListener();
			this.initializeConnection();
		}
	}

	static getInstance(timeout?: number) {
		if (!GoogleAppsService.instance) {
			GoogleAppsService.instance = new GoogleAppsService(timeout);
		}
		return GoogleAppsService.instance;
	}

	/**
	 * NEW: Initialize connection and handle any pending messages
	 */
	private initializeConnection() {
		// Send a ready signal to parent
		if (typeof window !== 'undefined') {
			window.parent.postMessage(JSON.stringify({
				action: 'clientReady',
				timestamp: Date.now()
			}), '*');

			// Mark as initialized after short delay to allow setup
			setTimeout(() => {
				this.isInitialized = true;
				console.log('🔗 Google Apps Service initialized');

				// Process any pending messages
				if (this.pendingMessages.length > 0) {
					console.log(`📥 Processing ${this.pendingMessages.length} pending messages`);
					this.pendingMessages.forEach(msg => this.handleResponse(msg));
					this.pendingMessages = [];
				}
			}, 500);
		}
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
					// NEW: If not initialized yet, queue the message
					if (!this.isInitialized && response.action !== 'clientReady') {
						console.log('📦 Queueing message until initialized:', response.action);
						this.pendingMessages.push(response);
						return;
					}

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
		if (!request) {
			console.log(`⚠️ No active request found for action: ${action}`);
			return;
		}

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
				executionTime,
				// Pass through element-specific fields
				tableIndex: response.tableIndex,
				message: response.message
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

	/**
	 * NEW: Get smart timeout based on request history and action type
	 */
	private getSmartTimeout(action: GasFunction): number {
		// First few requests get longer timeout (initialization delays)
		if (this.requestCount < 3) {
			return Math.max(this.defaultTimeout * 1.5, 15000); // 15s for first 3 requests
		}

		// Element creation can be slower than other operations
		if (action === 'createElement' || action === 'getElement') {
			return Math.max(this.defaultTimeout, 8000); // 8s minimum for elements
		}

		// Other operations use default timeout
		return this.defaultTimeout;
	}

	public isAvailable(): boolean {
		return typeof window !== 'undefined';
	}

	async sendMessage(
		action: GasFunction,
		payload: Record<string, any> = {},
		onStatus?: StatusCallback
	): Promise<ApiResponse> {
		// Clean up any existing request
		this.cleanupRequest(action);
		this.requestCount++;

		return new Promise((resolve, reject) => {
			if (typeof window === 'undefined') {
				reject(new Error('Cannot send message from server context'));
				return;
			}

			const startTime = new Date().getTime();
			const timeout = this.getSmartTimeout(action);

			// Enhanced status update for first requests
			if (this.requestCount <= 3) {
				onStatus?.({
					type: 'processing',
					message: 'Initializing connection...',
					details: `Request ${this.requestCount} (${action})`
				});
			} else {
				onStatus?.({
					type: 'processing',
					message: 'Processing request...'
				});
			}

			// Set up timeout handler with smart timeout
			const timer = window.setTimeout(() => {
				const executionTime = this.calculateExecutionTime(startTime);

				// MORE INFORMATIVE timeout message
				const timeoutMessage = this.requestCount <= 3
					? `Request timed out after ${timeout / 1000}s (initialization may be slow)`
					: `Request timed out after ${timeout / 1000}s`;

				console.warn(`⏰ Timeout for ${action} after ${executionTime}ms (limit: ${timeout}ms)`);

				onStatus?.({
					type: 'error',
					message: timeoutMessage,
					executionTime
				});

				reject(new Error(timeoutMessage));
				this.cleanupRequest(action);
			}, timeout);

			// Store request info
			this.activeRequests.set(action, {
				resolve,
				reject,
				timer,
				startTime,
				onStatus
			});

			// Send message to Google Apps Script
			console.log(`📤 Sending ${action} (timeout: ${timeout / 1000}s, request #${this.requestCount})`);
			window.parent.postMessage(JSON.stringify({
				action,
				payload
			}), '*');
		});
	}

	/**
	 * NEW: Warm up the connection with a simple request
	 */
	async warmUp(): Promise<void> {
		if (!this.isAvailable()) return;

		try {
			console.log('🔥 Warming up Google Apps Service connection...');
			await this.sendMessage('getCurrentColor', {}, (status) => {
				console.log('🔥 Warmup status:', status.type, status.message);
			});
			console.log('✅ Connection warmed up successfully');
		} catch (error) {
			console.warn('⚠️ Warmup failed (this is okay):', error);
		}
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

// Export a helper function for convenience
export function getGoogleService(timeout?: number): GoogleAppsService {
	return GoogleAppsService.getInstance(timeout);
}